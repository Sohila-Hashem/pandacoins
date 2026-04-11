import { AuthMenu } from "@/components/auth/auth-menu";
export function MobileNav() {
    return (
        <div className="flex justify-between items-center gap-2 w-full">
            <AuthMenu />
        </div>
    );
}
