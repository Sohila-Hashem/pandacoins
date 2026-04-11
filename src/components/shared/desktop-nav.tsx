import { AuthMenu } from "@/components/auth/auth-menu";

export function DesktopNavbar() {
    return (
        <div className="flex items-center gap-3 p-4">
            <AuthMenu />
        </div>
    );
}