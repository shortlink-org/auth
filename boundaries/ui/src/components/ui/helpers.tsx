import * as React from 'react'

export type FormDispatcher = () => Promise<void>
export type ValueSetter = (v: unknown) => Promise<void>
