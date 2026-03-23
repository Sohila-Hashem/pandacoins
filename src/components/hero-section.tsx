import { motion } from "motion/react";

export function HeroSection() {
    return (
        <div className="text-center space-y-4 py-8">
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

                    <img src="/favicon.png" alt="PandaCoins Logo" className="relative w-85 object-contain" />
                </div>
            </motion.div>

            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">PandaCoins</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Track your expenses, discover spending patterns, and finally answer that age-old question:
                    "Where does it all go?" Spoiler alert: probably bamboo and treats. 🐼️✨
                </p>
            </motion.div>

            <motion.div
                className="flex flex-wrap justify-center gap-6 pt-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                {[
                    { color: "bg-primary", text: "Easy expense tracking", delay: 0 },
                    { color: "bg-accent", text: "Smart monthly insights", delay: 0.1 },
                    { color: "bg-secondary", text: "Month-to-month comparisons", delay: 0.2 },
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + item.delay, duration: 0.4 }}
                    >
                        <motion.div
                            className={`h-2 w-2 rounded-full ${item.color}`}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: item.delay,
                                ease: "easeInOut"
                            }}
                        />
                        <span className="text-muted-foreground">{item.text}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}