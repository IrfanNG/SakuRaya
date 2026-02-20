'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { MoonPhaseLoader } from '@/components/moon-loader'

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [totalBudget, setTotalBudget] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUserId(user.id)
                setEmail(user.email || '')

                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, total_budget')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setFullName(data.full_name || '')
                    setTotalBudget(data.total_budget || '')
                } else if (error && error.code !== 'PGRST116') {
                    toast.error("Failed to load profile data.")
                }
            } else {
                router.push('/login')
            }
            setLoading(false)
        }

        fetchProfile()
    }, [supabase, router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return

        setSaving(true)

        const budgetValue = parseFloat(totalBudget)
        if (isNaN(budgetValue)) {
            toast.error("Total budget must be a valid number.")
            setSaving(false)
            return
        }

        const updates = {
            id: userId,
            full_name: fullName,
            total_budget: budgetValue,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)

        if (error) {
            toast.error("Failed to update profile.")
            console.error(error)
        } else {
            toast.success("Profile updated successfully!")
            router.refresh()
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <PageTransition className="flex items-center justify-center min-h-[50vh]">
                <MoonPhaseLoader />
            </PageTransition>
        )
    }

    return (
        <PageTransition className="max-w-2xl w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-6 hidden md:block">Profile</h1>

            <Card className="ambient-border bg-card">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                        Update your personal information and total Duit Raya budget.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Your email address is managed by your sign-in provider.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="e.g. Irfan NG"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalBudget">Total Budget (RM)</Label>
                            <Input
                                id="totalBudget"
                                type="number"
                                step="any"
                                min="0"
                                placeholder="e.g. 1000"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">This sets your global total budget for dashboard calculations.</p>
                        </div>

                        <Button type="submit" disabled={saving} className="w-full sm:w-auto mt-4">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageTransition>
    )
}
