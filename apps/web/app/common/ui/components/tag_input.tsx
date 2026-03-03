import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

interface Props {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    className?: string
}

export function TagInput({ value = [], onChange, placeholder, className }: Props) {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const newTag = inputValue.trim()
            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag])
                setInputValue('')
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // Optional: Remove last tag on backspace if input is empty
            // onChange(value.slice(0, -1))
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Tapez et appuyez sur Entrée..."}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        const newTag = inputValue.trim()
                        if (newTag && !value.includes(newTag)) {
                            onChange([...value, newTag])
                            setInputValue('')
                        }
                    }}
                    disabled={!inputValue.trim()}
                >
                    Ajouter
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[30px]">
                {value.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive focus:outline-none"
                            aria-label={`Supprimer ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {value.length === 0 && <span className="text-muted-foreground text-sm italic">Aucune option ajoutée.</span>}
            </div>
        </div>
    )
}
