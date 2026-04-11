import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shared/logo";
import { DesktopNavbar } from "@/components/shared/desktop-nav";
import { MobileNav } from "@/components/shared/mobile-nav";


export function Navbar() {
    return (
        <div className="flex justify-between items-center gap-2 w-full p-4">
            <Link to="/">
                <Logo />
            </Link>
            <div className="hidden md:block">
                <DesktopNavbar />
            </div>
            <div className="md:hidden">
                <MobileNav />
            </div>
        </div>
    );
}