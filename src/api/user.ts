import { supabase } from "@/lib/supabase/client";

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return data;
}

export async function updateProfile(profile: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return data;
}

export async function updateEmail(email: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from("profiles")
        .update({ email })
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return data;
}

// TODO: Implement updateAvatar