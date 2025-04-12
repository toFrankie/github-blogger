import {BaseStyles, ThemeProvider} from '@primer/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import App from '@/app'

const queryClient = new QueryClient()

export default function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BaseStyles>
          <App />
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
