import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (email: string, password: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const signIn = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    const signUp = async (email: string, password: string) => {
        return await supabase.auth.signUp({ email, password })
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut, signIn, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
