import { Flex } from '@radix-ui/themes'
import ChatList from './ChatList'
import ChatPrompt from './ChatPrompt'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import { over } from 'lodash'

export function Chat() {
  const [open, setOpen] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)


  const PANEL_WIDTH = 360
  const PANEL_CLOSED = 25

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setFullyOpen(true), 200)
      return () => clearTimeout(timeout)
    } else {
      setFullyOpen(false)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          top: "50%",
          left: open ? PANEL_WIDTH + 16 : 41,
          transform: "translateY(-50%)",
          height: "40px",
          width: "40px",
          borderRadius: "20px",
          border: '2px solid #2F52E0',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          cursor: "pointer",
          transition: `
            left 350ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 350ms cubic-bezier(0.16, 1, 0.3, 1)
          `,
          zIndex: 9999,
        }}>
        {open ? <ChevronRightIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} /> : <ChevronLeftIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} />}
      </button>
      <Flex
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          gap: '4',
          p: '1',
          bottom: 0,
          width: open ? PANEL_WIDTH : PANEL_CLOSED,
          margin: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 0 6px #a7b8f8ff",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: `
            width 350ms cubic-bezier(0.16, 1, 0.3, 1)
          `,
          zIndex: 9998,
        }}>
        { fullyOpen && (
          <>
            <ChatList/>
            <ChatPrompt />
          </>
        )}
      </Flex>

    </>
  )
}

