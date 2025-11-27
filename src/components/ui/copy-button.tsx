"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
    value: string
    timeout?: number
    onCopy?: () => void
}

export function CopyButton({
    value,
    className,
    variant = "outline",
    timeout = 2000,
    onCopy,
    onClick,
    ...props
}: CopyButtonProps) {
    const [hasCopied, setHasCopied] = React.useState(false)

    React.useEffect(() => {
        if (hasCopied) {
            const t = setTimeout(() => setHasCopied(false), timeout)
            return () => clearTimeout(t)
        }
    }, [hasCopied, timeout])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!value) return

        navigator.clipboard.writeText(value)
        setHasCopied(true)

        if (onCopy) {
            onCopy()
        } else {
            toast.success("Copied to clipboard")
        }

        if (onClick) {
            onClick(e)
        }
    }

    return (
        <Button
            size="icon"
            variant={variant}
            className={cn("relative z-10 h-8 w-8 transition-all duration-200", className)}
            onClick={handleClick}
            {...props}
        >
            <span className="sr-only">Copy</span>
            <div className={cn("transition-all", hasCopied ? "scale-0 opacity-0" : "scale-100 opacity-100")}>
                <Copy className="h-4 w-4" />
            </div>
            <div className={cn("absolute transition-all", hasCopied ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                <Check className="h-4 w-4 text-green-500" />
            </div>
        </Button>
    )
}
