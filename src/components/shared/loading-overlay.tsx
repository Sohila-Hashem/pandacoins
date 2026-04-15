import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/shared/logo'
import { BackgroundShape } from '@/assets/shapes/background-shape'
import { Loader2Icon } from 'lucide-react'


interface LoadingOverlayProps {
    readonly description?: string
}
export function LoadingOverlay({ description }: LoadingOverlayProps) {
    return (
        <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
            <div className='absolute'>
                <BackgroundShape />
            </div>

            <Card className='z-10 w-full border-none shadow-md sm:max-w-md'>
                <CardHeader className='gap-2'>
                    <div className='flex items-center justify-between gap-2'>
                        <Logo />
                        <Loader2Icon className='size-6 animate-spin' />
                    </div>

                    <div>
                        <CardDescription className='text-base'>
                            {description || 'Please wait while we load your data.'}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}