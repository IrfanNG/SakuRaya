
'use client'

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4">
                <Icon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-6">
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    )
}
