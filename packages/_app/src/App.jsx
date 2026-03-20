import Gallery from './Gallery/gallery'
import { useRoutes, Link } from 'raviger'
import { Home } from './home/Home'
import Create from '@agentix/util/src/Component/Create'
import Connexion from './Connexion/Connexion'

export function App() {
  const route = useRoutes({
    '/': () => <Connexion />,
    '/Gallery': () => <Gallery />,
    '/Create': () => <Create />,
    '/home': () => <Home />,
  })
  return <main>{route}</main>
}
