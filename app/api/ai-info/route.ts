import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { NextResponse } from "next/server";

const AI_TYPES = ["gemini", "openai"] as const;
type AIType = typeof AI_TYPES[number];

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize OpenAI as fallback
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getGeminiResponse(prompt: string) {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
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
        const geminiPrompt = `Describe '${tldManager}' in one concise sentence, specifying its role or focus within the domain name management or internet infrastructure industry (or its general type and industry if not widely recognized in that field)`;
        const openaiPrompt = `Provide a concise, one-sentence description of '${tldManager}' within the domain name management or internet infrastructure industry, highlighting its role or focus. If the company is not widely recognized in this field, briefly describe its industry and primary activities.`;

        const aiType: AIType = "gemini";

        let aiInfo: string;
        let source: string;

        if (!AI_TYPES.includes(aiType as any)) {
            throw new Error(`Unsupported AI type: ${aiType}`);
        }

        if (aiType === "gemini") {
            aiInfo = await getGeminiResponse(geminiPrompt);
            source = "gemini";
        } else {
            aiInfo = await getOpenAIResponse(openaiPrompt) || "No information available.";
            source = "openai";
        }

        // Check if the response is valid
        if (!aiInfo || aiInfo.trim() === "" || aiInfo.toLowerCase().includes("i cannot provide")) {
            console.warn(`${source} response was empty or invalid, falling back to openai`);
            aiInfo = await getOpenAIResponse(openaiPrompt) || "No information available.";
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

