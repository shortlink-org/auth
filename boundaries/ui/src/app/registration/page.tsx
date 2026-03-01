'use client'

import { RegistrationFlow, UpdateRegistrationFlowBody } from '@ory/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { Flow } from '@/components/ui/Flow'
import { FormSkeleton } from '@/components/ui/LoadingSkeleton'
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
      router.push(`/registration?flow=${flow.id}`)

      try {
        const { data } = await ory.updateRegistrationFlow({
          flow: flow.id,
          updateRegistrationFlowBody: values,
        })

        // Handle next steps if present (e.g., verification)
        if (data.continue_with && data.continue_with.length > 0) {
          for (const item of data.continue_with) {
            if (item.action === 'show_verification_ui') {
              router.push(`/verification?flow=${item.flow.id}`)
              return
            }
          }
        }

        // Otherwise go home or return_to
        // Use window.location to bypass basePath and redirect to main site
        window.location.href = flow.return_to || 'https://shortlink.best/next'
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

  return (
    <>
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
            {/* Top/Left side - Image panel */}
            <div
              className="relative overflow-hidden bg-cover bg-center w-full sm:w-5/12 min-h-[200px] sm:min-h-full"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80')",
              }}
            >
              {/* Light overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-end p-6 sm:p-10 text-white w-full h-full animate-slide-in-left">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">Register</h3>
                  <p className="text-sm sm:text-base text-gray-400 drop-shadow">Signup for an Account</p>
                </div>
              </div>
              
              {/* Decorative SVG - only on desktop */}
              <svg
                className="hidden sm:block absolute right-0 inset-y-0 h-full w-16 fill-current text-white z-10"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <polygon points="0,0 100,100 100,0" />
              </svg>
            </div>

            {/* Bottom/Right side - Form */}
            <div className="flex-1 p-6 sm:p-12 animate-slide-in-right">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started for free
                </p>

                {flow ? (
                  <Flow<UpdateRegistrationFlowBody> onSubmit={onSubmit} flow={flow} />
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                )}

                <div className="mt-6 flex justify-center text-sm">
                  <Link 
                    href="/login" 
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 hover:underline"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const SignUp: NextPage = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
            <FormSkeleton />
          </div>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}

export default SignUp
