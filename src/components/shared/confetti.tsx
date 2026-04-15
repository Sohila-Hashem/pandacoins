import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ConfettiProps {
    trigger: boolean;
}

type ConfettiPiece = {
    id: number;
    color: string;
    x: number;
    delay: number;
    duration: number;
    rotation: number;
    size: number;
    shape: 'circle' | 'square' | 'triangle';
};

const getSecureRandomNumber = (min: number, max: number) => {
    const range = max - min + 1;
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    return min + (randomBytes[0] % range);
}

const generateConfetti = () => {
    const colors = ["bg-primary", "bg-accent", "bg-secondary", "bg-chart-1", "bg-chart-2", "bg-yellow-400", "bg-pink-400"];
    const shapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];

    const newPieces = Array.from({ length: 120 }, (_, i) => ({
        id: i,
        color: colors[getSecureRandomNumber(0, colors.length - 1)],
        shape: shapes[getSecureRandomNumber(0, shapes.length - 1)],
        x: 40 + getSecureRandomNumber(0, 20), // Start near the center horizontal
        delay: getSecureRandomNumber(0, 0.5),
        duration: getSecureRandomNumber(2.5, 4.5),
        rotation: getSecureRandomNumber(0, 720),
        size: 6 + getSecureRandomNumber(0, 6),
    }));

    return newPieces;
}

export function Confetti({ trigger }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (trigger) {
            const newPieces = generateConfetti();
            setPieces(newPieces);
            const timer = setTimeout(() => setPieces([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute ${p.color} ${p.shape === 'circle' ? 'rounded-full' : ''}`}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        bottom: "-20px",
                        clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0, x: 0 }}
                    animate={{
                        y: [-20, -600 - getSecureRandomNumber(0, 400), 1000], // Fountain up then fall
                        x: [0, (getSecureRandomNumber(0, 1) - 0.5) * 800], // Spread wide
                        rotate: p.rotation,
                        opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for physics feel
                    }}
                />
            ))}
        </div>
    );
}
