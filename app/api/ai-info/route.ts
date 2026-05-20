import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Gemini model once at module level
const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are an expert in domain name registries, top-level domain (TLD) management, and internet governance. Provide a concise, engaging, and highly informative overview of the specified TLD manager. Explain who they are (e.g., non-profit, commercial registry, university, government entity), their role, and other key domains or infrastructure they manage if relevant. Always include their official website URL if available, formatted as a markdown link: [domain.org](https://domain.org). Keep the response in Markdown format, highly concise (ideally 2-3 sentences max)."
});

async function getGeminiResponse(tldManager: string, domain: string, type: string): Promise<string> {
    const prompt = `Provide an overview for "${tldManager}", who manages the "${domain}" top-level domain${type ? ` (${type} TLD)` : ""}. Include their official website URL if available, and format the output in Markdown.`;

    console.log(`[Gemini] Requesting info for: ${tldManager} (TLD: ${domain})`);

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    console.log(`[Gemini] Response: ${text}`);

    return text;
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
        const aiInfo = await getGeminiResponse(tldManager, domain, type);

        // Validate response
        if (!aiInfo || aiInfo.trim() === "" || aiInfo.toLowerCase().includes("i cannot")) {
            throw new Error("Invalid or empty response from Gemini API");
        }

        return NextResponse.json({ aiInfo, source: "gemini" });
    } catch (error) {
        console.error("[AI Route] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch AI information from Gemini" },
            { status: 500 }
        );
    }
}

