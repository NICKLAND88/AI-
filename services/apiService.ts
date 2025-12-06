import { ChatCompletionRequest, ChatCompletionResponse, ApiSettings } from '../types';

export const optimizePromptService = async (originalPrompt: string, settings: ApiSettings): Promise<string> => {
  const requestBody: ChatCompletionRequest = {
    model: settings.model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的提示词（Prompt）优化专家。你的任务是将用户输入的原始提示词重写为结构清晰、逻辑严密、细节丰富且效果更好的高质量提示词。请遵循以下原则：1. 明确角色设定；2. 补充缺失的背景信息；3. 明确具体的任务目标；4. 规定输出格式和风格。请直接输出优化后的提示词，不要包含额外的寒暄语。优化后的内容限制在500字以内。'
      },
      {
        role: 'user',
        content: originalPrompt
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  };

  try {
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('API 返回数据格式异常');
    }
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || '网络连接错误，请稍后重试');
  }
};