import { getNodeLabel } from '@ory/integrations/ui'
import React, { ChangeEvent } from 'react'

import { NodeInputProps } from './helpers'

export function NodeInputCheckbox({ node, attributes, setValue, disabled }: NodeInputProps) {
  const errorMessage = node.messages.find(({ type }) => type === 'error')

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.checked)
  }

  return (
    <div className="my-4">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          name={attributes.name}
          defaultChecked={attributes.value}
          onChange={handleCheckboxChange}
          disabled={attributes.disabled || disabled}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:border-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
          {getNodeLabel(node)}
        </span>
      </label>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage.text}
        </p>
      )}
    </div>
  )
}
