import {Buffer} from 'buffer'
import {createRoot} from 'react-dom/client'
import AppProvider from '@/app-provider'
import {setupExternalLinkInterceptor} from '@/utils'

// for gray-matter
window.Buffer = Buffer

setupExternalLinkInterceptor()

const rootElem = document.getElementById('root')
if (rootElem) {
  const root = createRoot(rootElem)
  root.render(<AppProvider />)
}
