import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { updatePassword } from '@/api/auth'

type RecoveryState = 'loading' | 'valid' | 'invalid'

export function usePasswordRecovery() {
    const [state, setState] = useState<RecoveryState>('loading')
    const [error, setError] = useState<string | null>(null)

    useEffect(function detectInvalidLink() {
        let isRecovery = false

        if (window.location.hash) {
            // check if there is an error
            const hash = window.location.hash.substring(1)
            const params = new URLSearchParams(hash)
            const error = params.get('error')

            if (error) {
                setError(error)
                setState('invalid')
                return
            }
        }

        // Listen for Supabase recovery event
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    isRecovery = true
                    setState('valid')
                    return
                }

                if (!session && !isRecovery) {
                    setState('invalid')
                    return
                }
            }
        )

        // Fallback check (important)
        const fallback = setTimeout(async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session && !isRecovery) {
                setState('invalid')
                return
            } else if (session) {
                setState('valid')
                return
            }
        }, 800)

        return () => {
            listener.subscription.unsubscribe()
            clearTimeout(fallback)
        }
    }, [])

    // 🔐 Update password
    const updatePasswordWrapper = async (password: string) => {
        try {
            setError(null)

            await updatePassword(password)
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('An unexpected error occurred')
            }
        }
    }

    return {
        state,          // 'loading' | 'valid' | 'invalid'
        error,
        updatePassword: updatePasswordWrapper,
    }
}