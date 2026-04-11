import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getUser } from '@/api/user'
import { signOut } from '@/api/auth'

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        // Skip initialization if Supabase keys are missing or are placeholders
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('your-supabase')) {
            setLoading(false);
            return;
        }

        const getUserSession = async () => {
            try {
                const user = await getUser()
                setUser(user)
            } catch (error) {
                console.error("Supabase User Error:", error);
            } finally {
                setLoading(false)
            }
        }

        getUserSession()

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, _session) => {
                switch (event) {
                    case 'SIGNED_IN':
                        getUserSession()
                        break
                    case 'SIGNED_OUT':
                        setUser(null)
                        break
                    case "USER_UPDATED":
                        getUserSession()
                        break
                }
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        user,
        loading,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
