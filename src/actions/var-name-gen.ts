'use server';

import { getSystemConfig } from './system';
import { getAiProviderById } from './ai-provider';

interface VarNameGenRequest {
    text: string;
}

interface VarNameGenResult {
    normal: {
        url: string;
        var_name: string;
        file_name: string;
        route: string;
    };
    short: {
        url: string;
        var_name: string;
        file_name: string;
        route: string;
    };
}

interface VarNameGenResponse {
    success: boolean;
    data?: VarNameGenResult;
    error?: string;
}

export async function generateVarNames({ text }: VarNameGenRequest): Promise<VarNameGenResponse> {
    try {
        const config = await getSystemConfig();
        
        // 获取变量名生成器使用的 AI 提供商
        const providerId = config?.varNameGenProviderId;
        if (!providerId) {
            return { success: false, error: 'Variable name generator provider is not configured. Please configure it in settings.' };
        }

        const providerResult = await getAiProviderById(providerId);
        if (!providerResult.success || !providerResult.data) {
            return { success: false, error: 'Variable name generator provider not found or inactive.' };
        }

        const provider = providerResult.data;
        
        if (!provider.apiKey) {
            return { success: false, error: 'AI provider API Key is not configured' };
        }

        const baseUrl = provider.baseUrl.replace(/\/$/, '');
        const model = provider.model;
        let systemPrompt = config?.varNameGenSystemPrompt || 
            "You are an experienced developer. Generate English variable names based on user input.\n\nUser input: {context}\n\nGenerate variable names in different formats:\n- URL: web URL format (lowercase, hyphen-separated)\n- Variable: camelCase variable name\n- File: file name format (lowercase, hyphen-separated)\n- Route: route path format (lowercase, slash-separated)\n\nProvide both normal length and shortened versions.\n\nOutput in JSON format:\n{\n  \"normal\": {\n    \"url\": \"enterprise-certification\",\n    \"var_name\": \"enterpriseCertification\",\n    \"file_name\": \"enterprise-certification\",\n    \"route\": \"/enterprise/certification\"\n  },\n  \"short\": {\n    \"url\": \"ent-cert\",\n    \"var_name\": \"entCert\",\n    \"file_name\": \"ent-cert\",\n    \"route\": \"/ent/cert\"\n  }\n}";
        
        // Replace placeholder
        systemPrompt = systemPrompt.replace(/{context}/g, text);

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`,
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
            return { success: false, error: errorData.error?.message || 'Failed to generate variable names from AI provider' };
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content;

        if (!resultText) {
            return { success: false, error: 'No result returned from AI provider' };
        }

        // Parse JSON result
        try {
            // Extract JSON from markdown code blocks if present
            let jsonText = resultText.trim();
            const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }
            
            const result: VarNameGenResult = JSON.parse(jsonText);
            
            // Validate result structure
            if (!result.normal || !result.short) {
                return { success: false, error: 'Invalid result format from AI' };
            }

            return { success: true, data: result };
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return { success: false, error: 'Failed to parse AI response. Please try again.' };
        }
    } catch (error) {
        console.error('Variable name generation error:', error);
        return { success: false, error: 'Internal server error during variable name generation' };
    }
}
