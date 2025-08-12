import FormControl from '@mui/material/FormControl'
import {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
  UpdateLoginFlowBody,
  UpdateRecoveryFlowBody,
  UpdateRegistrationFlowBody,
  UpdateSettingsFlowBody,
  UpdateVerificationFlowBody,
  UiNode,
} from '@ory/client'
import { getNodeId, isUiNodeInputAttributes } from '@ory/integrations/ui'
import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Messages } from './Messages'
import { Node } from './Node'

export type Values = Partial<
  | UpdateLoginFlowBody
  | UpdateRegistrationFlowBody
  | UpdateRecoveryFlowBody
  | UpdateSettingsFlowBody
  | UpdateVerificationFlowBody
>

export type Methods =
  | 'oidc'
  | 'password'
  | 'profile'
  | 'totp'
  | 'webauthn'
  | 'passkey'
  | 'link'
  | 'lookup_secret'

export type Props<T extends Values> = {
  flow?: LoginFlow | RegistrationFlow | SettingsFlow | VerificationFlow | RecoveryFlow
  only?: Methods
  onSubmit: (values: T) => Promise<void> | void
  hideGlobalMessages?: boolean
}

function buildInitialValues<T extends Values>(nodes: UiNode[]): T {
  const result: Record<string, unknown> = {}
  nodes.forEach((node) => {
    if (!isUiNodeInputAttributes(node.attributes)) return
    const { type, name, value } = node.attributes
    if (type === 'button' || type === 'submit') return
    result[name] = value
  })
  return result as T
}

export function Flow<T extends Values>({ flow, only, onSubmit, hideGlobalMessages }: Props<T>) {
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<T>({} as T)
  const [isLoading, setIsLoading] = useState(false)
  const [submitter, setSubmitter] = useState<{ name: string; value: string } | null>(null)

  const nodes = useMemo<UiNode[]>(() => {
    if (!flow) return []
    return flow.ui.nodes.filter(({ group }) => (only ? group === 'default' || group === only : true))
  }, [flow, only])

  // (Re)initialize values when flow or filter changes
  useEffect(() => {
    setValues(buildInitialValues<T>(nodes))
  }, [nodes])

  // Capture which submit control was clicked (works for <button> and <input type="submit">)
  const handleClickCapture: React.MouseEventHandler<HTMLFormElement> = (e) => {
    const target = e.target as HTMLElement | null
    if (!target) return

    // HTMLButtonElement
    if (target instanceof HTMLButtonElement) {
      const type = (target.getAttribute('type') || 'submit').toLowerCase()
      if (type === 'submit' && target.name) {
        setSubmitter({ name: target.name, value: target.value })
      }
    }

    // HTMLInputElement type=submit
    if (target instanceof HTMLInputElement && target.type === 'submit' && target.name) {
      setSubmitter({ name: target.name, value: target.value })
    }
  }

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      event.stopPropagation()

      if (isLoading) return

      const form = event.currentTarget
      const data = new FormData(form)

      // Ensure the clicked submitter is represented in the payload
      if (submitter) {
        data.set(submitter.name, submitter.value)
      }

      // Merge current controlled values with form data
      const body = {
        ...(Object.fromEntries(data) as Record<string, unknown>),
        ...(values as Record<string, unknown>),
      } as T

      try {
        setIsLoading(true)
        await onSubmit(body)
      } finally {
        setIsLoading(false)
        // Reset submitter for the next round
        setSubmitter(null)
      }
    },
    [isLoading, onSubmit, submitter, values]
  )

  if (!flow) return null

  return (
    <form
      ref={formRef}
      action={flow.ui.action}
      method={flow.ui.method}
      onSubmit={handleSubmit}
      onClickCapture={handleClickCapture}
    >
      {!hideGlobalMessages && <Messages messages={flow.ui.messages} />}

      {nodes.map((node) => {
        const id = String(getNodeId(node))
        const valueKey = getNodeId(node) as keyof Values

        return (
          <FormControl margin="normal" key={id} fullWidth>
            <Node
              disabled={isLoading}
              node={node}
              value={values[valueKey as keyof T]}
              // Provide a safe programmatic submit for nodes that need it
              dispatchSubmit={() => {
                formRef.current?.requestSubmit()
                return Promise.resolve()
              }}
              setValue={(val: unknown) =>
                new Promise<void>((resolve) => {
                  setValues((prev) => {
                    const next = { ...prev } as Record<string, unknown>
                    next[String(getNodeId(node))] = val
                    return next as T
                  })
                  resolve()
                })
              }
            />
          </FormControl>
        )
      })}
    </form>
  )
}
