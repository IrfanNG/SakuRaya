"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, Users, BarChart3, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/page-transition"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link className="flex items-center gap-2 font-bold text-xl tracking-tighter" href="#">
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              SakuRaya
            </span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:text-primary/80 transition-colors" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 pt-24">
        <PageTransition>
          <section className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 md:px-6 lg:py-24 space-y-10 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />

            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Plan your <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">barakah</span>, <br />
                skip the bank queue.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                The minimalist Duit Raya & Gifting Planner designed for the modern Muslim.
                Manage budget, track recipients, and crowdsource bank status in real-time.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 disabled:opacity-50">
                Learn More
              </Button>
            </div>
          </section>

          <section className="container mx-auto px-4 md:px-6 py-12 lg:py-24">
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                <div className="mb-4 inline-block rounded-lg bg-pink-500/10 p-3 text-pink-500">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Smart Budgeting</h3>
                <p className="text-muted-foreground">
                  Allocate your total budget and distribute barakah effortlessly.
                  Visual tracking ensures you never overspend.
                </p>
              </motion.div>
              <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                <div className="mb-4 inline-block rounded-lg bg-violet-500/10 p-3 text-violet-500">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Recipient Management</h3>
                <p className="text-muted-foreground">
                  Organize family, relatives, and friends.
                  Keep track of who has received their Duit Raya.
                </p>
              </motion.div>
              <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                <div className="mb-4 inline-block rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Live Bank Status</h3>
                <p className="text-muted-foreground">
                  Crowdsourced data on bank congestion.
                  Find the best time to withdraw cash without the wait.
                </p>
              </motion.div>
            </motion.div>
          </section>
        </PageTransition>
      </main>
      <footer className="border-t border-white/5 py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built for GodamSahur Hackathon. © 2024 SakuRaya.
          </p>
        </div>
      </footer>
    </div>
  )
}
