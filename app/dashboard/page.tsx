
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, Activity } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM 0.00</div>
                        <p className="text-xs text-muted-foreground">Set your budget to start</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Listed for Duit Raya</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bank Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Unknown</div>
                        <p className="text-xs text-muted-foreground">Updates from community</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your recent planning activities will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground rounded-md border border-dashed">
                            No recent activity.
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>
                            Complete these steps to setup your planner.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 rounded-md border p-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Set Total Budget</p>
                                <p className="text-sm text-muted-foreground">Define how much you want to give.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-md border p-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Add Recipients</p>
                                <p className="text-sm text-muted-foreground">List family and friends.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
