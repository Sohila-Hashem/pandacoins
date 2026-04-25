import { motion, type Variants } from "motion/react";
import {
    ShieldCheck,
    Zap,
    SmartphoneNfc,
    FileText,
    Gift,
    Database,
    ArrowLeftRight,
    MousePointerClick,
    Settings2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BetaBadge } from "./shared/badges";

const features = [
    {
        id: 1,
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: "Extreme Simplicity",
        description: "Designed for speed and ease of use. Track your expenses in seconds with zero friction."
    },
    {
        id: 2,
        icon: <MousePointerClick className="w-8 h-8 text-blue-500" />,
        title: "No Account Needed",
        description: "Start tracking immediately with no sign-up, Get started in seconds."
    },
    {
        id: 3,
        icon: <Gift className="w-8 h-8 text-orange-500" />,
        title: "100% Free",
        description: "No hidden fees, no subscriptions, and no ads. Every single feature is completely free."
    },
    {
        id: 4,
        icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
        title: "Privacy First",
        description: "Your financial data stays on your device. We don't track or sell your information."
    },
    {
        id: 5,
        icon: <FileText className="w-8 h-8 text-accent" />,
        title: "Straight to the Point",
        description: "Text-based, human-readable analytics. No complex charts—just clear summaries of your spending."
    },
    {
        id: 6,
        icon: <Settings2 className="w-8 h-8 text-violet-500" />,
        title: "Fully Customizable",
        description: "Track in any currency and organize your spending with custom categories that fit your lifestyle."
    },
    {
        id: 7,
        icon: <SmartphoneNfc className="w-8 h-8 text-emerald-500" />,
        title: "Offline Support",
        description: "Install it as a PWA and use it seamlessly without an internet connection. Your data stays with you, always."
    },
    {
        id: 8,
        icon: <ArrowLeftRight className="w-8 h-8 text-rose-500" />,
        title: "Trend Comparison",
        description: "Compare months with a single click. Understand how your habits evolve over time."
    },
    {
        id: 9,
        icon: <Database className="w-8 h-8 text-indigo-500" />,
        title: "Local Sovereignty",
        description: "Export and import your data anytime. You are the master of your records.",
        badge: <BetaBadge />
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export function FeaturesHighlight() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-5 md:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Master Your Money with <span className="text-primary italic">Simplicity</span>
                    </motion.h2>
                    <motion.p
                        className="text-lg text-muted-foreground"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        PandaCoins provides the tools you need to track, analyze, and optimize your spending with zero friction.
                    </motion.p>
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature) => (
                        <motion.div key={feature.id} variants={itemVariants} className="relative">
                            <Card className="h-full border-none bg-accent/5 backdrop-blur-sm hover:bg-accent/10 transition-colors group">
                                <CardContent className="p-8 space-y-4">
                                    <div className="p-3 bg-background rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <div className="absolute top-4 right-4">
                                        {feature?.badge}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Subtle background flair */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-accent/10 blur-3xl rounded-full" />
        </section>
    );
}
