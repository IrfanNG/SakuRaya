
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { PageTransition } from '@/components/page-transition'
import { motion } from 'framer-motion'

const formContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const formItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setError('Check your email for the confirmation link.')
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
        }
    }

    return (
        <PageTransition className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[400px] ambient-border bg-card">
                <CardHeader className="text-center">
                    <CardTitle>Welcome to SakuRaya</CardTitle>
                    <CardDescription>
                        Plan your barakah. Login to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <motion.form variants={formContainer} initial="hidden" animate="show" onSubmit={handleLogin} className="space-y-4 pt-4">
                                <motion.div variants={formItem} className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                <motion.div variants={formItem} className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                        {error}
                                    </motion.div>
                                )}
                                <motion.div variants={formItem}>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </motion.div>
                            </motion.form>
                        </TabsContent>
                        <TabsContent value="register">
                            <motion.form variants={formContainer} initial="hidden" animate="show" onSubmit={handleSignUp} className="space-y-4 pt-4">
                                <motion.div variants={formItem} className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                <motion.div variants={formItem} className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                        {error}
                                    </motion.div>
                                )}
                                <motion.div variants={formItem}>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Creating Account...' : 'Sign Up'}
                                    </Button>
                                </motion.div>
                            </motion.form>
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={handleGoogleLogin}
                    >
                        Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:underline">
                        Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </PageTransition>
    )
}
