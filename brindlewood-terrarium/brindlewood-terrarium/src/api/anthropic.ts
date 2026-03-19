const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
}

export async function callClaude(
  prompt: string,
  systemPrompt?: string,
  model: string = 'claude-3-haiku-20240307',
  maxTokens: number = 1024
): Promise<string> {
  if (!API_KEY) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set');
  }

  const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

  const request: AnthropicRequest = {
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
      'x-api-key': API_KEY,
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
