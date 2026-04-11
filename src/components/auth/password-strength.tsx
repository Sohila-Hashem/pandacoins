import { validatePasswordStrength } from "@/lib/utils"
import { motion } from "motion/react"

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const { score, label } = validatePasswordStrength(password)

    if (!password) return null

    return (
        <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider">
                <span className="text-muted-foreground/70">Security Level</span>
                <span className={
                    score <= 2 ? "text-destructive" :
                    score === 3 ? "text-orange-500" :
                    score === 4 ? "text-blue-500" :
                    "text-emerald-500"
                }>
                    {label}
                </span>
            </div>
            <div className="flex gap-1.5 h-1 w-full">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className="h-full flex-1 rounded-full bg-muted/20 overflow-hidden relative"
                    >
                        <motion.div
                            initial={false}
                            animate={{ 
                                width: index <= score ? "100%" : "0%",
                                backgroundColor: index <= score ? (
                                    score <= 2 ? "var(--color-destructive)" :
                                    score === 3 ? "#f59e0b" : // amber-500
                                    score === 4 ? "#3b82f6" : // blue-500
                                    "#10b981" // emerald-500
                                ) : "transparent"
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full absolute inset-0"
                        />
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                <Requirement met={password.length >= 8} label="8+ chars" />
                <Requirement met={/[A-Z]/.test(password)} label="Uppercase" />
                <Requirement met={/[a-z]/.test(password)} label="Lowercase" />
                <Requirement met={/\d/.test(password)} label="Number" />
                <Requirement met={/[^A-Za-z0-9]/.test(password)} label="Symbol" />
            </div>
        </div>
    )
}

function Requirement({ met, label }: { met: boolean; label: string }) {
    return (
        <div className="flex items-center gap-1.5 transition-colors duration-300">
            <div className={`size-1 rounded-full ${met ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30"}`} />
            <span className={`text-[10px] ${met ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                {label}
            </span>
        </div>
    )
}
