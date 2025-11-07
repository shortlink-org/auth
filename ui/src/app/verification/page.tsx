'use client'

import { VerificationFlow, UpdateVerificationFlowBody } from '@ory/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { Flow } from '@/components/ui/Flow'
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

  if (!flow) return null

  return (
    <>
      {/*<NextSeo title="Verification" description="Verify your account" />*/}

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
                <h3 className="inline-block text-4xl font-bold">Login</h3>
                <p className="text-gray-500 whitespace-nowrap">Verification page for your account</p>
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
                Verification <span className="font-light text-gray-400">to your account</span>
              </h3>

              <Flow<UpdateVerificationFlowBody> key="verification" onSubmit={onSubmit} flow={flow} />

              <div className="flex items-center justify-between">
                <Link href="/forgot" className="no-underline">
                  <p className="mt-4 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Forgot password?
                  </p>
                </Link>

                <Link href="/registration" className="no-underline">
                  <p className="mt-4 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Don&apos;t have an account? Sign Up
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

const VerificationWrapper: NextPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Page />
  </Suspense>
)

export default VerificationWrapper
