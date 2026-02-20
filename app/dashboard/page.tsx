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
import { DollarSign, Users, Activity, Save, Banknote, Download } from "lucide-react"
import { calculateTotalBreakdown, type CashDenomination } from "@/lib/cash-breakdown"
import html2canvas from "html2canvas"

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

        try {
            // Small delay to ensure styles are fully applied
            await new Promise(resolve => setTimeout(resolve, 100))

            const canvas = await html2canvas(breakdownRef.current, {
                backgroundColor: "#09090b", // Dark mode bg
                scale: 2,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure the cloned node is visible and styled correctly if needed
                    const element = clonedDoc.getElementById('breakdown-container')
                    if (element) {
                        element.style.padding = '20px'
                    }
                }
            })

            const image = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = image
            link.download = `SakuRaya_Breakdown_${new Date().toISOString().split('T')[0]}.png`
            link.click()
        } catch (err) {
            console.error("Export failed:", err)
            // Show a more user-friendly error
            alert("Failed to export image. Try taking a screenshot instead if this persists.")
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
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
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
                <Card>
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
                <Card className="col-span-2 md:col-span-2 lg:col-span-2">
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
            </div>

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
                            {loading ? (
                                <Skeleton className="h-8 w-full" />
                            ) : recipients.length === 0 ? (
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
                            <Button variant="outline" size="sm" onClick={handleExportBreakdown}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Image
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div ref={breakdownRef} id="breakdown-container" className="p-4 bg-card rounded-lg border border-border/50">
                                {/* Inner padding for clean screenshot */}
                                {loading ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20" />)}
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
