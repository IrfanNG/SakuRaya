"use client"

import { motion } from "framer-motion"

export function MoonPhaseLoader() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative h-12 w-12"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary w-full h-full"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </motion.div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
        </div>
    )
}
