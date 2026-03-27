import OpenAI from "openai";

/**
 * SambaNova API Configuration
 * Using DeepSeek-R1 via SambaNova's OpenAI-compatible endpoint.
 */
export const sambanovaClient = new OpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
});

export const MODEL = "Meta-Llama-3.3-70B-Instruct";

/**
 * Generates the explanation from the LLM.
 */
export async function generateExplanation(systemPrompt: string): Promise<string> {
  try {
    const response = await sambanovaClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from LLM");
    
    const cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    return cleaned;
  } catch (error: any) {
    throw new Error(`LLM_ERROR: [${error.message || error}]`);
  }
}

/**
 * Generates structured JSON output from the LLM.
 */
export async function generateWithJSON(systemPrompt: string): Promise<string> {
  try {
    const response = await sambanovaClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.1,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from LLM");

    const cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    return cleaned;
  } catch (error: any) {
    throw new Error(`LLM_ERROR: [${error.message || error}]`);
  }
}
