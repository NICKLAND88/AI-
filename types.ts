export interface HistoryItem {
  id: string;
  original: string;
  optimized: string;
  timestamp: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  max_tokens: number;
  temperature: number;
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface ApiSettings {
  apiUrl: string;
  apiKey: string;
  model: string;
}