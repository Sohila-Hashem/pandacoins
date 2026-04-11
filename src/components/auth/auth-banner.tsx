import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";

export function AuthBanner() {
    const { user, loading } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            // Show banner after a short delay for guests
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [user, loading]);

    if (loading || user || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-primary/10 border-b border-primary/20 py-3 relative z-50 text-center flex items-center justify-center gap-4 px-8"
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span>Want to sync your data across devices? Sign up now to unlock cloud features later!</span>
                    <Link to="/auth/signup">
                        <Button variant="link" className="h-auto p-0 font-bold underline">
                            Register for free
                        </Button>
                    </Link>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/20"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
        </AnimatePresence>
    );
}
