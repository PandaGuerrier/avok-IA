import { createContext, useContext } from 'react'
import { Transmit } from '@adonisjs/transmit-client'
import UserDto from '#users/dtos/user'

type TransmitContextType = {
  transmit: Transmit | null
}

const TransmitContext = createContext<TransmitContextType>({
  transmit: null,
})

export function TransmitProvider({ children }: { children: React.ReactNode; user?: UserDto }) {
  // const [transmit, setTransmit] = useState<Transmit | null>(null)
  /*useEffect(() => {
    const service = new TransmitService(window.location.origin)
    service.init(user)

    setTransmit(service.transmit)

    return () => {
      service.close()
    }
  }, [])

  return (
    <TransmitContext.Provider value={{ transmit }}>
      {children}
    </TransmitContext.Provider>
  )*/
  return <>{children}</>
}

export function useTransmit() {
  return useContext(TransmitContext)
}
