import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <span>© {currentYear} OmniKit. Made by</span>
                    <Link 
                        href="https://github.com/lrbmike" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                    >
                        lrbmike
                    </Link>
                </div>
                <Link 
                    href="https://github.com/lrbmike/OmniKit" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                    <Github className="h-4 w-4" />
                    <span>View on GitHub</span>
                </Link>
            </div>
        </footer>
    );
}
