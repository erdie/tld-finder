import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = "You are an expert in domain name registries, top-level domain (TLD) management, and internet governance. Provide a concise, engaging, and highly informative overview of the specified TLD manager. Explain who they are (e.g., non-profit, commercial registry, university, government entity), their role, and other key domains or infrastructure they manage if relevant. Always include their official website URL if available, formatted as a markdown link: [domain.org](https://domain.org). Keep the response in Markdown format, highly concise (ideally 2-3 sentences max).";

// Model hierarchy: Primary model -> Fallback 1 -> Fallback 2
const GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
];

async function getGeminiResponse(tldManager: string, domain: string, type: string): Promise<{ aiInfo: string; usedModel: string }> {
    const prompt = `Provide an overview for "${tldManager}", who manages the "${domain}" top-level domain${type ? ` (${type} TLD)` : ""}. Include their official website URL if available, and format the output in Markdown.`;

    let lastError: any = null;

    for (const modelName of GEMINI_MODELS) {
        try {
            console.log(`[Gemini] Attempting request for: ${tldManager} (TLD: ${domain}) using ${modelName}`);

            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: SYSTEM_INSTRUCTION,
            });

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().trim();

            if (text && !text.toLowerCase().includes("i cannot")) {
                console.log(`[Gemini] Successfully generated response using ${modelName}`);
                return { aiInfo: text, usedModel: modelName };
            }

            throw new Error(`Empty or invalid response received from ${modelName}`);
        } catch (error: any) {
            console.warn(`[Gemini] Model ${modelName} failed:`, error?.message || error);
            lastError = error;
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}

export async function POST(request: Request) {
    try {
        const { tldManager, domain = "", type = "" } = await request.json();

        if (!tldManager) {
            return NextResponse.json(
                { error: "TLD Manager is required" },
                { status: 400 }
            );
        }

        console.log(`[AI Route] Fetching Gemini response for: ${tldManager} (Domain: ${domain}, Type: ${type})`);
        const { aiInfo, usedModel } = await getGeminiResponse(tldManager, domain, type);

        return NextResponse.json({ aiInfo, source: "gemini", model: usedModel });
    } catch (error: any) {
        console.error("[AI Route] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch AI information from Gemini", details: error?.message || String(error) },
            { status: 500 }
        );
    }
}


