import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

interface AdminAuthContextType {
	session: Session | null
	loading: boolean
	isAdmin: boolean
	signIn: (email: string, password: string) => Promise<{ error: Error | null }>
	signOut: () => Promise<{ error: Error | null }>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Check if user is logged in on mount
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setLoading(false)
		}).catch((error) => {
			console.error('Error getting session:', error)
			setLoading(false)
		})

		// Listen for auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setLoading(false)
		})

		return () => subscription?.unsubscribe()
	}, [])

	const signIn = async (email: string, password: string) => {
		const { error, data } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		if (!error && data?.session) {
			setSession(data.session)
		}
		return { error }
	}

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()
		setSession(null)
		return { error }
	}

	const isAdmin = session?.user?.email?.endsWith('@admin.local') || false

	return (
		<AdminAuthContext.Provider
			value={{
				session,
				loading,
				isAdmin,
				signIn,
				signOut
			}}
		>
			{children}
		</AdminAuthContext.Provider>
	)
}

export function useAdminAuth() {
	const context = useContext(AdminAuthContext)
	if (context === undefined) {
		throw new Error('useAdminAuth must be used within an AdminAuthProvider')
	}
	return context
}
