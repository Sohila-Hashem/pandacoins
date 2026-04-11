import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthMenu() {
    const { user, signOut, loading } = useAuth();

    if (loading) {
        return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link to="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/auth/signup"><Button size="sm">Get Started</Button></Link>
            </div>
        );
    }

    const displayName = user.user_metadata?.full_name || user.email;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border">
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary uppercase font-bold">
                        {displayName?.charAt(0) || <User className="h-5 w-5" />}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-not-allowed opacity-50">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard (Coming Soon)</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-not-allowed opacity-50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings (Coming Soon)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
