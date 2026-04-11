import { supabase } from "@/lib/supabase/client";

export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signUp(email: string, password: string, data: any) {
    const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data,
        },
    });
    if (error) throw error;
    return signUpData;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function sendForgotPasswordEmail(email: string, redirectTo?: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
    return data;
}

export async function updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
        password,
    });
    if (error) throw error;
    return data;
}