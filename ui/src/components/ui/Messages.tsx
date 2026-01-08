'use client'

import { UiText } from '@ory/client'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid'

interface MessageProps {
  message: UiText
}

const getMessageStyles = (type: string) => {
  const baseStyles = 'flex items-start gap-3 p-4 rounded-lg shadow-md mb-3 animate-fade-in backdrop-blur-sm'
  
  switch (type) {
    case 'error':
      return `${baseStyles} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`
    case 'success':
      return `${baseStyles} bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`
    case 'info':
      return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`
    default:
      return `${baseStyles} bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`
  }
}

const getMessageIcon = (type: string) => {
  const iconClasses = 'w-5 h-5 flex-shrink-0 mt-0.5'
  
  switch (type) {
    case 'error':
      return <XCircleIcon className={`${iconClasses} text-red-600 dark:text-red-400`} />
    case 'success':
      return <CheckCircleIcon className={`${iconClasses} text-green-600 dark:text-green-400`} />
    case 'info':
      return <InformationCircleIcon className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
    default:
      return <ExclamationCircleIcon className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
  }
}

export function Message({ message }: MessageProps) {
  return (
    <div className={getMessageStyles(message.type)} role="alert">
      {getMessageIcon(message.type)}
      <p 
        className="text-sm font-medium flex-1" 
        data-testid={`ui/message/${message.id}`}
      >
        {message.text}
      </p>
    </div>
  )
}

interface MessagesProps {
  messages?: Array<UiText>
}

export function Messages({ messages }: MessagesProps) {
  if (!messages || messages.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 mb-4">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  )
}
