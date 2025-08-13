'use client'

import { RegistrationFlow, UpdateRegistrationFlowBody } from '@ory/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { Flow } from '@/components/ui/Flow'
import { handleFlowError } from '@/pkg/errors'
import ory from '@/pkg/sdk'

// Renders the registration page
const SignUpContent: React.FC = () => {
  const [flow, setFlow] = useState<RegistrationFlow | undefined>(undefined)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Derive params as stable strings
  const flowId = useMemo(() => searchParams.get('flow') ?? null, [searchParams])
  const returnTo = useMemo(() => searchParams.get('return_to') ?? null, [searchParams])

  // Init/fetch the registration flow
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        if (flow) return

        if (flowId) {
          const { data } = await ory.getRegistrationFlow({ id: flowId })
          if (!cancelled) setFlow(data)
          return
        }

        const { data } = await ory.createBrowserRegistrationFlow({
          returnTo: returnTo ?? undefined,
        })
        if (!cancelled) setFlow(data)
      } catch (err: unknown) {
        // Delegate Ory-specific navigation/refresh handling
        if (err && typeof err === 'object' && 'response' in err) {
          handleFlowError(router, 'registration', setFlow)(err as any)
        }
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [flow, flowId, returnTo, router])

  const onSubmit = useCallback(
    async (values: UpdateRegistrationFlowBody) => {
      if (!flow?.id) return

      // Keep flow id in URL so reloads don’t lose state
      router.push(`/auth/registration?flow=${flow.id}`)

      try {
        const { data } = await ory.updateRegistrationFlow({
          flow: flow.id,
          updateRegistrationFlowBody: values,
        })

        // Handle next steps if present (e.g., verification)
        if (data.continue_with && data.continue_with.length > 0) {
          for (const item of data.continue_with) {
            if (item.action === 'show_verification_ui') {
              router.push(`/auth/verification?flow=${item.flow.id}`)
              return
            }
          }
        }

        // Otherwise go home or return_to
        router.push(flow.return_to || '/')
      } catch (err: unknown) {
        // handleFlowError will do redirects/refresh for expired/invalid flows
        if (err && typeof err === 'object' && 'response' in err) {
          handleFlowError(router, 'registration', setFlow)(err as any)
        }

        // If still not handled, it might be a validation error (400) with flow payload
        if (typeof err === 'object' && err !== null) {
          const anyErr = err as { response?: { status?: number; data?: unknown } }
          if (anyErr.response?.status === 400 && anyErr.response.data) {
            // Ory returns the updated flow containing field errors
            setFlow(anyErr.response.data as RegistrationFlow)
            return
          }
        }

        // Re-throw for any global error boundary (optional)
        // throw err
      }
    },
    [flow, router]
  )

  if (!flow) return null

  return (
    <>
      <div className="flex h-full p-4 rotate">
        <div className="w-full m-auto sm:max-w-xl md:max-w-3xl">
          <div className="flex items-stretch overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800 border-t-4 border-indigo-500 sm:border-0">
            <div
              className="relative hidden w-4/12 bg-gray-600 py-4 text-gray-300 sm:block md:w-5/12 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80')",
              }}
            >
              <div className="absolute bottom-0 flex-1 p-10 text-white">
                <h3 className="inline-block text-4xl font-bold">Register</h3>
                <p className="whitespace-nowrap text-gray-500">Signup for an Account</p>
              </div>
              <svg
                className="absolute inset-y-0 right-0 h-full w-4/12 fill-current text-white sm:w-2/12"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <polygon points="0,0 100,100 100,0" />
              </svg>
            </div>

            <div className="flex-1 p-6 sm:p-10 sm:py-12">
              <h3 className="mb-6 text-xl font-bold text-gray-700">
                Register <span className="font-light text-gray-400">for an account</span>
              </h3>

              <Flow<UpdateRegistrationFlowBody> onSubmit={onSubmit} flow={flow} />

              <div className="flex justify-end">
                <Link href="/login" className="no-underline">
                  <p className="mt-4 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Already have an account? Log in
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const SignUp: NextPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SignUpContent />
  </Suspense>
)

export default SignUp
