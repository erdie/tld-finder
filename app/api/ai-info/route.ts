import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Gemini model once at module level
const geminiModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction: "You are an expert in domain name management and internet infrastructure. Provide a concise, factual, one-sentence description of the organization and its role in domain registration, TLD management, or internet governance."
});

async function getGeminiResponse(tldManager: string): Promise<string> {
    const prompt = `Describe "${tldManager}" in one concise sentence.`;

    console.log(`[Gemini] Requesting info for: ${tldManager}`);

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    console.log(`[Gemini] Response: ${text}`);

    return text;
}

export async function POST(request: Request) {
    try {
        const { tldManager } = await request.json();

        if (!tldManager) {
            return NextResponse.json(
                { error: "TLD Manager is required" },
                { status: 400 }
            );
        }

        console.log(`[AI Route] Fetching Gemini response for: ${tldManager}`);
        const aiInfo = await getGeminiResponse(tldManager);

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
