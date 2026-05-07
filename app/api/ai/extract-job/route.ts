import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'

// Common job board selectors for extracting job descriptions
const JOB_SELECTORS = [
    // LinkedIn
    '.description__text',
    '.show-more-less-html__markup',
    // Indeed
    '#jobDescriptionText',
    '.jobsearch-jobDescriptionText',
    // Glassdoor
    '.jobDescriptionContent',
    // Generic
    '[data-testid="job-description"]',
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[id*="job-description"]',
    '[id*="jobDescription"]',
    'article',
    '.job-details',
    '.description',
    'main',
]

// Clean and extract text from HTML
const cleanText = (html: string): string => {
    // Remove script and style tags
    let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // Remove HTML tags but keep line breaks
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n')
    cleaned = cleaned.replace(/<\/p>/gi, '\n\n')
    cleaned = cleaned.replace(/<\/div>/gi, '\n')
    cleaned = cleaned.replace(/<\/li>/gi, '\n')
    cleaned = cleaned.replace(/<[^>]+>/g, ' ')

    // Decode HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ')
    cleaned = cleaned.replace(/&amp;/g, '&')
    cleaned = cleaned.replace(/&lt;/g, '<')
    cleaned = cleaned.replace(/&gt;/g, '>')
    cleaned = cleaned.replace(/&quot;/g, '"')
    cleaned = cleaned.replace(/&#39;/g, "'")

    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.replace(/\n\s+/g, '\n')
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

    return cleaned.trim()
}

// Extract job description from HTML
const extractJobDescription = (html: string): string | null => {
    // Try to find job description by common patterns
    const patterns = [
        // Job description sections
        /<div[^>]*class="[^"]*job[-_]?description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<section[^>]*class="[^"]*job[-_]?description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
        /<article[^>]*>([\s\S]*?)<\/article>/i,
        // LinkedIn specific
        /<div[^>]*class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        // Indeed specific
        /<div[^>]*id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/i,
        // Generic
        /<main[^>]*>([\s\S]*?)<\/main>/i,
    ]

    for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
            const text = cleanText(match[1])
            // Only accept if it looks like a job description (has some length)
            if (text.length > 200) {
                return text.substring(0, 4000) // Limit to 4000 chars
            }
        }
    }

    // Fallback: extract all text from body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch && bodyMatch[1]) {
        const text = cleanText(bodyMatch[1])
        // Try to find the job content by looking for keywords
        const keywords = ['responsabilidades', 'requisitos', 'qualificações', 'responsibilities', 'requirements', 'qualifications']
        const lowerText = text.toLowerCase()

        for (const keyword of keywords) {
            const idx = lowerText.indexOf(keyword)
            if (idx !== -1) {
                // Extract a chunk around the keyword
                const start = Math.max(0, idx - 200)
                const end = Math.min(text.length, idx + 3000)
                return text.substring(start, end)
            }
        }

        // Last resort: return first 4000 chars of body
        if (text.length > 300) {
            return text.substring(0, 4000)
        }
    }

    return null
}

export async function POST(request: Request) {
    const ctx = await buildRequestContext().catch(() => null)
    const requestId = ctx?.request_id ?? null

    try {
        const { url } = await request.json()

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        try {
            new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        const urlHost = (() => { try { return new URL(url).host } catch { return null } })()
        logger.info(AUDIT_EVENTS.EXTRACT_JOB_REQUESTED, {
            request_id: requestId,
            ip_hash: ctx?.ip_hash,
            url_host: urlHost,
        })

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5,pt-BR;q=0.3',
            },
            redirect: 'follow',
        })

        if (!response.ok) {
            logger.warn(AUDIT_EVENTS.EXTRACT_JOB_FAILED, {
                request_id: requestId,
                url_host: urlHost,
                status: response.status,
            })
            return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
        }

        const html = await response.text()
        const jobDescription = extractJobDescription(html)

        if (!jobDescription) {
            logger.warn(AUDIT_EVENTS.EXTRACT_JOB_FAILED, {
                request_id: requestId,
                url_host: urlHost,
                reason: 'no_match',
                html_length: html.length,
            })
            return NextResponse.json({ error: 'Could not extract job description' }, { status: 404 })
        }

        logger.info(AUDIT_EVENTS.EXTRACT_JOB_COMPLETED, {
            request_id: requestId,
            url_host: urlHost,
            extracted_length: jobDescription.length,
        })

        const headers = new Headers()
        if (requestId) headers.set('x-request-id', requestId)
        return NextResponse.json({
            jobDescription,
            sourceUrl: url,
            extractedAt: new Date().toISOString()
        }, { headers })

    } catch (error) {
        logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
            request_id: requestId,
            route: '/api/ai/extract-job',
            error_class: error instanceof Error ? error.constructor.name : 'unknown',
        })
        return NextResponse.json({ error: 'Failed to extract job description' }, { status: 500 })
    }
}
