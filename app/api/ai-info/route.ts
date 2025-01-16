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

        const aiType = "gemini"; // "gemini" or "openai" or any other supported type

        let aiInfo: string;
        let source: string;

        switch (aiType) {
            case "gemini":
                aiInfo = await getGeminiResponse(prompt);
                source = "gemini";
                break;
            case "openai":
                aiInfo = await getOpenAIResponse(prompt) || "No information available.";
                source = "openai";
                break;
            default:
                console.error("Unsupported AI type:", aiType);
                return NextResponse.json({
                    error: "Unsupported AI type or API key not set."
                }, { status: 500 });
        }

        // Check if the response is valid
        if (!aiInfo || aiInfo.trim() === "" || aiInfo.toLowerCase().includes("i cannot provide")) {
            console.warn(`${source} response was empty or invalid, falling back to openai`);
            aiInfo = await getOpenAIResponse(prompt) || "No information available.";
            source = "openai";
        }

        return NextResponse.json({ aiInfo, source });

    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({
            error: "An unexpected error occurred while processing your request."
        }, { status: 500 });
    }
}

