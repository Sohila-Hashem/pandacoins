import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from '@/hooks/use-auth'
import { z } from 'zod'
import { useEffect } from 'react'
import { toast } from 'sonner'


export const Route = createFileRoute('/auth/login')({
    component: LoginPage,
    validateSearch: z.object({
        reset: z.enum(['success']).optional(),
    }),
})

function LoginPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const isResetSuccess = useSearch({ from: Route.fullPath, select: (search) => search.reset === 'success' })

    useEffect(function showResetSuccessToast() {
        if (isResetSuccess) {
            toast.success('Password reset successfully. Please log in.')
        }
    }, [isResetSuccess])


    if (user && !isResetSuccess) {
        navigate({ to: '/', replace: true })
    }

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden flex items-center justify-center">
            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-60 dark:opacity-40 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px] animate-bounce-slow" />
            </div>

            <main className="relative z-10 w-full px-4 py-12 flex items-center justify-center">
                <div className="w-full max-w-5xl">
                    <LoginForm />
                </div>
            </main>
        </div>
    )
}
