import Button from '@mui/material/Button'
import { UiNode, UiNodeAnchorAttributes } from '@ory/client'

interface Props {
  node: UiNode
  attributes: UiNodeAnchorAttributes
}

export function NodeAnchor({ attributes }: Props) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        window.location.href = attributes.href
      }}
    >
      {attributes.title.text}
    </Button>
  )
}

export default NodeAnchor
