'use client'

// @ts-nocheck
import { RecoveryFlow, UpdateRecoveryFlowBody } from '@ory/client'
import { AxiosError } from 'axios'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { Flow } from '@/components/ui/Flow'
import { handleFlowError } from '@/pkg/errors'
import ory from '@/pkg/sdk'

// <BreadcrumbJsonLd
// itemListElements={[
//     {
//       position: 1,
//       name: 'Login page',
//       item: 'https://shortlink.best/next/auth/login',
//     },
// {
//   position: 2,
//     name: 'Forgot Password',
//   item: 'https://shortlink.best/next/auth/forgot',
// },
// {
//   position: 3,
//     name: 'Registration page',
//   item: 'https://shortlink.best/next/auth/registration',
// },
// ]}
// />

const ForgotContent: React.FC = () => {
  const [flow, setFlow] = useState<RecoveryFlow | undefined>(undefined)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Derive params as stable strings
  const flowId = useMemo(() => searchParams.get('flow') ?? null, [searchParams])
  const returnTo = useMemo(() => searchParams.get('return_to') ?? null, [searchParams])

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (flow) {
      return
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getRecoveryFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data)
        })
        .catch(handleFlowError(router, 'recovery', setFlow))
      return
    }

    // Otherwise, we initialize it
    ory
      .createBrowserRecoveryFlow({
        returnTo: String(returnTo || ''),
      })
      .then(({ data }) => {
        setFlow(data)
      })
      .catch(handleFlowError(router, 'recovery', setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          // @ts-expect-error - response.data type is not properly typed in axios
          setFlow(err.response?.data)
          return
        }

        return Promise.reject(err)
      })
  }, [flowId, router, returnTo, flow])

  const onSubmit = (values: UpdateRecoveryFlowBody) => {
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/forgot?flow=${flow?.id}`)

    ory
      .updateRecoveryFlow({
        flow: String(flow?.id),
        updateRecoveryFlowBody: values,
      })
      .then(({ data }) => {
        // Form submission was successful, show the message to the user!
        setFlow(data)
      })
      .catch(handleFlowError(router, 'recovery', setFlow))
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the form validation had an error
            // @ts-expect-error - response.data type is not properly typed in axios
            setFlow(err.response?.data)
            return
          default:
          // Otherwise, we nothitng - the error will be handled by the Flow component
        }

        throw err
      })
  }

  return (
    <>
      {/*<NextSeo title="Forgot Password" description="Forgot Password" />*/}

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
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">Reset Password</h3>
                  <p className="text-sm sm:text-base text-gray-400 drop-shadow">No problem!</p>
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
                  Forgot Password
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter your email to reset
                </p>

                <Flow onSubmit={onSubmit} flow={flow} />

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                  <Link 
                    href="/login"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 hover:underline"
                  >
                    Back to Login
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

const Page: NextPage = () => {
  const { FormSkeleton } = require('@/components/ui/LoadingSkeleton')
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
      <ForgotContent />
    </Suspense>
  )
}

export default Page
