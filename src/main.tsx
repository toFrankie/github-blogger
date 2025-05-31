import {Buffer} from 'buffer'
import {createRoot} from 'react-dom/client'
import AppProvider from '@/app-provider'

// for gray-matter
window.Buffer = Buffer

const rootElem = document.getElementById('root')
if (rootElem) {
  const root = createRoot(rootElem)
  root.render(<AppProvider />)
}
