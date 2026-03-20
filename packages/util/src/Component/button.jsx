import { styled } from '@stitches/react'

export const Button = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  padding: '0 12px',
  height: 32,
  fontSize: 14,
  lineHeight: 1,
  fontWeight: 500,
  background: 'black',
  color: 'white',
  cursor: 'pointer',
  transition: 'background .15s',
  '&:hover': { background: 'blackA11' },
  '&:focus-visible': { outline: '2px solid black' },
})
