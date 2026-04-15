import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface LogoProps {
    readonly className?: string;
    readonly showText?: boolean;
}
export function Logo({ className, showText = true }: LogoProps) {
    return (
        <div className={cn(`flex items-center gap-1`, className)}>
            <motion.div
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.8
                }}
            >
                <div className="relative">
                    <motion.div
                        className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <img src="/favicon.png" alt="PandaCoins Logo" className="relative w-12 object-contain" />
                </div>
            </motion.div>
            {showText && <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">PandaCoins</h1>}
        </div>
    );
}