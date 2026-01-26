'use client'

import React from 'react'

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Title skeleton */}
    <div className="space-y-2">
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-3/4" />
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2" />
    </div>

    {/* Input fields skeleton */}
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/4" />
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg" />
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/3" />
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg" />
      </div>
    </div>

    {/* Button skeleton */}
    <div className="h-12 bg-gradient-to-r from-indigo-200 to-indigo-300 dark:from-indigo-900 dark:to-indigo-800 rounded-lg w-full" />

    {/* Links skeleton */}
    <div className="flex justify-between">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/4" />
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/3" />
    </div>
  </div>
)

export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 shadow-xl">
      <FormSkeleton />
    </div>
  </div>
)

export const PageSkeleton: React.FC = () => (
  <div className="flex h-screen items-center justify-center p-4">
    <div className="w-full max-w-md">
      <CardSkeleton />
    </div>
  </div>
)

