import OpenAI from 'openai';
import { Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY || 'your_key_here';

export const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
});

export async function streamExplanation(
  prompt: string,
  context: string,
  res: Response
) {
  const systemPrompt = `You are a helpful AI that explains concepts in a recursive manner.
Context:
${context}

Explain the following term clearly. In your explanation, highlight 3 to 5 important sub-concepts by wrapping them in <term>...</term> XML tags.
`;

  try {
    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 1024
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let currentText = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: content })}\n\n`);
        currentText += content;
      }
    }

    // Extract terms using regex after stream completes
    const terms = [];
    const regex = /<term>(.*?)<\/term>/g;
    let match;
    while ((match = regex.exec(currentText)) !== null) {
      if (match[1]) {
        terms.push(match[1]);
        res.write(`data: ${JSON.stringify({ type: 'term', term: match[1] })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed' });
    } else {
      res.end();
    }
  }
}
