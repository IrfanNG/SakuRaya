'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    LineChart,
    Users,
    PiggyBank,
    CircleUser,
} from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: Home,
    },
    {
        href: "/dashboard/recipients",
        label: "Recipients",
        icon: Users,
    },
    {
        href: "/dashboard/bank-status",
        label: "Bank Status",
        icon: LineChart,
    },
    {
        href: "/dashboard/savings",
        label: "Savings",
        icon: PiggyBank,
    },
    {
        href: "/dashboard/profile",
        label: "Profile",
        icon: CircleUser,
    },
]

export function DashboardLinks({ className, onNavigate }: { className?: string, onNavigate?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className={className}>
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href

                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            isActive
                                ? "bg-muted text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}
