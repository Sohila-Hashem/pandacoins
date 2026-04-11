import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendForgotPasswordEmail } from '@/api/auth'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth-schema"
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

export function ForgotPasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true)
        try {
            await sendForgotPasswordEmail(data.email)
            navigate({ to: '/auth/forgot-password/sent', replace: true })
        } catch (error) {
            console.error('Error sending forgot password email:', error)
            toast.error('Error sending forgot password email')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className='border-primary/10 shadow-2xl backdrop-blur-xl bg-card/40 w-full max-w-md px-6 py-12'>
            <CardHeader className='space-y-1 text-center pb-2'>
                <div className='flex flex-col items-center justify-center gap-2 text-center'>
                    <img src="/favicon.png" alt="Logo" className='w-20 h-20' />
                    <h1 className='text-3xl font-bold tracking-tight'>Reset access</h1>
                    <CardDescription className='text-base'>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                    <Field>
                        <FieldLabel htmlFor='email'>
                            Email address*
                        </FieldLabel>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type='email'
                                    id='email'
                                    placeholder='Enter your email address'
                                />
                            )}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Button className='w-full' type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
