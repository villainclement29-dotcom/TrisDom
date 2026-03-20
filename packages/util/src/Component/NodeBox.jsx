import { Box } from '@radix-ui/themes'
import { styled } from '@stitches/react'

export const NodeBox = styled(Box, {
  borderRadius: 12,
  maxWidth: 200,
  wordWrap: 'break-word',
  whiteSpace: 'normal',
  overflow: 'hidden',
  textAlign: 'center',
  boxShadow: '0 1px 4px 1px rgba(0, 0, 0, .08)',
  border: '1px solid #222',
  padding: 10,
})
