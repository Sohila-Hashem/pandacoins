import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PasswordStrength } from './password-strength'
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth-schema"
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

interface ResetPasswordFormProps {
    onSubmit: (password: string) => Promise<void>
}

const ResetPasswordForm = ({ onSubmit }: ResetPasswordFormProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const password = useWatch({
        control,
        name: "password",
    });

    const handleFormSubmit = async (data: ResetPasswordFormData) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data.password)
        } catch (error) {
            console.error('Error resetting password:', error)
            toast.error('Error resetting password')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className='space-y-4' onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Password */}
            <Field className='w-full'>
                <FieldLabel htmlFor='password'>
                    New Password*
                </FieldLabel>
                <div className='relative'>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='password'
                                type={isPasswordVisible ? 'text' : 'password'}
                                placeholder='Enter new password'
                                className='pr-9'
                            />
                        )}
                    />
                    <Button
                        variant='ghost'
                        size='icon'
                        type='button'
                        className='absolute inset-y-0 right-0'
                        onClick={() => setIsPasswordVisible(prevState => !prevState)}
                    >
                        {isPasswordVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        <span className='sr-only'>{isPasswordVisible ? 'Hide password' : 'Show password'}</span>
                    </Button>
                </div>
                <FieldError errors={[errors.password]} />
                <PasswordStrength password={password || ""} />
            </Field>

            {/* Confirm Password */}
            <Field className='w-full'>
                <FieldLabel htmlFor='confirmPassword'>
                    Confirm Password*
                </FieldLabel>
                <div className='relative'>
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='confirmPassword'
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                placeholder='Confirm new password'
                                className='pr-9'
                            />
                        )}
                    />
                    <Button
                        variant='ghost'
                        size='icon'
                        type='button'
                        onClick={() => setIsConfirmPasswordVisible(prevState => !prevState)}
                        className='absolute inset-y-0 right-0'
                    >
                        {isConfirmPasswordVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        <span className='sr-only'>{isConfirmPasswordVisible ? 'Hide password' : 'Show password'}</span>
                    </Button>
                </div>
                <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button className='w-full' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Setting...' : 'Set New Password'}
            </Button>
        </form>
    )
}

export default ResetPasswordForm
