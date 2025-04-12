import {BaseStyles, ThemeProvider} from '@primer/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import App from '@/app'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

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
