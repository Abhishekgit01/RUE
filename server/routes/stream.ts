import { Router } from 'express';
import { streamExplanation } from '../lib/provider';

const router = Router();

router.post('/', async (req, res) => {
  const {
    prompt,
    context,
    systemOverride,
    noTerms,
    temperature,
    maxTokens,
  } = req.body;
  try {
    await streamExplanation(prompt, context || '', res, {
      systemOverride: typeof systemOverride === 'string' ? systemOverride : undefined,
      noTerms: Boolean(noTerms),
      temperature: typeof temperature === 'number' ? temperature : undefined,
      maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined,
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed' });
    }
  }
});

export default router;
