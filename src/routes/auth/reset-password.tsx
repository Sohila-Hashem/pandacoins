import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Logo } from '@/components/shared/logo'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import { ChevronLeftIcon } from 'lucide-react'
import { usePasswordRecovery } from '@/hooks/use-password-recovery'
import { InvalidResetSession } from '@/components/auth/invalid-reset-session'
import { LoadingOverlay } from '@/components/shared/loading-overlay'

export const Route = createFileRoute('/auth/reset-password')({
    component: ResetPasswordPage,
})

function ResetPasswordPage() {
    const navigate = useNavigate()
    const { state, error, updatePassword } = usePasswordRecovery()

    const onSubmit = async (password: string) => {
        await updatePassword(password)
        navigate({ to: '/auth/login', replace: true, search: { reset: 'success' } })
    }

    if (state === 'loading') {
        return <LoadingOverlay description='Please wait while we validate your reset session.' />
    }

    if (state === 'invalid') {
        return <InvalidResetSession />
    }

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
                    <div className='mb-8 flex flex-col items-center justify-center gap-4 text-center'>
                        <Logo className='gap-3' />
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight'>New password</h1>
                            <p className='text-muted-foreground mt-2'>Set a strong password to protect your account.</p>
                        </div>
                    </div>

                    <Card className='border-primary/10 shadow-2xl backdrop-blur-xl bg-card/40'>
                        <CardHeader className='pb-2'>
                            <CardDescription className='text-base text-center'>
                                Please enter a new password to update your account security.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='pt-4 space-y-6'>
                            <ResetPasswordForm onSubmit={onSubmit} />

                            {error && <p className='text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded-lg'>{error}</p>}

                            <div className="pt-4 border-t border-primary/5">
                                <Link to='/auth/login' className='group mx-auto flex w-fit items-center gap-2 text-primary font-medium hover:underline'>
                                    <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-1' />
                                    <span>Back to login</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}