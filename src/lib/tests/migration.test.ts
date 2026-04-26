import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { runMigrationIfNeeded } from "@/lib/migration";

// ─── Constants (mirror the module's private values) ───────────────────────────

const OLD_DOMAIN_ORIGIN = "https://where-did-my-money-go.vercel.app";
const NEW_DOMAIN_HOST = "pandacoins.vercel.app";
const MIGRATION_FLAG_KEY = "migration_v1_done";

const STORAGE_KEYS = {
    EXPENSES: "expenses",
    CURRENCY: "currency",
    CUSTOM_CATEGORIES: "custom_categories",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fire a synthetic message event on window, mimicking a postMessage from the old domain. */
function dispatchPong(payload: Record<string, string>, origin = OLD_DOMAIN_ORIGIN) {
    const event = new MessageEvent("message", {
        data: { type: "MIGRATION_PONG", payload },
        origin,
    });
    window.dispatchEvent(event);
}

/** Find the iframe appended to document.body by the migration logic. */
function getMigrationIframe(): HTMLIFrameElement | null {
    return document.body.querySelector<HTMLIFrameElement>(
        `iframe[src^="${OLD_DOMAIN_ORIGIN}"]`
    );
}

/** Simulate the iframe's load event so the PING is sent. */
function triggerIframeLoad() {
    const iframe = getMigrationIframe();
    if (!iframe) return;
    iframe.dispatchEvent(new Event("load"));
}

/** Simulate the iframe's error event. */
function triggerIframeError() {
    const iframe = getMigrationIframe();
    if (!iframe) return;
    iframe.dispatchEvent(new Event("error"));
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    // Reset localStorage
    localStorage.clear();

    // Default to the new production hostname
    vi.spyOn(window, "location", "get").mockReturnValue({
        ...window.location,
        hostname: NEW_DOMAIN_HOST,
    } as Location);

    // Mock iframe contentWindow.postMessage so it doesn't throw in jsdom
    vi.spyOn(HTMLIFrameElement.prototype, "contentWindow", "get").mockReturnValue({
        postMessage: vi.fn(),
    } as unknown as Window);

    vi.useFakeTimers();
});

afterEach(() => {
    // Flush any pending timers so hanging migrations hit their timeout and
    // remove their "message" listeners before the next test starts.
    vi.runAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Clean up any lingering iframes
    document.body.querySelectorAll("iframe").forEach((el) => el.remove());
});

// ─── Early-exit guards ────────────────────────────────────────────────────────

describe("runMigrationIfNeeded — early-exit guards", () => {
    it("does nothing when migration flag is already set to 'done'", () => {
        localStorage.setItem(MIGRATION_FLAG_KEY, "done");

        runMigrationIfNeeded();

        expect(getMigrationIframe()).toBeNull();
    });

    it("does nothing when migration flag is set to 'timeout'", () => {
        localStorage.setItem(MIGRATION_FLAG_KEY, "timeout");

        runMigrationIfNeeded();

        expect(getMigrationIframe()).toBeNull();
    });

    it("does nothing when hostname is not the new production domain", () => {
        vi.spyOn(window, "location", "get").mockReturnValue({
            ...window.location,
            hostname: "localhost",
        } as Location);

        runMigrationIfNeeded();

        expect(getMigrationIframe()).toBeNull();
    });

    it("does nothing when window is undefined (SSR environment)", () => {
        const originalWindow = globalThis.window;
        // @ts-expect-error — intentionally removing window to simulate SSR
        delete globalThis.window;

        try {
            // Must not throw
            expect(() => runMigrationIfNeeded()).not.toThrow();
        } finally {
            globalThis.window = originalWindow;
        }
    });
});

// ─── iframe creation ──────────────────────────────────────────────────────────

describe("runMigrationIfNeeded — iframe creation", () => {
    it("appends a hidden iframe pointing to the old domain migrate-out page", () => {
        runMigrationIfNeeded();

        const iframe = getMigrationIframe();
        expect(iframe).not.toBeNull();
        expect(iframe?.src).toBe(`${OLD_DOMAIN_ORIGIN}/migrate-out.html`);
        expect(iframe?.getAttribute("aria-hidden")).toBe("true");
    });

    it("sends a MIGRATION_PING to the old domain when the iframe loads", () => {
        runMigrationIfNeeded();

        const postMessageMock =
            getMigrationIframe()?.contentWindow?.postMessage as ReturnType<typeof vi.fn>;

        triggerIframeLoad();

        expect(postMessageMock).toHaveBeenCalledWith(
            { type: "MIGRATION_PING" },
            OLD_DOMAIN_ORIGIN
        );
    });
});

// ─── Successful migration ─────────────────────────────────────────────────────

describe("runMigrationIfNeeded — successful data migration", () => {
    const payload = {
        [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1", amount: 100 }]),
        [STORAGE_KEYS.CURRENCY]: JSON.stringify({ code: "EGP", symbol: "E£" }),
        [STORAGE_KEYS.CUSTOM_CATEGORIES]: JSON.stringify(["Food", "Transport"]),
    };

    it("writes all keys from the payload into localStorage", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong(payload);

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe(payload[STORAGE_KEYS.EXPENSES]);
        expect(localStorage.getItem(STORAGE_KEYS.CURRENCY)).toBe(payload[STORAGE_KEYS.CURRENCY]);
        expect(localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES)).toBe(
            payload[STORAGE_KEYS.CUSTOM_CATEGORIES]
        );
    });

    it("sets the migration flag to 'done' after a successful migration", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong(payload);

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("done");
    });

    it("removes the iframe from the DOM after migration completes", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong(payload);

        expect(getMigrationIframe()).toBeNull();
    });

    it("handles an empty payload without errors", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({});

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("done");
    });
});

// ─── No-overwrite guarantee ───────────────────────────────────────────────────

describe("runMigrationIfNeeded — no-overwrite guarantee", () => {
    it("does not overwrite a key that already exists in the new domain's localStorage", () => {
        const existingValue = JSON.stringify([{ id: "existing" }]);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, existingValue);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({
            [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "old-domain-data" }]),
        });

        // Original value must be preserved
        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe(existingValue);
    });

    it("migrates missing keys while preserving existing ones", () => {
        const existingCurrency = JSON.stringify({ code: "USD", symbol: "$" });
        localStorage.setItem(STORAGE_KEYS.CURRENCY, existingCurrency);

        const oldExpenses = JSON.stringify([{ id: "1" }]);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({
            [STORAGE_KEYS.EXPENSES]: oldExpenses,
            [STORAGE_KEYS.CURRENCY]: JSON.stringify({ code: "EGP", symbol: "E£" }),
        });

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe(oldExpenses);
        expect(localStorage.getItem(STORAGE_KEYS.CURRENCY)).toBe(existingCurrency);
    });
});

// ─── Empty-array merge ────────────────────────────────────────────────────────

describe("runMigrationIfNeeded — empty-array merge", () => {
    it("migrates expenses when the new domain has an empty array for that key", () => {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));

        const oldExpenses = JSON.stringify([{ id: "1", amount: 50 }]);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: oldExpenses });

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe(oldExpenses);
    });

    it("migrates custom_categories when the new domain has an empty array for that key", () => {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify([]));

        const oldCategories = JSON.stringify(["Food", "Transport"]);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({ [STORAGE_KEYS.CUSTOM_CATEGORIES]: oldCategories });

        expect(localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES)).toBe(oldCategories);
    });

    it("does NOT overwrite when the new domain already has a non-empty array", () => {
        const existingExpenses = JSON.stringify([{ id: "existing" }]);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, existingExpenses);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({
            [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "old-domain-data" }]),
        });

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe(existingExpenses);
    });

    it("does NOT overwrite a non-array key (e.g. currency) even if it was set to a falsy-ish value", () => {
        const existingCurrency = JSON.stringify({ code: "USD", symbol: "$" });
        localStorage.setItem(STORAGE_KEYS.CURRENCY, existingCurrency);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({
            [STORAGE_KEYS.CURRENCY]: JSON.stringify({ code: "EGP", symbol: "E£" }),
        });

        expect(localStorage.getItem(STORAGE_KEYS.CURRENCY)).toBe(existingCurrency);
    });

    it("does NOT overwrite a key whose stored value is corrupt/invalid JSON", () => {
        // Corrupt value — JSON.parse will throw; the catch returns false,
        // so isEmptyArray is false and the key must not be overwritten.
        localStorage.setItem(STORAGE_KEYS.EXPENSES, "not-valid-json{{");

        const oldExpenses = JSON.stringify([{ id: "1" }]);

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: oldExpenses });

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBe("not-valid-json{{");
    });
});

// ─── Security: origin validation ──────────────────────────────────────────────

describe("runMigrationIfNeeded — origin validation", () => {
    it("ignores messages from an unknown origin", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong(
            { [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1" }]) },
            "https://evil.com"
        );

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBeNull();
        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBeNull();
    });

    it("ignores messages with an unexpected type", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();

        const event = new MessageEvent("message", {
            data: { type: "SOME_OTHER_EVENT", payload: {} },
            origin: OLD_DOMAIN_ORIGIN,
        });
        window.dispatchEvent(event);

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBeNull();
    });
});

// ─── Timeout handling ─────────────────────────────────────────────────────────

describe("runMigrationIfNeeded — timeout handling", () => {
    it("sets the migration flag to 'timeout' when the old domain does not respond", () => {
        runMigrationIfNeeded();

        vi.runAllTimers();

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("timeout");
    });

    it("removes the iframe from the DOM after a timeout", () => {
        runMigrationIfNeeded();

        vi.runAllTimers();

        expect(getMigrationIframe()).toBeNull();
    });

    it("does not double-settle when a PONG arrives after the timeout", () => {
        runMigrationIfNeeded();

        // Trigger timeout first
        vi.runAllTimers();

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("timeout");

        // A late PONG must not overwrite the flag or re-add data
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "late" }]) });

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("timeout");
        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBeNull();
    });
});

// ─── iframe load error ────────────────────────────────────────────────────────

describe("runMigrationIfNeeded — iframe error handling", () => {
    it("sets the migration flag to 'error' when the iframe fails to load", () => {
        runMigrationIfNeeded();
        triggerIframeError();

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("error");
    });

    it("removes the iframe from the DOM after a load error", () => {
        runMigrationIfNeeded();
        triggerIframeError();

        expect(getMigrationIframe()).toBeNull();
    });
});

// ─── localStorage.setItem failure ─────────────────────────────────────────────

describe("runMigrationIfNeeded — localStorage write failure", () => {
    it("logs an error and continues when localStorage.setItem throws for a key", () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        // Make setItem throw only for the specific storage key, not for the flag write
        vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string) => {
            if (key === STORAGE_KEYS.EXPENSES) {
                throw new DOMException("QuotaExceededError");
            }
        });

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1" }]) });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `[migration] Failed to write key "${STORAGE_KEYS.EXPENSES}":`,
            expect.any(DOMException)
        );
    });

    it("still sets the migration flag to 'done' even when a key write fails", () => {
        // Capture the native implementation BEFORE the spy wraps the prototype
        const realSetItem = localStorage.setItem.bind(localStorage);

        vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => {
            if (key === STORAGE_KEYS.EXPENSES) {
                throw new DOMException("QuotaExceededError");
            }
            realSetItem(key, value);
        });

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1" }]) });

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe("done");
    });

    it("migrates other keys successfully even when one key write fails", () => {
        // Capture the native implementation BEFORE the spy wraps the prototype
        const realSetItem = localStorage.setItem.bind(localStorage);

        vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => {
            if (key === STORAGE_KEYS.EXPENSES) {
                throw new DOMException("QuotaExceededError");
            }
            realSetItem(key, value);
        });

        const currencyValue = JSON.stringify({ code: "EGP", symbol: "E£" });

        runMigrationIfNeeded();
        triggerIframeLoad();
        dispatchPong({
            [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1" }]),
            [STORAGE_KEYS.CURRENCY]: currencyValue,
        });

        expect(localStorage.getItem(STORAGE_KEYS.EXPENSES)).toBeNull();
        expect(localStorage.getItem(STORAGE_KEYS.CURRENCY)).toBe(currencyValue);
    });
});

// ─── Settled-state guards ──────────────────────────────────────────────────────

describe("runMigrationIfNeeded — settled-state guards", () => {
    it("does not send a second PING if the iframe load event fires after the migration has already settled", () => {
        runMigrationIfNeeded();
        triggerIframeLoad();

        const postMessageMock =
            getMigrationIframe()?.contentWindow?.postMessage as ReturnType<typeof vi.fn>;

        // Settle by completing migration via PONG
        dispatchPong({ [STORAGE_KEYS.EXPENSES]: JSON.stringify([{ id: "1" }]) });

        // At this point the iframe is removed but its reference is still valid;
        // simulate a late load event firing (e.g. from a slow network)
        const iframe = document.body.querySelector("iframe") ?? document.createElement("iframe");
        iframe.dispatchEvent(new Event("load"));

        // postMessage should still only have been called once (before settlement)
        expect(postMessageMock).toHaveBeenCalledTimes(1);
    });

    it("does not send a PING when the iframe loads after a timeout has already settled the migration", () => {
        runMigrationIfNeeded();

        const postMessageMock =
            getMigrationIframe()?.contentWindow?.postMessage as ReturnType<typeof vi.fn>;

        // Trigger timeout first to settle the migration
        vi.runAllTimers();

        // A late load event must be a no-op
        const iframe = document.body.querySelector("iframe") ?? document.createElement("iframe");
        iframe.dispatchEvent(new Event("load"));

        expect(postMessageMock).not.toHaveBeenCalled();
    });
});

// ─── iframe.contentWindow is null ─────────────────────────────────────────────

describe("runMigrationIfNeeded — null contentWindow", () => {
    it("does not throw when iframe.contentWindow is null at load time", () => {
        vi.spyOn(HTMLIFrameElement.prototype, "contentWindow", "get").mockReturnValue(null);

        runMigrationIfNeeded();

        expect(() => triggerIframeLoad()).not.toThrow();
    });
});
