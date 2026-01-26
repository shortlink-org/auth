'use client'

// @ts-nocheck
import { LoginFlow, UpdateLoginFlowBody } from '@ory/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import { AxiosError } from 'axios'

import { Flow } from '@/components/ui/Flow'
import { handleGetFlowError, handleFlowError } from '@/pkg/errors'
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

const SignIn: NextPage = () => {
  const [flow, setFlow] = useState<LoginFlow>()

  // Get ?flow=... from the URL
  const router = useRouter()
  const searchParams = useSearchParams()
  const flowId = searchParams.get('flow')
  const returnTo = searchParams.get('return_to')
  // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
  // of a user.
  const refresh = searchParams.get('refresh')
  // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
  // to perform two-factor authentication/verification.
  const aal = searchParams.get('aal')

  useEffect(() => {
    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      if (flow?.id === flowId) {
        return
      }

      ory
        .getLoginFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data)
        })
        .catch(handleGetFlowError(router, 'login', setFlow))
      return
    }

    // If no flow is set yet, initialize it
    if (flow) {
      return
    }

    ory
      .createBrowserLoginFlow({
        refresh: Boolean(refresh),
        aal: aal ? String(aal) : undefined,
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data)
      })
      .catch(handleFlowError(router, 'login', setFlow))
  }, [flowId, router, aal, refresh, returnTo, flow])

  const onSubmit = (values: UpdateLoginFlowBody) => {
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/login?flow=${flow?.id}`)

    ory
      .updateLoginFlow({
        flow: String(flow?.id),
        updateLoginFlowBody: values,
      })
      // We logged in successfully! Let's bring the user home.
      .then(() => {
        if (flow?.return_to) {
          window.location.href = flow?.return_to
          return
        }
        router.push('/')
      })
      .then(() => {})
      .catch(handleFlowError(router, 'login', setFlow))
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
  }

  return (
    <>
      {/*<NextSeo title="Login" description="Login to your account" />*/}

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
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">Login</h3>
                  <p className="text-sm sm:text-base text-gray-400 drop-shadow">Welcome back!</p>
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
                  Sign In
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  to your account
                </p>

                <Flow key="login" onSubmit={onSubmit} flow={flow} />

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
                    Don&apos;t have an account?
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

const LoginWrapper: NextPage = () => {
  const { FormSkeleton } = require('@/components/ui/LoadingSkeleton')
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
            <FormSkeleton />
          </div>
        </div>
      </div>
    }>
      <SignIn />
    </Suspense>
  )
}

export default LoginWrapper
