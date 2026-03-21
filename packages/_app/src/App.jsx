import Gallery from './Gallery/Gallery.jsx'
import { useRoutes } from 'raviger'
import { Home } from './home/Home.jsx'
import Create from '@agentix/util/src/Component/Create.jsx'
import Connexion from './Connexion/Connexion.jsx'
import Generating from './Generating/Generating.jsx'

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
