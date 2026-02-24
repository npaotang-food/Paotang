'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    is_admin?: boolean;
    points: number;
    tier: 'Silver' | 'Gold' | 'Platinum';
    initials: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadProfile = async (userId: string, email: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data);
        } else {
            // fallback profile if table not yet set up
            const initials = email.slice(0, 2).toUpperCase();
            setProfile({
                id: userId,
                name: email.split('@')[0],
                email,
                points: 0,
                tier: 'Silver',
                initials,
            });
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id, session.user.email ?? '');
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    loadProfile(session.user.id, session.user.email ?? '');
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const register = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        return { error: error?.message ?? null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user, profile, session,
            isLoggedIn: !!user,
            isAdmin: !!profile?.is_admin,
            isLoading,
            login, register, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
