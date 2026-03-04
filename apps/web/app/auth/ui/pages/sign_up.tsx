import AuthLayout from '#auth/ui/components/layout'
import { Main } from '#common/ui/components/main'
import { Button } from '@workspace/ui/components/button'
import { motion } from 'framer-motion'

export default function Page() {
  return (
    <AuthLayout>
      <Main>
        <div className="h-full flex justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-6xl"
            >
              🎮
            </motion.div>

            <h1 className="text-5xl font-black">Tout est prêt !</h1>

            <p className="text-xl text-muted-foreground max-w-sm">
              Tu peux commencer à jouer quand tu es prêt.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Button size="lg" href="/game">
                Commencer à jouer
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Main>
    </AuthLayout>
  )
}
