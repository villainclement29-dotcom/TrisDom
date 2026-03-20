import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { Link, useNavigate } from 'raviger'

export default function GalleryButton() {
  return (
    <>
      <Button
        style={{
          zIndex: '9999',
          cursor: 'pointer',
        }}>
        <Link
          href='/Gallery'
          style={{
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
          <ArrowLeftIcon style={{ marginRight: '2px' }} />
          Gallerie
        </Link>
      </Button>
    </>
  )
}
