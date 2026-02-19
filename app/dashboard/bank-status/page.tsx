'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { MALAYSIAN_BANKS } from "@/lib/banks"

type BankStatus = {
    id: string
    bank_name: string
    location: string // Changed from branch_location
    crowd_level: number // Changed to number
    created_at: string
}

export default function BankStatusPage() {
    const supabase = createClient()
    const [searchTerm, setSearchTerm] = useState("")
    const [statuses, setStatuses] = useState<BankStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBank, setSelectedBank] = useState<string | null>(null)
    const [location, setLocation] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch initial data
    const fetchStatuses = async () => {
        const { data, error } = await supabase
            .from('bank_status')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100) // Get last 100 reports to map to banks

        if (data) {
            setStatuses(data as BankStatus[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStatuses()

        // Real-time subscription
        const channel = supabase
            .channel('bank_status_feed')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bank_status' }, // Listen to ALL events
                (payload) => {
                    const newItem = payload.new as BankStatus
                    if (payload.eventType === 'INSERT') {
                        setStatuses((prev) => [newItem, ...prev])
                    }
                    else if (payload.eventType === 'UPDATE') {
                        // Move updated item to the top because it has a new timestamp
                        setStatuses((prev) => {
                            const filtered = prev.filter(item => item.id !== newItem.id)
                            return [newItem, ...filtered]
                        })
                    }
                    else if (payload.eventType === 'DELETE') {
                        setStatuses((prev) => prev.filter(item => item.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleReport = async (status: 'smooth' | 'moderate' | 'packed') => {
        if (!selectedBank) return
        setIsSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()

        // Fallback: try 'location' if 'branch_location' fails? 
        // Actually, let's just use 'location' as it's more common.
        // If the user said "branch_location column doesnt exist", they likely have a table without it.
        // I will try to inspect the error more closely or just use a generic 'location' column if that's what they have.

        // Let's assume the column is named 'location'
        // Map string to integer
        let crowdLevelInt = 1
        if (status === 'moderate') crowdLevelInt = 2
        if (status === 'packed') crowdLevelInt = 3

        // Since 'id' is the Primary Key and tracks the User ID, we must use UPSERT.
        // This means each user can only have ONE active report at a time (updating a new bank overwrites the old one).
        const { error } = await supabase.from('bank_status').upsert({
            id: user?.id,
            bank_name: selectedBank,
            location: location || "Unknown Location",
            crowd_level: crowdLevelInt,
            created_at: new Date().toISOString() // Update timestamp on change
        })

        if (!error) {
            setIsDialogOpen(false)
            setLocation("")
        } else {
            console.error("Report submission error:", error)
            alert(`Failed to submit report: ${error.message}\n\nHint: ${error.details || 'Check columns'}`)
        }
        setIsSubmitting(false)
    }

    const getLatestStatus = (bankName: string) => {
        return statuses.find(s => s.bank_name === bankName)
    }

    const getStatusColor = (level: number) => {
        switch (level) {
            case 1: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case 2: return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case 3: return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-slate-500/10 text-slate-500"
        }
    }

    const getStatusIcon = (level: number) => {
        switch (level) {
            case 1: return <CheckCircle2 className="w-4 h-4 mr-1" />
            case 2: return <Clock className="w-4 h-4 mr-1" />
            case 3: return <AlertCircle className="w-4 h-4 mr-1" />
            default: return null
        }
    }

    const getStatusLabel = (level: number) => {
        switch (level) {
            case 1: return "Smooth"
            case 2: return "Moderate"
            case 3: return "Packed"
            default: return "Unknown"
        }
    }

    const isFresh = (dateString: string) => {
        const diff = new Date().getTime() - new Date(dateString).getTime()
        return diff < 1000 * 60 * 60 * 2 // 2 hours
    }

    const filteredBanks = MALAYSIAN_BANKS.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bank Status</h1>
                    <p className="text-muted-foreground">Crowdsourced live updates on bank congestion.</p>
                </div>
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search bank..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBanks.map((bank) => {
                    const latest = getLatestStatus(bank.name)
                    const fresh = latest ? isFresh(latest.created_at) : false

                    return (
                        <Card key={bank.name} className="flex flex-col overflow-hidden transition-all hover:border-primary/50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-lg ${bank.color} flex items-center justify-center text-white font-bold text-lg`}>
                                        {bank.name.substring(0, 1)}
                                    </div>
                                    {latest && (
                                        <Badge variant="outline" className={getStatusColor(latest.crowd_level)}>
                                            {getStatusIcon(latest.crowd_level)}
                                            {getStatusLabel(latest.crowd_level)}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="mt-4">{bank.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    {latest ? (
                                        <>
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-[200px]">{latest.location}</span>
                                        </>
                                    ) : (
                                        "No recent reports"
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-grow">
                                {latest ? (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Updated {new Date(latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {!fresh && <span className="text-amber-500 ml-1">(Unverified)</span>}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Be the first to report status for this bank.</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Dialog open={isDialogOpen && selectedBank === bank.name} onOpenChange={(open) => {
                                    setIsDialogOpen(open)
                                    if (open) setSelectedBank(bank.name)
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">Report Status</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Report {bank.name} Status</DialogTitle>
                                            <DialogDescription>
                                                Help others by reporting the current crowd level.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <label htmlFor="location" className="text-sm font-medium">Branch Location</label>
                                                <Input
                                                    id="location"
                                                    placeholder="e.g. KLCC, Bangsar, Seksyen 7"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-24 gap-2 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500"
                                                    onClick={() => handleReport('smooth')}
                                                    disabled={isSubmitting}
                                                >
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                    Smooth
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-24 gap-2 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500"
                                                    onClick={() => handleReport('moderate')}
                                                    disabled={isSubmitting}
                                                >
                                                    <Clock className="w-8 h-8 text-amber-500" />
                                                    Moderate
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex flex-col h-24 gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                                                    onClick={() => handleReport('packed')}
                                                    disabled={isSubmitting}
                                                >
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                    Packed
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
