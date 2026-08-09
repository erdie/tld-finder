import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getBaseUrl } from '@/lib/site-config'

// Allowed origins for API requests
const allowedOrigins = [
    getBaseUrl(),
    'https://tld-finder.erdiawan.com',
    'http://localhost:3000',
]

// Protected paths requiring valid Origin/Referer header
const protectedPaths = [
    '/api/ai-info',
    '/api/tld',
    '/api/whois',
    '/api/domain-hacks',
]

// Recommended rate limit configuration per endpoint (/minute)
interface RateLimitRule {
    windowMs: number;
    max: number;
}

const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
    '/api/ai-info': { windowMs: 60 * 1000, max: 10 },      // 10 req/min for Gemini AI API
    '/api/whois': { windowMs: 60 * 1000, max: 20 },        // 20 req/min for WHOIS/RDAP lookups
    '/api/domain-hacks': { windowMs: 60 * 1000, max: 30 }, // 30 req/min for Domain Hacks generator
    '/api/tld': { windowMs: 60 * 1000, max: 60 },          // 60 req/min for TLD Search
    default: { windowMs: 60 * 1000, max: 60 },             // 60 req/min default fallback
}

// In-memory sliding window store
const rateLimitMap = new Map<string, number[]>()

// Cleanup stale rate limit entries periodically (every 5 minutes)
let lastCleanup = Date.now()
function cleanupRateLimitMap() {
    const now = Date.now()
    if (now - lastCleanup < 5 * 60 * 1000) return
    lastCleanup = now

    for (const [key, timestamps] of rateLimitMap.entries()) {
        const validTimestamps = timestamps.filter(ts => now - ts < 60 * 1000)
        if (validTimestamps.length === 0) {
            rateLimitMap.delete(key)
        } else {
            rateLimitMap.set(key, validTimestamps)
        }
    }
}

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Only process /api/ routes
    if (!path.startsWith('/api/')) {
        return NextResponse.next()
    }

    // 1. Origin & Referer Verification for Protected Paths
    if (protectedPaths.some(route => path.startsWith(route))) {
        const origin = request.headers.get('origin')
        const referer = request.headers.get('referer')

        if (!origin && !referer) {
            return new NextResponse(
                JSON.stringify({ success: false, error: 'Forbidden: Missing origin or referer header' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const isAllowedOrigin = allowedOrigins.some(allowed => 
            origin?.startsWith(allowed) || referer?.startsWith(allowed)
        )

        if (!isAllowedOrigin) {
            return new NextResponse(
                JSON.stringify({ success: false, error: 'Forbidden: Unauthorized origin' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }
    }

    // 2. Sliding Window Rate Limiting
    cleanupRateLimitMap()

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'

    const matchedRuleKey = Object.keys(RATE_LIMIT_RULES).find(ruleKey => path.startsWith(ruleKey)) || 'default'
    const rule = RATE_LIMIT_RULES[matchedRuleKey]

    const key = `${ip}:${matchedRuleKey}`
    const now = Date.now()
    const windowStart = now - rule.windowMs

    const timestamps = (rateLimitMap.get(key) || []).filter(ts => ts > windowStart)

    if (timestamps.length >= rule.max) {
        const oldestTs = timestamps[0]
        const resetTimeSeconds = Math.ceil((oldestTs + rule.windowMs - now) / 1000)

        return new NextResponse(
            JSON.stringify({
                error: 'Too Many Requests',
                message: `Rate limit exceeded for ${matchedRuleKey}. Please wait ${resetTimeSeconds} seconds before trying again.`,
                retryAfter: resetTimeSeconds,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(resetTimeSeconds),
                    'X-RateLimit-Limit': String(rule.max),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil((oldestTs + rule.windowMs) / 1000)),
                },
            }
        )
    }

    // Add current timestamp & save
    timestamps.push(now)
    rateLimitMap.set(key, timestamps)

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(rule.max))
    response.headers.set('X-RateLimit-Remaining', String(rule.max - timestamps.length))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil((now + rule.windowMs) / 1000)))

    return response
}

export const config = {
    matcher: '/api/:path*',
}
