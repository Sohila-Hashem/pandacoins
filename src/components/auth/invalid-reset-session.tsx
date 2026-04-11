import { BackgroundShape } from '@/assets/shapes/background-shape'
import { Logo } from '@/components/shared/logo'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function InvalidResetSession() {
    return (
        <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
            <div className='absolute'>
                <BackgroundShape />
            </div>

            <Card className='z-1 w-full border-none shadow-md sm:max-w-md'>
                <CardHeader className='gap-6'>
                    <Logo />

                    <div>
                        <CardTitle className='mb-1.5 text-xl text-red-400'>Invalid or expired reset link</CardTitle>
                        <CardDescription className='text-base'>
                            The reset link you provided is invalid or has expired. Please request a new reset link to continue.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}
