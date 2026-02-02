import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize OpenAI as fallback
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini model once at module level
const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 150,
    },
    systemInstruction: {
        role: "system",
        parts: [{
            text: `You are an expert in domain name management and internet infrastructure.
Provide concise, factual one-sentence descriptions of organizations.
Focus on their role in domain registration, TLD management, or internet governance.
If the organization is not in this field, briefly describe their industry and primary activities.
Always provide a helpful response.`
        }],
    },
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

async function getOpenAIResponse(tldManager: string): Promise<string> {
    const prompt = `Provide a concise, one-sentence description of "${tldManager}" within the domain name management or internet infrastructure industry, highlighting its role or focus. If the company is not widely recognized in this field, briefly describe its industry and primary activities.`;

    console.log(`[OpenAI] Fallback request for: ${tldManager}`);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
    });

    const text = response.choices[0].message.content || "No information available.";

    console.log(`[OpenAI] Response: ${text}`);

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

        let aiInfo: string;
        let source: string;

        // Try Gemini first
        try {
            aiInfo = await getGeminiResponse(tldManager);
            source = "gemini";

            // Validate response
            if (!aiInfo || aiInfo.trim() === "" || aiInfo.toLowerCase().includes("i cannot")) {
                console.warn("[Gemini] Invalid response, falling back to OpenAI");
                aiInfo = await getOpenAIResponse(tldManager);
                source = "openai";
            }
        } catch (geminiError) {
            console.error("[Gemini] Error:", geminiError);
            // Fallback to OpenAI
            aiInfo = await getOpenAIResponse(tldManager);
            source = "openai";
        }

        return NextResponse.json({ aiInfo, source });
    } catch (error) {
        console.error("[AI Route] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch AI information" },
            { status: 500 }
        );
    }
}
