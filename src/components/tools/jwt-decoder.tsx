'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Lock, Trash2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { CopyButton } from '@/components/ui/copy-button';

export function JwtDecoder() {
    const t = useTranslations('Tools.JwtDecoder');
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        decodeToken();
    }, [token]);

    const decodeToken = () => {
        setError(null);
        if (!token.trim()) {
            setHeader('');
            setPayload('');
            return;
        }

        try {
            // Decode Header
            const decodedHeader = jwtDecode(token, { header: true });
            setHeader(JSON.stringify(decodedHeader, null, 2));

            // Decode Payload
            const decodedPayload = jwtDecode(token);
            setPayload(JSON.stringify(decodedPayload, null, 2));
        } catch (e) {
            setError(t('errorInvalid'));
            setHeader('');
            setPayload('');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>{t('tokenLabel')}</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToken('')}
                            disabled={!token}
                            className="h-8"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    </div>
                    <textarea
                        className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none break-all"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Decoded
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-auto space-y-6">
                    {error ? (
                        <div className="text-red-500 text-sm">{error}</div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-muted-foreground">{t('headerLabel')}</Label>
                                    <CopyButton value={header} className="h-6 w-6" />
                                </div>
                                <pre className="bg-muted/30 p-4 rounded-md overflow-auto text-xs font-mono">
                                    {header || '{}'}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-muted-foreground">{t('payloadLabel')}</Label>
                                    <CopyButton value={payload} className="h-6 w-6" />
                                </div>
                                <pre className="bg-muted/30 p-4 rounded-md overflow-auto text-xs font-mono">
                                    {payload || '{}'}
                                </pre>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
