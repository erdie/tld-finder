import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { tldManager } = await request.json();

        if (!tldManager) {
            return NextResponse.json({ error: 'TLD Manager is required' }, { status: 400 });
        }

        const prompt = `Provide a brief, one-sentence description of the company or organization "${tldManager}" in the context of domain name management or internet infrastructure. If it's not a well-known entity in this field, provide general information about its type of organization or industry.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
        });

        const aiInfo = response.choices[0].message.content || "No information available.";

        return NextResponse.json({ aiInfo });
    } catch (error) {
        console.error("Error fetching AI info:", error);
        return NextResponse.json({ error: "Unable to fetch information at this time." }, { status: 500 });
    }
}

