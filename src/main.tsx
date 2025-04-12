import {createRoot} from 'react-dom/client'
import AppProvider from '@/app-provider'

const rootElem = document.getElementById('root')
if (rootElem) {
  const root = createRoot(rootElem)
  root.render(<AppProvider />)
}
