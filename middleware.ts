import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of allowed domains
const allowedOrigins = [
    'https://tld-finder.erdiawan.com',
    'http://localhost:3000', // For local development
]

// List of protected API routes
const protectedPaths = [
    '/api/ai-info',
    '/api/tld',
]

export function middleware(request: NextRequest) {
    // Get the origin and referer from the request headers
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const path = request.nextUrl.pathname

    // Check if the path is a protected API route
    if (protectedPaths.some(route => path.startsWith(route))) {
        // If there's no origin or referer, block the request
        if (!origin && !referer) {
            return new NextResponse(null, {
                status: 403,
                statusText: 'Forbidden',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        // Check if the origin is allowed
        const isAllowedOrigin = allowedOrigins.some(allowed => 
            origin?.startsWith(allowed) || referer?.startsWith(allowed)
        )

        if (!isAllowedOrigin) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: 'Unauthorized access',
                }),
                {
                    status: 403,
                    statusText: 'Forbidden',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
        }
    }

    // Allow the request to continue
    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}

