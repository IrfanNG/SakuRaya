
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Plus, Users, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'

type Recipient = {
    id: string
    name: string
    amount: number
    category: 'Family' | 'Relatives' | 'Friends' | 'Others'
    created_at: string
}

export default function RecipientsPage() {
    const supabase = createClient()
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState<string>('Family')
    const [adding, setAdding] = useState(false)

    // Fetch initial data
    useEffect(() => {
        const fetchRecipients = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('recipients')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setRecipients(data as Recipient[])
            setLoading(false)
        }

        fetchRecipients()

        // Real-time subscription
        const channel = supabase
            .channel('realtime recipients')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'recipients',
                },
                (payload) => {
                    // Refresh data on any change for simplicity or handle optimistically
                    fetchRecipients()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleAddRecipient = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdding(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.from('recipients').insert([
            {
                user_id: user.id,
                name,
                amount: parseFloat(amount),
                category,
            },
        ]).select()

        if (!error && data) {
            // Updated to use functional update to avoid stale state
            setRecipients((prev) => [data[0] as Recipient, ...prev])
            setName('')
            setAmount('')
            setCategory('Family') // Reset to default
            toast.success("Recipient added successfully!")
        }
        setAdding(false)
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('recipients').delete().eq('id', id)
        if (!error) {
            // Updated to use functional update to avoid stale state
            setRecipients((prev) => prev.filter(r => r.id !== id))
            toast.success("Recipient removed.")
        }
    }

    // Calculations
    const totalAmount = recipients.reduce((sum, r) => sum + Number(r.amount), 0)
    const totalCount = recipients.length

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Family': return 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20'
            case 'Relatives': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
            case 'Friends': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
            default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
            {/* Summary Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Needed</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">RM {totalAmount.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">For all recipients</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{totalCount}</div>
                                <p className="text-xs text-muted-foreground">People in your list</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Form Section */}
                <div className="md:col-span-4 lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Recipient</CardTitle>
                            <CardDescription>Add someone to your Duit Raya list.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddRecipient} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Mak Long"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (RM)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="50.00"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Family">Family</SelectItem>
                                            <SelectItem value="Relatives">Relatives</SelectItem>
                                            <SelectItem value="Friends">Friends</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full" disabled={adding}>
                                    {adding ? 'Adding...' : <><Plus className="mr-2 h-4 w-4" /> Add Recipient</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="md:col-span-8 lg:col-span-9">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Recipients List</CardTitle>
                            <CardDescription>Manage who you are giving Duit Raya to.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Amount (RM)</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map((i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : recipients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-[400px]">
                                                    <EmptyState
                                                        icon={Users}
                                                        title="No recipients yet"
                                                        description="Start planning your barakah! Add your first recipient to see them here."
                                                        actionLabel="Add First Recipient"
                                                        onAction={() => document.getElementById('name')?.focus()}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            recipients.map((recipient) => (
                                                <TableRow key={recipient.id}>
                                                    <TableCell className="font-medium">{recipient.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={getCategoryColor(recipient.category)}>
                                                            {recipient.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {Number(recipient.amount).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                            onClick={() => handleDelete(recipient.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
