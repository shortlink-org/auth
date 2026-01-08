import Button from '@mui/material/Button'
import { getNodeLabel } from '@ory/integrations/ui'

import { NodeInputProps } from './helpers'

export function NodeInputSubmit({ node, attributes, disabled }: NodeInputProps) {
  return (
    <Button
      name={attributes.name}
      variant="contained"
      color="primary"
      type="submit"
      fullWidth
      value={attributes.value || ''}
      disabled={attributes.disabled || disabled}
      className="!py-3 !px-6 !rounded-lg !font-semibold !text-base !normal-case !shadow-lg hover:!shadow-xl !transition-all !duration-200 disabled:!opacity-50 disabled:!cursor-not-allowed !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700"
    >
      {getNodeLabel(node)}
    </Button>
  )
}
