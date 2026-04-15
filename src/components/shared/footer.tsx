import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="border-t py-12 bg-accent/5">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-xl">
                <div className="flex justify-center gap-4 mb-6">
                    <img src="/favicon.png" alt="PandaCoins" className="w-12 h-12 opacity-80 cursor-pointer" />
                </div>
                <p className="mb-4">
                    Your transparency and privacy are our top priorities.
                    Your data is stored locally in your browser and never leaves your device.
                </p>
                <Separator decorative className="my-6 w-1/3 mx-auto" />
                <p className="flex items-center justify-center text-sm italic">
                    @{new Date().getFullYear()} <span className="font-bold text-primary px-1"><a href="https://github.com/sohila-hashem" target="_blank" rel="noopener noreferrer">StormCode</a></span>. All rights reserved.
                </p>
            </div>
        </footer>
    )
}