import { Settings2, Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/hooks/use-currency";
import { CURRENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function CustomizationToggle() {
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-md border-primary/20 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-primary/10 hover:border-primary/40 group">
                    <Settings2 className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-500 group-hover:rotate-90" />
                    <span className="sr-only">Open customization</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] flex flex-col p-0 gap-0 border-l-primary/10">
                <SheetHeader className="p-4 border-b bg-accent/5">
                    <SheetTitle className="text-xl font-bold text-primary flex items-center gap-2">
                        <Settings2 className="h-5 w-5" /> Customization
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground/80">
                        Personalize your dashboard experience and currency settings.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col min-h-0 p-4 space-y-8 overflow-hidden">
                    {/* Theme Section */}
                    <div className="shrink-0 space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 px-1">
                            Visual Theme
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "light", icon: Sun, label: "Light" },
                                { id: "dark", icon: Moon, label: "Dark" },
                                { id: "system", icon: Laptop, label: "System" },
                            ].map((item) => (
                                <Button
                                    key={item.id}
                                    variant={theme === item.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme(item.id)}
                                    className={cn(
                                        "flex flex-col h-auto py-3 gap-2 transition-all duration-300",
                                        theme === item.id ? "shadow-md scale-[1.02]" : "hover:border-primary/30 hover:bg-primary/5"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", theme === item.id ? "" : "text-muted-foreground")} />
                                    <span className="text-[11px] font-medium">{item.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator className="opacity-50 shrink-0" />

                    {/* Currency Section */}
                    <div className="flex-1 flex flex-col min-h-0 space-y-4 pb-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 px-1 shrink-0">
                            Primary Currency
                        </h4>
                        <div className="flex-1 min-h-0 border rounded-xl bg-accent/5 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-2 space-y-1">
                                    {CURRENCIES.map((curr) => (
                                        <button
                                            key={curr.code}
                                            onClick={() => setCurrency(curr)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-2 py-3.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden",
                                                currency.code === curr.code
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-colors",
                                                    currency.code === curr.code ? "bg-white/20" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                                )}>
                                                    {curr.symbol}
                                                </div>
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span className="font-semibold">{curr.code}</span>
                                                    <span className={cn(
                                                        "text-[10px] transition-colors",
                                                        currency.code === curr.code ? "text-primary-foreground/70" : "text-muted-foreground/60 group-hover:text-primary/70"
                                                    )}>
                                                        {curr.name}
                                                    </span>
                                                </div>
                                            </div>
                                            {currency.code === curr.code && (
                                                <Check className="h-4 w-4 relative z-10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/30">
                    <p className="text-[11px] text-muted-foreground text-center font-medium">
                        Changes are saved automatically to your device.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
