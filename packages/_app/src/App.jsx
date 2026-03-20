import Gallery from './Gallery/gallery'
import { useRoutes } from 'raviger'
import { Home } from './home/Home'
import Create from '@agentix/util/src/Component/Create'
import Connexion from './Connexion/Connexion'
import Generating from './Generating/Generating'

export function App() {
  const route = useRoutes({
    '/': () => <Connexion />,
    '/Gallery': () => <Gallery />,
    '/Create': () => <Create />,
    '/Generating': () => <Generating />,
    '/home': () => <Home />,
  })
  return <main>{route}</main>
}
