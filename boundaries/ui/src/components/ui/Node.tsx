'use client'

import * as React from 'react'
import type { UiNode } from '@ory/client'
import {
    isUiNodeAnchorAttributes,
    isUiNodeImageAttributes,
    isUiNodeInputAttributes,
    isUiNodeScriptAttributes,
    isUiNodeTextAttributes,
} from '@ory/integrations/ui'

import type { FormDispatcher, ValueSetter } from './helpers'
import { NodeAnchor } from './NodeAnchor'
import { NodeImage } from './NodeImage'
import { NodeInput } from './NodeInput'
import { NodeScript } from './NodeScript'
import { NodeText } from './NodeText'

export interface NodeProps {
    node: UiNode
    disabled: boolean
    value: unknown
    setValue: ValueSetter
    dispatchSubmit: FormDispatcher
}

export function Node({ node, value, setValue, disabled, dispatchSubmit }: NodeProps) {
    const attrs = node.attributes

    if (isUiNodeImageAttributes(attrs)) return <NodeImage node={node} attributes={attrs} />
    if (isUiNodeScriptAttributes(attrs)) return <NodeScript node={node} attributes={attrs} />
    if (isUiNodeTextAttributes(attrs)) return <NodeText node={node} attributes={attrs} />
    if (isUiNodeAnchorAttributes(attrs)) return <NodeAnchor node={node} attributes={attrs} />

    if (isUiNodeInputAttributes(attrs)) {
        return (
            <NodeInput
                node={node}
                attributes={attrs}
                disabled={disabled}
                value={value}
                setValue={setValue}
                dispatchSubmit={dispatchSubmit} // now matches expected async type
            />
        )
    }

    return null
}
