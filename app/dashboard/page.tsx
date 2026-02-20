'use client'

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Users, Activity, Save, Banknote, FileText, Loader2 } from "lucide-react"
import { calculateTotalBreakdown, type CashDenomination } from "@/lib/cash-breakdown"
import jsPDF from "jspdf"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/page-transition"
import { MoonPhaseLoader } from "@/components/moon-loader"

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const statCardItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

type Recipient = {
    id: string
    amount: number
    created_at: string
}

export default function DashboardPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [totalBudget, setTotalBudget] = useState(0)
    const [budgetInput, setBudgetInput] = useState("")
    const [breakdown, setBreakdown] = useState<CashDenomination[]>([])
    const [isEditingBudget, setIsEditingBudget] = useState(false)
    const [exporting, setExporting] = useState(false)
    const breakdownRef = useRef<HTMLDivElement>(null)

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch recipients
        const { data: recipientsData } = await supabase
            .from('recipients')
            .select('id, amount, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (recipientsData) {
            setRecipients(recipientsData)
            const amounts = recipientsData.map(r => Number(r.amount))
            setBreakdown(calculateTotalBreakdown(amounts))
        }

        // Fetch profile budget
        const { data: profileData } = await supabase
            .from('profiles')
            .select('total_budget')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setTotalBudget(profileData.total_budget || 0)
            setBudgetInput(profileData.total_budget?.toString() || "")
        } else {
            setTotalBudget(0)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('dashboard_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'recipients' },
                () => fetchData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSaveBudget = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const amount = parseFloat(budgetInput)
        if (isNaN(amount)) return

        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, total_budget: amount })

        if (!error) {
            setTotalBudget(amount)
            setIsEditingBudget(false)
        }
    }

    const handleExportBreakdown = async () => {
        if (!breakdownRef.current) return
        setExporting(true)

        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            // Title
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text("SakuRaya Cash Breakdown", pageWidth / 2, 20, { align: "center" })

            // Date
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" })

            // Separator
            doc.setLineWidth(0.5)
            doc.setDrawColor(200, 200, 200)
            doc.line(20, 35, pageWidth - 20, 35)

            // Content
            let y = 50
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)

            // Table Header
            doc.setFont("helvetica", "bold")
            doc.text("Note", 30, y)
            doc.text("Count", 100, y)
            doc.text("Value", 160, y)
            y += 10

            // Items
            doc.setFont("helvetica", "normal")
            breakdown.forEach((item) => {
                const totalValue = item.value * item.count

                doc.text(item.label, 30, y)
                doc.text(item.count.toString(), 100, y)
                doc.text(`RM ${totalValue}`, 160, y)
                y += 10
            })

            // Total Summary
            y += 10
            doc.line(20, y, pageWidth - 20, y)
            y += 15
            doc.setFont("helvetica", "bold")
            doc.text(`Total Withdrawal Required: RM ${totalAllocated.toFixed(2)}`, pageWidth / 2, y, { align: "center" })

            // Save
            doc.save(`SakuRaya_Breakdown_${new Date().toISOString().split('T')[0]}.pdf`)

        } catch (err) {
            console.error("PDF Export failed:", err)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setExporting(false)
        }
    }

    // Calculations
    const totalAllocated = recipients.reduce((sum, r) => sum + Number(r.amount), 0)
    const percentUsed = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0
    const remainingBudget = totalBudget - totalAllocated

    // Progress Bar Color
    const getProgressColor = (percent: number) => {
        if (percent >= 100) return "bg-red-500"
        if (percent >= 75) return "bg-amber-500"
        return "bg-emerald-500"
    }

    return (
        <PageTransition className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            {loading ? (
                <MoonPhaseLoader />
            ) : (
                <>
                    {/* Top Stat Cards */}
                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <motion.div variants={statCardItem}>
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-24" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    ) : isEditingBudget ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input
                                                className="h-8 w-24"
                                                value={budgetInput}
                                                onChange={e => setBudgetInput(e.target.value)}
                                                type="number"
                                            />
                                            <Button size="sm" onClick={handleSaveBudget}><Save className="h-4 w-4" /></Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="text-2xl font-bold">RM {totalBudget.toFixed(2)}</div>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditingBudget(true)}>
                                                <span className="sr-only">Edit</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </Button>
                                        </div>
                                    )}
                                    {!loading && (
                                        <p className="text-xs text-muted-foreground pt-1">
                                            {remainingBudget < 0 ? `Over budget by RM ${Math.abs(remainingBudget).toFixed(2)}` : `RM ${remainingBudget.toFixed(2)} remaining`}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={statCardItem}>
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Recipients</CardTitle>
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
                                            <div className="text-2xl font-bold">{recipients.length}</div>
                                            <p className="text-xs text-muted-foreground pt-1">People in your list</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={statCardItem} className="col-span-2 md:col-span-2 lg:col-span-2">
                            <Card className="col-span-2 md:col-span-2 lg:col-span-2 h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Allocated</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-32" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-2xl font-bold">RM {totalAllocated.toFixed(2)}</div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Progress value={Math.min(percentUsed, 100)} className={`h-2 w-24 ${getProgressColor(percentUsed)}`} />
                                                <p className="text-xs text-muted-foreground">{percentUsed.toFixed(1)}% used</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="breakdown">Cash Breakdown</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Budget Allocation</CardTitle>
                                    <CardDescription>
                                        Visual breakdown of your budget usage.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {recipients.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <p>No recipients added yet.</p>
                                            <p className="text-sm">Go to <span className="font-semibold text-foreground">Manage Recipients</span> to start planning.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress</span>
                                                <span className={percentUsed > 100 ? "text-red-500 font-bold" : "text-muted-foreground"}>
                                                    {percentUsed.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress value={Math.min(percentUsed, 100)} className={`h-4 ${getProgressColor(percentUsed)}`} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="breakdown">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Smart Cash Breakdown</CardTitle>
                                        <CardDescription>
                                            Exact number of physical notes you need to withdraw.
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleExportBreakdown} disabled={exporting}>
                                        {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                        {exporting ? "Generating..." : "Export PDF"}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div ref={breakdownRef} id="breakdown-container" className="p-4 bg-card rounded-lg border border-border/50">
                                        {/* Inner padding for clean screenshot */}
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {breakdown.map((item) => (
                                                <div
                                                    key={item.value}
                                                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                                            <Banknote className="w-5 h-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium leading-none">{item.label}</p>
                                                            <p className="text-xs text-muted-foreground">Note</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl font-bold font-mono">
                                                        {item.count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </PageTransition>
    )
}
