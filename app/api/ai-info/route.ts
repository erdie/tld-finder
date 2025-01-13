import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize OpenAI as fallback
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getGeminiResponse(prompt: string) {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 100,
        }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function getOpenAIResponse(prompt: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
    });

    return response.choices[0].message.content;
}

export async function POST(request: Request) {
    try {
        const { tldManager } = await request.json();

        if (!tldManager) {
            return NextResponse.json({ error: 'TLD Manager is required' }, { status: 400 });
        }

        const prompt = `Provide a brief, one-sentence description of the company or organization "${tldManager}" in the context of domain name management or internet infrastructure. If it's not a well-known entity in this field, provide general information about its type of organization or industry.`;

        let aiInfo: string;
        let source: string;

        try {
            // Try Gemini first
            aiInfo = await getGeminiResponse(prompt);
            source = "gemini";

            // Check if Gemini returned empty or invalid response
            if (!aiInfo || aiInfo.trim() === "" || aiInfo.toLowerCase().includes("i cannot provide")) {
                throw new Error("Gemini response was empty or invalid");
            }
        } catch (geminiError) {
            console.warn("Gemini API failed, falling back to OpenAI:", geminiError);
            
            try {
                // Fallback to OpenAI
                aiInfo = await getOpenAIResponse(prompt) || "No information available.";
                source = "openai";
            } catch (openaiError) {
                console.error("Both APIs failed:", openaiError);
                return NextResponse.json({ 
                    error: "Unable to fetch information from any available service." 
                }, { status: 500 });
            }
        }

        return NextResponse.json({ aiInfo, source });

    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ 
            error: "An unexpected error occurred while processing your request." 
        }, { status: 500 });
    }
}
