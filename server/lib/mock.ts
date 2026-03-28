import { Response } from 'express';

export async function streamExplanationMock(
  prompt: string,
  context: string,
  res: Response
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const mockText = `This is a mock response because the SambaNova API rate limit (20/day) has been exceeded. 
  
Saiki is still fully functional in "Mock mode" to allow you to explore the UI. 
In a real scenario, I would explain "${prompt}" in detail. 
Examples of sub-concepts we could explore: <term>Recursive Learning</term>, <term>Knowledge Graphs</term>, and <term>Spatial UI</term>.`;

  const words = mockText.split(' ');
  
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: word + ' ' })}\n\n`);
    await new Promise(r => setTimeout(r, 50)); // Simulate streaming
  }

  // Extract terms
  const terms = ['Recursive Learning', 'Knowledge Graphs', 'Spatial UI'];
  for (const term of terms) {
    res.write(`data: ${JSON.stringify({ type: 'term', term })}\n\n`);
  }
  
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
}
