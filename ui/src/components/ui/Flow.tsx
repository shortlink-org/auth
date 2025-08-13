'use client'

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
import React, {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

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

/** Build initial controlled values from UI nodes (skip submit/button types). */
function buildInitialValues<T extends Values>(nodes: UiNode[]): T {
    const result: Record<string, unknown> = {}
    for (const node of nodes) {
        if (!isUiNodeInputAttributes(node.attributes)) continue
        const { type, name, value } = node.attributes
        if (type === 'button' || type === 'submit') continue
        result[name] = value
    }
    return result as T
}

export function Flow<T extends Values>({
                                           flow,
                                           only,
                                           onSubmit,
                                           hideGlobalMessages,
                                       }: Props<T>) {
    const formRef = useRef<HTMLFormElement>(null)

    const [values, setValues] = useState<T>({} as T)
    const [isLoading, setIsLoading] = useState(false)

    // Track which submit control was clicked to ensure its name/value is included.
    const [submitter, setSubmitter] = useState<{ name: string; value: string } | null>(
        null,
    )

    // Safely compute nodes (never undefined), filtered by `only` if provided.
    const nodes = useMemo<UiNode[]>(() => {
        const all = flow?.ui?.nodes ?? []
        if (!only) return all
        return all.filter(({ group }) => group === 'default' || group === only)
    }, [flow, only])

    // (Re)initialize controlled values when nodes change.
    useEffect(() => {
        setValues(buildInitialValues<T>(nodes))
    }, [nodes])

    // Capture which submit element was clicked (button or input[type=submit])
    const handleClickCapture: React.MouseEventHandler<HTMLFormElement> = (e) => {
        const el = e.target as HTMLElement | null
        if (!el) return

        if (el instanceof HTMLButtonElement) {
            const type = (el.getAttribute('type') || 'submit').toLowerCase()
            if (type === 'submit' && el.name) {
                setSubmitter({ name: el.name, value: el.value })
            }
        }

        if (el instanceof HTMLInputElement && el.type === 'submit' && el.name) {
            setSubmitter({ name: el.name, value: el.value })
        }
    }

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            event.stopPropagation()
            if (isLoading) return

            const form = event.currentTarget
            const data = new FormData(form)

            // Ensure clicked submitter is represented
            if (submitter) {
                data.set(submitter.name, submitter.value)
            }

            // Merge uncontrolled form data and our controlled values
            const body = {
                ...(Object.fromEntries(data) as Record<string, unknown>),
                ...(values as Record<string, unknown>),
            } as T

            try {
                setIsLoading(true)
                await onSubmit(body)
            } finally {
                setIsLoading(false)
                setSubmitter(null)
            }
        },
        [isLoading, onSubmit, submitter, values],
    )

    if (!flow?.ui) {
        // Lightweight placeholder while the flow is being fetched
        return <div aria-busy="true">Loading…</div>
    }

    return (
        <form
            ref={formRef}
            noValidate
            action={flow.ui.action}
            method={flow.ui.method}
            onSubmit={handleSubmit}
            onClickCapture={handleClickCapture}
        >
            {!hideGlobalMessages && <Messages messages={flow.ui.messages ?? []} />}

            {nodes.map((node) => {
                const id = String(getNodeId(node))
                const valueKey = getNodeId(node) as keyof Values

                return (
                    <FormControl key={id} margin="normal" fullWidth>
                        <Node
                            node={node}
                            disabled={isLoading}
                            value={values[valueKey as keyof T]}

                            // async: satisfies FormDispatcher = () => Promise<void>
                            dispatchSubmit={async () => {
                                formRef.current?.requestSubmit()
                            }}

                            // async: satisfies ValueSetter = (v: unknown) => Promise<void>
                            setValue={async (val: unknown) => {
                                setValues((prev) => {
                                    const next = { ...(prev as Record<string, unknown>) }
                                    next[String(getNodeId(node))] = val
                                    return next as T
                                })
                            }}
                        />
                    </FormControl>
                )
            })}
        </form>
    )
}
