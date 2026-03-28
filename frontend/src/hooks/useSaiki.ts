import { useCallback, useState } from 'react';
import { useExplorationStore } from '../store/explorationStore';
import { truncateToSixWords } from '../features/rue/lib/analysis';
import { filterTerms } from '../features/rue/lib/termFilter';
import { useSessionStore } from '../store/sessionStore';

async function generateNodeSummary(response: string, prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/saiki/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Summarize this in exactly 6 words or fewer, no punctuation:\n\n"${response.slice(0, 400)}"`,
        systemOverride:
          'Respond with ONLY a 6-word summary. No quotes, no punctuation, no explanation.',
        temperature: 0.3,
        maxTokens: 20,
        noTerms: true,
      }),
    });

    if (!res.body) return truncateToSixWords(prompt);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let summaryText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as { type?: string; text?: string };
            if (data.type === 'chunk' && data.text) summaryText += data.text;
          } catch {
            /* ignore */
          }
        }
      }
    }
    const cleaned = summaryText.trim().replace(/[".]+$/g, '');
    return cleaned || truncateToSixWords(prompt);
  } catch {
    return truncateToSixWords(prompt);
  }
}

export function useSaiki() {
  const store = useExplorationStore;
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const askQuestion = useCallback(async (question: string) => {
    setIsGlobalLoading(true);
    
    // Auto-create session if missing
    let sid = store.getState().currentSessionId;
    if (!sid) {
      sid = await useSessionStore.getState().createSession(question);
      store.getState().setSessionId(sid);
    }

    const nodeId = store.getState().addRootNode(question);
    const terms: string[] = [];

    try {
      const res = await fetch('/api/saiki/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: question, context: '' }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type?: string;
                text?: string;
                term?: string;
              };
              if (data.type === 'chunk' && data.text) {
                responseText += data.text;
                store.getState().updateNodeResponse(nodeId, responseText);
              } else if (data.type === 'term' && data.term) {
                const ft = filterTerms([data.term]);
                if (ft.length) terms.push(ft[0]);
              } else if (data.type === 'done') {
                store.getState().completeStreaming(nodeId, filterTerms([...new Set(terms)]));
                void generateNodeSummary(responseText, question).then((summary) => {
                  store.getState().setNodeSummary(nodeId, summary);
                  store.getState().persistNode(nodeId);
                });
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
      const stDone = store.getState().nodes[nodeId];
      if (stDone?.isStreaming) {
        store.getState().completeStreaming(nodeId, filterTerms([...new Set(terms)]));
        void generateNodeSummary(stDone.response, question).then((summary) => {
          store.getState().setNodeSummary(nodeId, summary);
          store.getState().persistNode(nodeId);
        });
      }
    } catch (err) {
      console.error('AskQuestion Error:', err);
      store.getState().finalizeNode(nodeId, filterTerms(terms), truncateToSixWords(question));
    } finally {
      setIsGlobalLoading(false);
    }
  }, []);

  const exploreTerm = useCallback(
    async (
      term: string | string[],
      parentId: string,
      isFollowUp = false,
      customPrompt?: string
    ) => {
      const s = store.getState();
      const parent = s.nodes[parentId];
      if (!parent) return;

      let prompt = customPrompt;
      if (!prompt) {
        if (Array.isArray(term)) {
          const termList = term.join('", "');
          prompt =
            term.length === 1
              ? `Explain "${term[0]}" in the context of: ${parent.prompt}`
              : `Explain these concepts: "${termList}" — all in the context of: ${parent.prompt}`;
        } else {
          prompt = `Explain "${term}" in the context of: ${parent.prompt}`;
        }
      }

      const termArray = Array.isArray(term) ? term : [term];
      const nodeId = s.addChildNode(parentId, prompt, termArray, isFollowUp);
      s.focusNode(nodeId);
      const terms: string[] = [];

      try {
        const res = await fetch('/api/saiki/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            context: `Parent Prompt: ${parent.prompt}\nParent Response: ${parent.response}`,
          }),
        });

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let responseText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)) as {
                  type?: string;
                  text?: string;
                  term?: string;
                };
                if (data.type === 'chunk' && data.text) {
                  responseText += data.text;
                  store.getState().updateNodeResponse(nodeId, responseText);
                } else if (data.type === 'term' && data.term) {
                  const ft = filterTerms([data.term]);
                  if (ft.length) terms.push(ft[0]);
                } else if (data.type === 'done') {
                  store.getState().completeStreaming(nodeId, filterTerms([...new Set(terms)]));
                  void generateNodeSummary(responseText, prompt!).then((summary) => {
                    store.getState().setNodeSummary(nodeId, summary);
                    store.getState().persistNode(nodeId);
                  });
                }
              } catch {
                /* ignore */
              }
            }
          }
        }
        const stEx = store.getState().nodes[nodeId];
        if (stEx?.isStreaming) {
          store.getState().completeStreaming(nodeId, filterTerms([...new Set(terms)]));
          void generateNodeSummary(stEx.response, prompt!).then((summary) => {
            store.getState().setNodeSummary(nodeId, summary);
            store.getState().persistNode(nodeId);
          });
        }
      } catch (err) {
        console.error('Explore Error:', err);
        store.getState().finalizeNode(nodeId, filterTerms(terms), truncateToSixWords(prompt!));
      }
    },
    []
  );

  return { askQuestion, exploreTerm, isGlobalLoading };
}
