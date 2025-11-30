'use server';

import { getSystemConfig } from './system';

interface TranslationRequest {
    text: string;
    sourceLang: string;
    targetLang: string;
}

interface TranslationResponse {
    success: boolean;
    data?: string;
    error?: string;
}

export async function translateText({ text, sourceLang, targetLang }: TranslationRequest): Promise<TranslationResponse> {
    try {
        const config = await getSystemConfig();
        
        if (!config?.aiApiKey) {
            return { success: false, error: 'AI API Key is not configured' };
        }

        const baseUrl = config.aiBaseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';
        const model = config.aiModel || 'gpt-3.5-turbo';
        let systemPrompt = config.aiSystemPrompt || "You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.\n\nText to translate:\n{context}\n\nOutput only the translated text.";
        
        // Replace all placeholders
        systemPrompt = systemPrompt
            .replace(/{sourceLang}/g, sourceLang)
            .replace(/{targetLang}/g, targetLang)
            .replace(/{context}/g, text);

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.aiApiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('AI API Error:', errorData);
            return { success: false, error: errorData.error?.message || 'Failed to fetch translation from AI provider' };
        }

        const data = await response.json();
        const translatedText = data.choices?.[0]?.message?.content;

        if (!translatedText) {
            return { success: false, error: 'No translation returned from AI provider' };
        }

        return { success: true, data: translatedText };
    } catch (error) {
        console.error('Translation error:', error);
        return { success: false, error: 'Internal server error during translation' };
    }
}
