'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, RefreshCw } from 'lucide-react';

export function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');

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
            toast.error('Please select at least one character type');
            return;
        }

        let generated = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            generated += chars[randomIndex];
        }
        setPassword(generated);
    };

    const copyToClipboard = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        toast.success('Password copied to clipboard');
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2 mb-6">
                        <Input
                            value={password}
                            readOnly
                            className="font-mono text-lg"
                            placeholder="Generated password will appear here"
                        />
                        <Button onClick={copyToClipboard} variant="outline" size="icon" title="Copy">
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button onClick={generatePassword} size="icon" title="Generate">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Password Length: {length}</Label>
                            </div>
                            <Slider
                                value={[length]}
                                onValueChange={(vals) => setLength(vals[0])}
                                min={6}
                                max={64}
                                step={1}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                                <Switch
                                    id="uppercase"
                                    checked={includeUppercase}
                                    onCheckedChange={setIncludeUppercase}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                                <Switch
                                    id="lowercase"
                                    checked={includeLowercase}
                                    onCheckedChange={setIncludeLowercase}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="numbers">Numbers (0-9)</Label>
                                <Switch
                                    id="numbers"
                                    checked={includeNumbers}
                                    onCheckedChange={setIncludeNumbers}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="symbols">Symbols (!@#$)</Label>
                                <Switch
                                    id="symbols"
                                    checked={includeSymbols}
                                    onCheckedChange={setIncludeSymbols}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
