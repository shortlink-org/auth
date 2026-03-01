'use client'

import { VerificationFlow, UpdateVerificationFlowBody } from '@ory/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { Flow } from '@/components/ui/Flow'
import { FormSkeleton } from '@/components/ui/LoadingSkeleton'
import ory from '@/pkg/sdk'

const Page: NextPage = () => {
  const [flow, setFlow] = useState<VerificationFlow | undefined>(undefined)

  const router = useRouter()
  const searchParams = useSearchParams()

  const flowId = useMemo(() => searchParams.get('flow'), [searchParams])
  const returnTo = useMemo(() => searchParams.get('return_to'), [searchParams])

  // Init / fetch verification flow
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        if (flow) return

        if (flowId) {
          const { data } = await ory.getVerificationFlow({ id: flowId })
          if (!cancelled) setFlow(data)
          return
        }

        const { data } = await ory.createBrowserVerificationFlow({
          returnTo: returnTo ?? undefined,
        })
        if (!cancelled) setFlow(data)
      } catch (err: unknown) {
        // If flow is expired or forbidden, start a new one
        const anyErr = err as { response?: { status?: number } }
        if (anyErr.response?.status === 410 || anyErr.response?.status === 403) {
          router.push('/verification')
          return
        }
        // For a bad request while creating, just go home
        if (anyErr.response?.status === 400) {
          router.push('/')
          return
        }
        // Optional: rethrow to error boundary
        // throw err
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [flow, flowId, returnTo, router])

  const onSubmit = useCallback(
    async (values: UpdateVerificationFlowBody) => {
      if (!flow?.id) return

      // Keep flow ID in the URL so reloads don’t lose state
      router.push(`/verification?flow=${flow.id}`)

      try {
        const { data } = await ory.updateVerificationFlow({
          flow: flow.id,
          updateVerificationFlowBody: values,
        })
        // Successful submission (status and messages are returned in the flow)
        setFlow(data)
      } catch (err: unknown) {
        const anyErr = err as { response?: { status?: number; data?: unknown } }

        // Validation error returns updated flow with field messages
        if (anyErr.response?.status === 400 && anyErr.response.data) {
          setFlow(anyErr.response.data as VerificationFlow)
          return
        }

        // Flow is no longer valid — Ory returns a new flow id to continue with
        if (anyErr.response?.status === 410 && anyErr.response.data) {
          const payload = anyErr.response.data as { use_flow_id?: string }
          if (payload.use_flow_id) {
            const newFlowID = payload.use_flow_id
            router.push(`/verification?flow=${newFlowID}`)
            const { data } = await ory.getVerificationFlow({ id: newFlowID })
            setFlow(data)
            return
          }
        }

        // Expired/forbidden -> restart
        if (anyErr.response?.status === 403) {
          router.push('/verification')
          return
        }

        // Optional: rethrow to any error boundary
        // throw err
      }
    },
    [flow, router]
  )

  return (
    <>
      {/*<NextSeo title="Verification" description="Verify your account" />*/}

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
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">Verify</h3>
                  <p className="text-sm sm:text-base text-gray-400 drop-shadow">Confirm your account</p>
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
                  Verification
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Verify your account
                </p>

                {flow ? (
                  <Flow<UpdateVerificationFlowBody> key="verification" onSubmit={onSubmit} flow={flow} />
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                  <Link 
                    href="/forgot"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>

                  <Link 
                    href="/registration"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 hover:underline"
                  >
                    Create Account
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

const VerificationWrapper: NextPage = () => {
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
      <Page />
    </Suspense>
  )
}

export default VerificationWrapper
