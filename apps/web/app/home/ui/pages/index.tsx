import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import Aurora from '#home/ui/components/bg/aurora-background'
import { Button } from '@workspace/ui/components/button'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { motion } from 'framer-motion'
import { Ghost, Lock, MessageCircle, Shield, Sparkles, Users } from 'lucide-react'

export default function Page() {
  const [open, setOpen] = useState(false)

  // on force le theme dark parce que sinon c'est moche
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark', 'pink')
    root.classList.add("dark")
  }, [])

  return (
    <>
      <Aurora
        colorStops={['#06386C', '#06386C', '#06386C']}
        blend={1.0}
        amplitude={2.0}
        speed={0.5}
      />

      <AppLayout layout={'header'}>
        <Main>
          <div className={'h-screen  flex justify-center items-center text-center z-30'}>
            <div>
              <div className={'space-y-3 h-2/3 flex flex-col justify-center'}>
                <h1 className="text-6xl font-bold font-stretch-125%">
                  Le service pour s'exprimer.
                </h1>
                <h2 className={'text-2xl italic '}>
                  Anonyme, sécurisé et impactant.
                </h2>
                <div className={'space-x-2'}>
                  <Button href={'/login'}>Se connecter</Button>
                  <Button variant={'outline'} onClick={() => setOpen(true)}>Pourquoi ce site ?</Button>
                </div>
              </div>
              <div className={'bottom-0 h-full w-full mt-10 text-center text-gray-500'}>
                <h3 className={'text-xs'}>Service non affilié a l'Efrei.</h3>
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[700px] border-none bg-background/95 backdrop-blur-xl shadow-2xl p-0 ring-1 ring-white/10 max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <div className="p-6 relative">
                {/* Decorative background blur */}
                <div className="absolute -top-20 -right-20 h-64 w-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <DialogHeader className="relative z-10 mb-6">
                  <DialogTitle className="text-4xl font-black flex items-center gap-3">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                      Pourquoi ce site ?
                    </span>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400/20" />
                    </motion.div>
                  </DialogTitle>
                  <DialogDescription className="text-lg text-muted-foreground/80">
                    Plus qu'un simple site web, un véritable outil de changement.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Ghost className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-blue-100">Anonymat Total</h3>
                    <p className="text-sm text-blue-200/60 leading-relaxed">
                      Vos réponses aux sondages sont désolidarisées de votre compte. Libérez votre parole sans crainte de répercussions.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-green-100">Impact Concret</h3>
                    <p className="text-sm text-green-200/60 leading-relaxed">
                      Nous consolidons les données pour les transmettre directement à l'administration. Soyez acteurs de votre école.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-6 w-6 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-pink-100">Débat Public</h3>
                    <p className="text-sm text-pink-200/60 leading-relaxed">
                      Un fil d'actualité pour partager des idées et débattre. L'anonymat est aussi possible ici pour les sujets sensibles.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Lock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-yellow-100">Safe Place</h3>
                    <p className="text-sm text-yellow-200/60 leading-relaxed">
                      Tolérance zéro pour le harcèlement. Une modération stricte garantit un espace bienveillant et conforme au RGPD.
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="bg-white/5 p-6 border-t border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative z-10 text-center space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground uppercase tracking-widest font-medium">
                    <Users className="h-4 w-4" />
                    <span>Par des étudiants, pour des étudiants</span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                    Exprime toi  <br className="hidden" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                      librement dès maintenant
                    </span>.
                  </h4>
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        </Main>
      </AppLayout>
    </>
  )
}
