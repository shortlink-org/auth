import { UiNode, UiNodeScriptAttributes } from '@ory/client'
import { HTMLAttributeReferrerPolicy, useEffect } from 'react'

interface Props {
  node: UiNode
  attributes: UiNodeScriptAttributes
}

const TURNSTILE_SRC_MARKER = 'challenges.cloudflare.com/turnstile'
const TURNSTILE_IFRAME_SELECTOR = 'iframe[src*="challenges.cloudflare.com/turnstile"]'
const TURNSTILE_CONTAINER_SELECTOR = '.cf-turnstile,[data-cf-turnstile]'

function cleanupTurnstileFrames() {
  // Remove known Turnstile host iframes first to avoid unload handlers in subframes
  // disqualifying bfcache on back/forward navigation.
  document
    .querySelectorAll<HTMLIFrameElement>(TURNSTILE_IFRAME_SELECTOR)
    .forEach((iframe) => iframe.remove())

  // Clear widget containers in case Turnstile re-inserts iframes through retained nodes.
  document
    .querySelectorAll<HTMLElement>(TURNSTILE_CONTAINER_SELECTOR)
    .forEach((container) => container.replaceChildren())
}

export function NodeScript({ attributes }: Props) {
  useEffect(() => {
    const src = attributes.src
    if (!src) {
      return
    }

    const isTurnstileScript = src.includes(TURNSTILE_SRC_MARKER)

    const script = document.createElement('script')

    script.async = true
    script.setAttribute('data-testid', `node/script/${attributes.id}`)
    script.src = src
    script.async = attributes.async
    script.crossOrigin = attributes.crossorigin
    script.integrity = attributes.integrity
    script.referrerPolicy = attributes.referrerpolicy as HTMLAttributeReferrerPolicy
    script.type = attributes.type

    document.body.appendChild(script)

    const handlePageHide = () => {
      if (isTurnstileScript) {
        cleanupTurnstileFrames()
      }
    }

    const handleVisibilityChange = () => {
      if (isTurnstileScript && document.visibilityState === 'hidden') {
        cleanupTurnstileFrames()
      }
    }

    if (isTurnstileScript) {
      window.addEventListener('pagehide', handlePageHide, true)
      document.addEventListener('visibilitychange', handleVisibilityChange, true)
    }

    return () => {
      if (isTurnstileScript) {
        cleanupTurnstileFrames()
        window.removeEventListener('pagehide', handlePageHide, true)
        document.removeEventListener('visibilitychange', handleVisibilityChange, true)
      }
      script.remove()
    }
  }, [
    attributes.id,
    attributes.src,
    attributes.async,
    attributes.crossorigin,
    attributes.integrity,
    attributes.referrerpolicy,
    attributes.type,
  ])

  return null
}
