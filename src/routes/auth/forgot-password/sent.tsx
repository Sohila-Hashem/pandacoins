import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeftIcon, MailCheckIcon } from 'lucide-react'

export const Route = createFileRoute('/auth/forgot-password/sent')({
    component: ForgotPasswordSent,
})

function ForgotPasswordSent() {
    return (
        <div className='min-h-screen bg-background relative overflow-x-hidden flex items-center justify-center'>
            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-60 dark:opacity-40 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px] animate-bounce-slow" />
            </div>

            <main className='relative z-10 w-full px-4 py-12 flex items-center justify-center'>
                <div className='w-full max-w-md'>
                    <Card className='border-primary/10 shadow-2xl backdrop-blur-xl bg-card/40 overflow-hidden'>
                        <div className="bg-primary/10 p-8 flex justify-center border-b border-primary/5">
                            <div className="bg-background/80 p-4 rounded-full shadow-inner">
                                <MailCheckIcon className="w-12 h-12 text-primary" />
                            </div>
                        </div>
                        <CardHeader className='gap-2 pt-5 text-center flex flex-col items-center justify-center'>
                            <CardTitle className='text-2xl font-bold tracking-tight'>Check your email</CardTitle>
                            <CardDescription className='text-base leading-relaxed'>
                                We've sent a reset link to your email address. Please check your inbox and spam folder.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='pb-5'>
                            <Link to='/auth/login' className='group mx-auto flex w-fit items-center gap-2 text-primary font-medium hover:underline'>
                                <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-1' />
                                <span>Back to login</span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
