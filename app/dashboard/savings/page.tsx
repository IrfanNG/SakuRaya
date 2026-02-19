'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PiggyBank, Calendar, Trash2, Plus } from "lucide-react"

type SavingsEntry = {
    id: string
    month: string
    amount: number
    created_at: string
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export default function SavingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<SavingsEntry[]>([])
    const [totalBudget, setTotalBudget] = useState(0)
    const [month, setMonth] = useState<string>(MONTHS[new Date().getMonth()])
    const [amount, setAmount] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch savings log
        const { data: savingsData } = await supabase
            .from('savings_log')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (savingsData) setEntries(savingsData as SavingsEntry[])

        // Fetch total budget goal
        const { data: profileData } = await supabase
            .from('profiles')
            .select('total_budget')
            .eq('id', user.id)
            .single()

        if (profileData) setTotalBudget(profileData.total_budget || 0)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('savings_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'savings_log' },
                () => fetchData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleAddSavings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.from('savings_log').insert({
            user_id: user.id,
            month,
            amount: parseFloat(amount)
        }).select()

        if (!error && data) {
            setAmount("")
            setEntries((prev) => [data[0] as SavingsEntry, ...prev])
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('savings_log').delete().eq('id', id)
        if (!error) {
            setEntries((prev) => prev.filter(e => e.id !== id))
        }
    }

    const totalSaved = entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
    const progress = totalBudget > 0 ? (totalSaved / totalBudget) * 100 : 0
    const remaining = totalBudget - totalSaved

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full h-full">
            <div className="flex items-center gap-2">
                <PiggyBank className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Savings Tracker</h1>
                    <p className="text-muted-foreground">Track your monthly savings for Raya.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Progress Card */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Goal Progress</CardTitle>
                        <CardDescription>Target: RM {totalBudget.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Total Saved</span>
                                <div className="text-4xl font-bold text-primary">RM {totalSaved.toFixed(2)}</div>
                            </div>
                            <div className="text-xl font-bold text-muted-foreground">{progress.toFixed(1)}%</div>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                            {remaining > 0
                                ? `You need RM ${remaining.toFixed(2)} more to reach your goal.`
                                : "Goal reached! 🎉"}
                        </p>
                    </CardContent>
                </Card>

                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Log Savings</CardTitle>
                        <CardDescription>Add a new entry.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddSavings} className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Month</label>
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount (RM)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "Saving..." : <><Plus className="mr-2 h-4 w-4" /> Log Savings</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* History List */}
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No savings logged yet.</div>
                        ) : (
                            entries.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{entry.month}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg">RM {entry.amount.toFixed(2)}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
