import { motion } from 'framer-motion'
import { Clock, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CountdownTimer({
    targetDate,
    variants,
}: {
    targetDate: string
    variants: any
}) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date()
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: difference
        }

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                total: difference
            }
        }
        return timeLeft
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    const units = [
        { label: 'Jours', value: timeLeft.days },
        { label: 'Heures', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Secondes', value: timeLeft.seconds },
    ]

    const isFinished = timeLeft.total <= 0;

    return (
        <motion.div
            variants={variants}
            className="space-y-4"
        >
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                <Clock className="size-3" /> Retour estimé dans
            </div>

            {isFinished ? (
                <div className="py-4 text-green-500 font-bold text-xl flex items-center justify-center gap-2 animate-pulse">
                    <CheckCircle2 className="size-6" /> Maintenance terminée (en attente de réouverture)
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {units.map((unit) => (
                        <div
                            key={unit.label}
                            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-xl border border-border/50 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-primary/5 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight z-10 text-foreground">
                                {unit.value.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest z-10">
                                {unit.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
