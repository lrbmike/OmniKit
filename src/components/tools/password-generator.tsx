'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RefreshCw, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/ui/copy-button';

export function PasswordGenerator() {
    const t = useTranslations('Tools.PasswordGenerator');
    const [length, setLength] = useState(16);
    const [quantity, setQuantity] = useState(1);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [passwords, setPasswords] = useState<string[]>([]);

    const generatePassword = () => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = '';
        if (includeUppercase) chars += uppercase;
        if (includeLowercase) chars += lowercase;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        if (chars === '') {
            toast.error(t('errorSelection'));
            return;
        }

        const newPasswords = [];
        for (let j = 0; j < quantity; j++) {
            let generated = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                generated += chars[randomIndex];
            }
            newPasswords.push(generated);
        }
        setPasswords(newPasswords);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">{t('length')}</Label>
                            <span className="text-xl font-bold text-primary">{length}</span>
                        </div>
                        <Slider
                            value={[length]}
                            onValueChange={(vals) => setLength(vals[0])}
                            min={6}
                            max={64}
                            step={1}
                            className="py-4"
                        />
                    </div>

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

                    <div className="space-y-4">
                        <Label className="text-base font-medium">Character Types</Label>
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <Label htmlFor="uppercase" className="cursor-pointer flex-1">{t('uppercase')}</Label>
                                <Switch
                                    id="uppercase"
                                    checked={includeUppercase}
                                    onCheckedChange={setIncludeUppercase}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <Label htmlFor="lowercase" className="cursor-pointer flex-1">{t('lowercase')}</Label>
                                <Switch
                                    id="lowercase"
                                    checked={includeLowercase}
                                    onCheckedChange={setIncludeLowercase}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <Label htmlFor="numbers" className="cursor-pointer flex-1">{t('numbers')}</Label>
                                <Switch
                                    id="numbers"
                                    checked={includeNumbers}
                                    onCheckedChange={setIncludeNumbers}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <Label htmlFor="symbols" className="cursor-pointer flex-1">{t('symbols')}</Label>
                                <Switch
                                    id="symbols"
                                    checked={includeSymbols}
                                    onCheckedChange={setIncludeSymbols}
                                />
                            </div>
                        </div>
                    </div>

                    <Button onClick={generatePassword} size="lg" className="w-full mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('generate')}
                    </Button>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 bg-muted/30 flex flex-col p-6 border-dashed">
                <div className="flex-1 flex flex-col space-y-4 h-full overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-muted-foreground">Generated Passwords</h3>
                        {passwords.length > 0 && (
                            <CopyButton
                                value={passwords.join('\n')}
                                onCopy={() => toast.success(t('copied'))}
                            />
                        )}
                    </div>

                    <div className="flex-1 relative border rounded-md bg-background shadow-sm overflow-hidden">
                        <textarea
                            className="w-full h-full p-4 font-mono text-lg resize-none focus:outline-none bg-transparent"
                            readOnly
                            value={passwords.join('\n')}
                            placeholder="Generated passwords will appear here..."
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
