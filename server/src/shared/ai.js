import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate an AI reply for a review.
 * @param {string} reviewContent - The customer's review text
 * @param {string} instructionPrompt - The app owner's instruction / tone prompt
 * @param {{ provider: string, apiKey?: string }} config - user AI config
 */
export async function generateReply(reviewContent, instructionPrompt, config = {}) {
    const provider = config.provider || process.env.AI_PROVIDER || 'GEMINI';
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;

    const systemPrompt = instructionPrompt
        ? `${instructionPrompt}\n\nNow reply to the following customer review:`
        : 'You are a professional customer support agent. Write a polite, helpful, and concise reply to the following customer review:';

    const userMessage = `Review: "${reviewContent}"\n\nWrite only the reply, no extra commentary.`;

    if (provider === 'OPENAI') {
        return generateOpenAI(apiKey || process.env.OPENAI_API_KEY, systemPrompt, userMessage);
    }
    return generateGemini(apiKey, systemPrompt, userMessage);
}

async function generateGemini(apiKey, systemPrompt, userMessage) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
    return result.response.text().trim();
}

async function generateOpenAI(apiKey, systemPrompt, userMessage) {
    // ponytail: dynamic import so openai package is optional — only install if using OpenAI
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]
    });
    return res.choices[0].message.content.trim();
}
