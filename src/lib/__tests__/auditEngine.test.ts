import { describe, it, expect } from 'vitest'
import { runAudit, type ToolInput } from '../auditEngine'

// Test 1: Team plan overkill for 1 user
describe('auditEngine - plan right-sizing', () => {
    it('flags Business plan for a single user as overkill', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Business', monthlySpend: 40, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'coding')
        expect(result.results[0].isOptimal).toBe(false)
        expect(result.results[0].monthlySavings).toBeGreaterThan(0)
        expect(result.totalMonthlySavings).toBeGreaterThan(0)
    })

    it('does not flag Pro plan for a single user', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Pro', monthlySpend: 20, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'coding')
        expect(result.results[0].isOptimal).toBe(true)
        expect(result.results[0].monthlySavings).toBe(0)
    })
})

// Test 2: Billing overage detection
describe('auditEngine - billing overage', () => {
    it('detects overpayment vs expected plan price', () => {
        const inputs: ToolInput[] = [
            // Cursor Pro = $20/seat. Paying $45 for 1 seat = $25 overage
            { toolId: 'cursor', planName: 'Pro', monthlySpend: 45, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'coding')
        expect(result.results[0].isOptimal).toBe(false)
        expect(result.results[0].monthlySavings).toBeGreaterThanOrEqual(20)
    })

    it('does not flag correct billing amount', () => {
        // Use 3 seats on Business plan — above the 2-seat overkill threshold
        // $19 x 3 = $57, paying exactly $57 — no overage, seats justify Business plan
        const inputs: ToolInput[] = [
            { toolId: 'github-copilot', planName: 'Business', monthlySpend: 57, seats: 3 },
        ]
        const result = runAudit(inputs, 3, 'coding')
        expect(result.results[0].monthlySavings).toBe(0)
    })
})

// Test 3: Duplicate general AI tool detection
describe('auditEngine - duplicate tools', () => {
    it('flags paying for both Claude and ChatGPT for non-data use case', () => {
        const inputs: ToolInput[] = [
            { toolId: 'claude', planName: 'Pro', monthlySpend: 17, seats: 1 },
            { toolId: 'chatgpt', planName: 'Plus', monthlySpend: 20, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'writing')
        const chatgptResult = result.results.find((r) => r.toolId === 'chatgpt')
        expect(chatgptResult?.isOptimal).toBe(false)
        expect(chatgptResult?.monthlySavings).toBeGreaterThan(0)
    })
})

// Test 4: Use case mismatch
describe('auditEngine - use case mismatch', () => {
    it('flags Cursor for a writing-focused team', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Pro', monthlySpend: 20, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'writing')
        expect(result.results[0].isOptimal).toBe(false)
        expect(result.results[0].monthlySavings).toBe(20)
    })
})

// Test 5: Already optimal spending
describe('auditEngine - optimal spending', () => {
    it('returns isAlreadyOptimal true when no savings found', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Pro', monthlySpend: 20, seats: 1 },
        ]
        // coding use case — cursor pro for 1 seat at correct price is optimal
        const result = runAudit(inputs, 1, 'coding')
        expect(result.isAlreadyOptimal).toBe(true)
        expect(result.totalMonthlySavings).toBe(0)
    })
})

// Test 6: Annual savings calculation
describe('auditEngine - savings math', () => {
    it('correctly calculates annual savings as 12x monthly', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Business', monthlySpend: 40, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'coding')
        expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
    })

    it('flags high savings correctly (>$500/mo)', () => {
        const inputs: ToolInput[] = [
            { toolId: 'cursor', planName: 'Business', monthlySpend: 600, seats: 1 },
        ]
        const result = runAudit(inputs, 1, 'coding')
        expect(result.isHighSavings).toBe(true)
    })
})