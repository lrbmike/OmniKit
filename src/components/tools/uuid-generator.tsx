'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Hash, RefreshCw } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function UuidGenerator() {
    const t = useTranslations('Tools.UuidGenerator');
    const [quantity, setQuantity] = useState(1);
    const [hyphens, setHyphens] = useState(true);
    const [uppercase, setUppercase] = useState(false);
    const [uuids, setUuids] = useState<string[]>([]);

    const generate = () => {
        const newUuids = [];
        for (let i = 0; i < quantity; i++) {
            let uuid = uuidv4();
            if (!hyphens) {
                uuid = uuid.replace(/-/g, '');
            }
            if (uppercase) {
                uuid = uuid.toUpperCase();
            }
            newUuids.push(uuid);
        }
        setUuids(newUuids);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">{t('quantity')}</Label>
                            <span className="text-xl font-bold text-primary">{quantity}</span>
                        </div>
                        <Slider
                            value={[quantity]}
                            onValueChange={(vals) => setQuantity(vals[0])}
                            min={1}
                            max={50}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-muted/30">
                        <Label htmlFor="hyphens" className="cursor-pointer flex-1">
                            {t('hyphens')}
                        </Label>
                        <Switch id="hyphens" checked={hyphens} onCheckedChange={setHyphens} />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-muted/30">
                        <Label htmlFor="uppercase" className="cursor-pointer flex-1">
                            {t('uppercase')}
                        </Label>
                        <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                    </div>

                    <Button onClick={generate} size="lg" className="w-full mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('generate')}
                    </Button>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 bg-muted/30 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-lg font-medium text-muted-foreground">Generated UUIDs</h3>
                    {uuids.length > 0 && (
                        <CopyButton
                            value={uuids.join('\n')}
                            onCopy={() => toast.success(t('copied'))}
                        />
                    )}
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <textarea
                        className="w-full h-full p-6 font-mono text-lg resize-none focus:outline-none bg-transparent"
                        readOnly
                        value={uuids.join('\n')}
                        placeholder="Generated UUIDs will appear here..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
