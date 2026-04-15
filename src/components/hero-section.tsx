import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const features = [
    { id: 1, color: "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]", text: "Zero Tracking", delay: 0 },
    { id: 2, color: "bg-accent", text: "Offline First", delay: 0.1 },
    { id: 3, color: "bg-secondary", text: "Smart Insights", delay: 0.2 },
]

export function HeroSection() {
    return (
        <section className="flex flex-col items-center justify-center text-center py-20 min-h-screen relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6 max-w-4xl"
            >
                <div className="inline-block px-4 py-1.5 mb-2 border border-primary/20 bg-primary/5 rounded-full text-primary text-sm font-medium">
                    Your Personal Finance Companion
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 leading-tight">
                    Where Did Your <br />
                    <span className="text-primary italic">Money</span> Go?
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Track every coin, discover hidden spending patterns, and take full control of your financial future.
                    Simple, private, and always on your side.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button size="lg" className="rounded-full px-8 text-lg font-semibold h-14 cursor-pointer" asChild>
                        <a href="#manage-expenses">Start Tracking Now</a>
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full px-8 text-lg font-semibold h-14 cursor-pointer" asChild>
                        <a href="#features">Explore Features</a>
                    </Button>
                </div>
            </motion.div>

            <motion.div
                className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-muted-foreground/80 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
            >
                {features.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <motion.div
                            className={`h-2 w-2 rounded-full ${item.color}`}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: item.delay,
                                ease: "easeInOut"
                            }}
                        />
                        <span>{item.text}</span>
                    </div>
                ))}
            </motion.div>

            <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
                <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
            </motion.div>
        </section>
    );
}
