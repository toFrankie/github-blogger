import {createRoot} from 'react-dom/client'
import App from './app'

const rootElem = document.getElementById('root')
if (rootElem) {
  const root = createRoot(rootElem)
  root.render(<App />)
}
