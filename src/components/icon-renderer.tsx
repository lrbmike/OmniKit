import * as Icons from 'lucide-react';

export function IconRenderer({ name, className }: { name: string; className?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (Icons as any)[name];

    if (!Icon) {
        return <Icons.HelpCircle className={className} />;
    }

    return <Icon className={className} />;
}
