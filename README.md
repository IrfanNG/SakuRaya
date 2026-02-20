SakuRaya
"Plan your Barakah, skip the bank queue."

SakuRaya is a minimalist, tech-themed personal finance planner designed specifically for the Malaysian Muslim community during the Ramadan and Raya season. Built during the GodamSahur Hackathon 2026, it solves the yearly stress of budgeting for "Duit Raya," calculating physical banknote requirements, and navigating bank congestion.

Key Features
Smart Cash Breakdown: Automatically calculates the exact number of RM1, RM5, RM10, RM20, RM50, and RM100 notes you need to withdraw based on your recipient list.

Real-time Bank Tracker: A crowdsourced "Waze-like" feature for banks. Users report live crowd levels (Smooth, Moderate, Packed) using Supabase Realtime to help others avoid long queues.

Recipient Management: A clean, organized CRUD system to manage family, relatives, and friends with categorized budget allocations.

Savings Roadmap: A "Road to Raya" tracker to help users save consistently throughout the year, ensuring the app remains useful beyond the festive season.

Security First: Implemented PostgreSQL Row Level Security (RLS) to ensure all personal financial data is strictly private and accessible only to the owner.

Tech Stack
Framework: Next.js 15+ (App Router)

Styling: Tailwind CSS + Shadcn/UI

Database & Auth: Supabase (PostgreSQL, Realtime, Google Auth)

Icons: Lucide React

Deployment: Vercel

Database Schema
SakuRaya uses a relational database structure designed for scalability:

profiles: User meta-data and total budget goals.

recipients: Individual gift allocations linked to user IDs.

bank_status: Real-time crowdsourced reports with automated expiry logic for data freshness.