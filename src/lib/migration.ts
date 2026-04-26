/**
 * One-time localStorage migration from the old domain to the new domain.
 *
 * Strategy: iframe + postMessage
 *   1. A hidden iframe is created pointing to /migrate-out.html on the OLD domain.
 *   2. Once loaded, a MIGRATION_PING is sent to the iframe.
 *   3. The old domain page reads its localStorage and replies with MIGRATION_PONG.
 *   4. This module writes the received keys into the NEW domain's localStorage
 *      (existing keys are never overwritten).
 *   5. A migration flag is set so this never runs again.
 */

const OLD_DOMAIN_ORIGIN = "https://where-did-my-money-go.vercel.app";
const MIGRATION_FLAG_KEY = "migration_v1_done";
const TIMEOUT_MS = 10_000;

export function runMigrationIfNeeded(): void {
    // Only run on the new domain in a real browser context
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
        return;
    }

    // Already migrated — nothing to do
    if (localStorage.getItem(MIGRATION_FLAG_KEY) !== null) {
        return;
    }

    // Skip when running locally (not the new production domain)
    if (window.location.hostname !== "pandacoins.vercel.app") {
        return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = `${OLD_DOMAIN_ORIGIN}/migrate-out.html`;
    iframe.style.cssText = "display:none;width:0;height:0;border:none;position:absolute;";
    iframe.setAttribute("aria-hidden", "true");

    let settled = false;

    const cleanup = () => {
        settled = true;
        window.removeEventListener("message", onMessage);
        if (iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    };

    // Timeout — if the old domain is unreachable, fail silently
    const timer = window.setTimeout(() => {
        if (!settled) {
            console.warn("[migration] Timed out waiting for old domain. Skipping migration.");
            // Mark as done so we don't retry on every page load while old domain is down
            localStorage.setItem(MIGRATION_FLAG_KEY, "timeout");
            cleanup();
        }
    }, TIMEOUT_MS);

    const onMessage = (event: MessageEvent) => {
        if (event.origin !== OLD_DOMAIN_ORIGIN) return;
        if (!event.data || event.data.type !== "MIGRATION_PONG") return;

        clearTimeout(timer);

        const payload: Record<string, string> = event.data.payload ?? {};
        let migratedCount = 0;

        for (const [key, value] of Object.entries(payload)) {
            // Migrate if the key is absent, or if it holds an empty array
            // (empty array = no real data on the new domain yet)
            const existing = localStorage.getItem(key);
            const isEmptyArray = existing !== null && (() => {
                try { const p = JSON.parse(existing); return Array.isArray(p) && p.length === 0; }
                catch { return false; }
            })();

            if (existing === null || isEmptyArray) {
                try {
                    localStorage.setItem(key, value as string);
                    migratedCount++;
                } catch (err) {
                    console.error(`[migration] Failed to write key "${key}":`, err);
                }
            }
        }

        localStorage.setItem(MIGRATION_FLAG_KEY, "done");
        console.info(`[migration] Complete. ${migratedCount} key(s) migrated.`);
        cleanup();
    };

    window.addEventListener("message", onMessage);

    iframe.addEventListener("load", () => {
        if (settled) return;
        iframe.contentWindow?.postMessage(
            { type: "MIGRATION_PING" },
            OLD_DOMAIN_ORIGIN
        );
    });

    iframe.addEventListener("error", () => {
        clearTimeout(timer);
        console.warn("[migration] Failed to load old domain iframe. Skipping migration.");
        localStorage.setItem(MIGRATION_FLAG_KEY, "error");
        cleanup();
    });

    document.body.appendChild(iframe);
}
