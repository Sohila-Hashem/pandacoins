import type { SVGAttributes } from 'react'

export const BackgroundShape = (props: SVGAttributes<SVGElement>) => {
    return (
        <svg
            width='600'
            height='600'
            viewBox='0 0 600 600'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className="animate-pulse-slow"
            {...props}
        >
            {/* Soft Organic Centered Blob */}
            <circle
                cx='300'
                cy='300'
                r='280'
                fill='var(--primary)'
                fillOpacity='0.08'
            />

            {/* Secondary Accent Blob */}
            <circle
                cx='480'
                cy='120'
                r='100'
                fill='var(--accent)'
                fillOpacity='0.06'
            />

            {/* Abstract Bamboo strokes (Panda theme) */}
            <g stroke='var(--primary)' strokeOpacity='0.2' strokeWidth='3' strokeLinecap='round'>
                <path d='M150 150L210 210' />
                <path d='M170 130L230 190' />
                <path d='M190 110L250 170' />
            </g>

            {/* Decorative Dots */}
            <g fill='var(--primary)' fillOpacity='0.3'>
                <circle cx='500' cy='450' r='3' />
                <circle cx='530' cy='450' r='3' />
                <circle cx='560' cy='450' r='3' />
                <circle cx='500' cy='480' r='3' />
                <circle cx='530' cy='480' r='3' />
                <circle cx='560' cy='480' r='3' />
            </g>

            {/* Subtle Outer Ring */}
            <circle
                cx='300'
                cy='300'
                r='298'
                stroke='var(--primary)'
                strokeOpacity='0.05'
                strokeWidth='1'
            />
        </svg>
    )
}

