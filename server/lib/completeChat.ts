import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sambanovaKey = process.env.SAMBANOVA_API_KEY;
const nvidiaKey = process.env.NVIDIA_API_KEY;

const sambanova = new OpenAI({
  baseURL: 'https://api.sambanova.ai/v1',
  apiKey: sambanovaKey || '',
});

const nvidia = nvidiaKey
  ? new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: nvidiaKey,
    })
  : null;

/**
 * Non-stream completion for short summaries (session exploration digest).
 */
export async function completeChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const r = await sambanova.chat.completions.create({
      model: 'Meta-Llama-3.3-70B-Instruct',
      messages,
      max_tokens: maxTokens,
      temperature: 0.25,
    });
    const t = r.choices[0]?.message?.content?.trim();
    if (t) return t;
  } catch (err: unknown) {
    const status = err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : undefined;
    if (status === 429 && nvidia) {
      try {
        const r = await nvidia.chat.completions.create({
          model: 'meta/llama-3.1-8b-instruct',
          messages,
          max_tokens: maxTokens,
          temperature: 0.25,
        });
        const t = r.choices[0]?.message?.content?.trim();
        if (t) return t;
      } catch {
        /* fall through */
      }
    }
  }
  return 'They explored connected ideas across several nodes in this session.';
}
