const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const CONFIG = {
  provider: 'openrouter',
  openrouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: 'claude-3-haiku-20240307',
  },
};

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function callClaude(
  prompt: string,
  systemPrompt?: string,
  _model?: string,
  maxTokens: number = 1024
): Promise<string> {
  if (CONFIG.provider === 'anthropic') {
    return callAnthropic(prompt, systemPrompt, CONFIG.anthropic.model, maxTokens);
  } else {
    return callOpenRouter(prompt, systemPrompt, CONFIG.openrouter.model, maxTokens);
  }
}

async function callAnthropic(
  prompt: string,
  systemPrompt?: string,
  model: string = 'claude-3-haiku-20240307',
  maxTokens: number = 1024
): Promise<string> {
  const apiKey = CONFIG.anthropic.apiKey;
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set');
  }

  const messages: LLMMessage[] = [{ role: 'user', content: prompt }];

  const request: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages,
  };

  if (systemPrompt) {
    request.system = systemPrompt;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenRouter(
  prompt: string,
  systemPrompt?: string,
  model: string = 'nvidia/nemotron-3-super-120b-a12b:free',
  maxTokens: number = 1024
): Promise<string> {
  const apiKey = CONFIG.openrouter.apiKey;
  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set');
  }

  const messages: LLMMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const request = {
    model,
    messages,
    max_tokens: maxTokens,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
