'use server';

import { getSystemConfig } from './system';
import { getAiProviderById } from './ai-provider';

type TranslationMode = 'word' | 'paragraph';

interface TranslationRequest {
    text: string;
    sourceLang: string;
    targetLang: string;
    mode?: TranslationMode;
}

interface TranslationResponse {
    success: boolean;
    data?: string;
    error?: string;
}

export async function translateText({ text, sourceLang, targetLang, mode = 'word' }: TranslationRequest): Promise<TranslationResponse> {
    try {
        const config = await getSystemConfig();
        
        // 获取翻译器使用的 AI 提供商
        const providerId = config?.translatorProviderId;
        if (!providerId) {
            return { success: false, error: 'Translation provider is not configured. Please configure it in settings.' };
        }

        const providerResult = await getAiProviderById(providerId);
        if (!providerResult.success || !providerResult.data) {
            return { success: false, error: 'Translation provider not found or inactive.' };
        }

        const provider = providerResult.data;
        
        if (!provider.apiKey) {
            return { success: false, error: 'AI provider API Key is not configured' };
        }

        const baseUrl = provider.baseUrl.replace(/\/$/, '');
        const model = provider.model;
        let systemPrompt = config?.translatorSystemPrompt || "You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.\n\nText to translate:\n{context}\n\nOutput only the translated text.";
        
        // Replace all placeholders
        systemPrompt = systemPrompt
            .replace(/{sourceLang}/g, sourceLang)
            .replace(/{targetLang}/g, targetLang)
            .replace(/{context}/g, text);

        const translationMode = mode === 'paragraph' ? 'paragraph' : 'word';

        const modeInstruction = translationMode === 'word'
            ? `Translation mode: WORD.
Provide at least three distinct ${targetLang} translations for the ${sourceLang} term above.
Each candidate must use the following format:
<${targetLang} candidate>
<comma-separated ${sourceLang} synonyms or related phrases>.
Separate candidates with one blank line, avoid numbering, and only include translated content.
If fewer than three accurate options exist, return as many as possible using the same format.`
            : `Translation mode: PARAGRAPH.
Translate the entire text naturally into ${targetLang}, keeping the tone, intent, and context accurate.
Return only the translated content without additional commentary.`;

        const promptWithMode = `${systemPrompt}\n\n${modeInstruction}`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: promptWithMode }
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
        const translatedText = data.choices?.[0]?.message?.content?.trim();

        if (!translatedText) {
            return { success: false, error: 'No translation returned from AI provider' };
        }

        return { success: true, data: translatedText };
    } catch (error) {
        console.error('Translation error:', error);
        return { success: false, error: 'Internal server error during translation' };
    }
}
