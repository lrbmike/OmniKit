'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, FileJson, Minimize2, AlignLeft } from 'lucide-react';

export function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatJson = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast.success('JSON formatted successfully');
        } catch (e) {
            setError((e as Error).message);
            toast.error('Invalid JSON');
        }
    };

    const minifyJson = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
            toast.success('JSON minified successfully');
        } catch (e) {
            setError((e as Error).message);
            toast.error('Invalid JSON');
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Input JSON</label>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setInput('')}>
                            Clear
                        </Button>
                    </div>
                </div>
                <textarea
                    className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Paste your JSON here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Output</label>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={formatJson} title="Format">
                            <AlignLeft className="h-4 w-4 mr-2" />
                            Format
                        </Button>
                        <Button variant="outline" size="sm" onClick={minifyJson} title="Minify">
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Minify
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output} title="Copy">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </div>
                </div>
                <div className="relative flex-1">
                    <textarea
                        className={`flex-1 w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border rounded-md resize-none focus:outline-none ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                            }`}
                        readOnly
                        value={error || output}
                        placeholder="Result will appear here..."
                    />
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded text-xs">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
