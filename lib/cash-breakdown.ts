export type CashDenomination = {
    value: number
    count: number
    label: string
}

export const DENOMINATIONS = [100, 50, 20, 10, 5, 1] as const

export function calculateBreakdown(amount: number): CashDenomination[] {
    let remaining = Math.round(amount) // Round to nearest integer for physical cash
    const breakdown: CashDenomination[] = []

    for (const value of DENOMINATIONS) {
        const count = Math.floor(remaining / value)
        remaining = remaining % value

        breakdown.push({
            value,
            count,
            label: `RM${value}`
        })
    }

    return breakdown
}

export function calculateTotalBreakdown(amounts: number[]): CashDenomination[] {
    // We calculate breakdown for EACH amount individually and sum them up
    // This is because you give specific notes to specific people, not a lump sum broken down

    const totalBreakdown = DENOMINATIONS.map(value => ({
        value,
        count: 0,
        label: `RM${value}`
    }))

    for (const amount of amounts) {
        const breakdown = calculateBreakdown(amount)
        breakdown.forEach(item => {
            const target = totalBreakdown.find(t => t.value === item.value)
            if (target) {
                target.count += item.count
            }
        })
    }

    return totalBreakdown
}
