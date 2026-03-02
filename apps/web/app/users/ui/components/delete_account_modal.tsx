import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'

export function DeleteAccountModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        password: '',
    })

    const radius = 20
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (countdown / 5) * circumference

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isDeleting && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        } else if (isDeleting && countdown === 0) {
            destroy('/users/me/delete', {
                onSuccess: () => {
                    setIsOpen(false)
                    setIsDeleting(false)
                },
                onError: () => {
                    reset('password')
                    setIsDeleting(false)
                    setCountdown(5)
                },
            })
        }

        return () => clearInterval(timer)
    }, [isDeleting, countdown, destroy, reset])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsDeleting(true)
    }

    function handleCancel() {
        setIsDeleting(false)
        setCountdown(5)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleCancel()
            setIsOpen(open)
        }}>
            <DialogTrigger asChild>
                <Button variant="destructive">Supprimer mon compte</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer mon compte</DialogTitle>
                    <DialogDescription>
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                        Veuillez entrer votre mot de passe pour confirmer.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Votre mot de passe"
                            required
                            disabled={isDeleting}
                        />
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <DialogFooter className="flex items-center gap-4">
                        {isDeleting ? (
                            <div className="flex items-center gap-4 w-full justify-end">
                                <div className="relative size-10 flex items-center justify-center">
                                    <svg className="size-full -rotate-90" viewBox="0 0 48 48">
                                        <circle
                                            className="text-muted-foreground/20"
                                            strokeWidth="4"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r={radius}
                                            cx="24"
                                            cy="24"
                                        />
                                        <circle
                                            className="text-destructive transition-[stroke-dashoffset] duration-1000 ease-linear"
                                            strokeWidth="4"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r={radius}
                                            cx="24"
                                            cy="24"
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-medium">{countdown}s</span>
                                </div>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Annuler
                                </Button>
                            </div>
                        ) : (
                            <>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive" disabled={processing}>
                                    Supprimer définitivement
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
