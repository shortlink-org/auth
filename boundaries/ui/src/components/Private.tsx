import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { FrontendApi } from '@ory/client'

export default function withAuthSync<P extends object>(Child: React.ComponentType<P>) {
  const WrappedComponent = (props: P) => {
    const [, setSession] = useState<string>(
      'No valid Ory Session was found.\nPlease sign in to receive one.'
    )
    const [, setHasSession] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
      const ory = new FrontendApi()
      ory
        .toSession()
        .then(({ data }) => {
          setSession(JSON.stringify(data, null, 2))
          setHasSession(true)
        })
        .catch((err: AxiosError) => {
          const status = err.response?.status
          if (status === 403 || status === 422) {
            router.push('/login?aal=aal2')
            return
          }
          if (status === 401) {
            // user not logged in, do nothing
            return
          }
          // Otherwise, rethrow for higher-level error handling
          throw err
        })
    }, [router])

    return <Child {...props} />
  }

  WrappedComponent.displayName = `withAuthSync(${Child.displayName || Child.name || 'Component'})`
  return WrappedComponent
}
