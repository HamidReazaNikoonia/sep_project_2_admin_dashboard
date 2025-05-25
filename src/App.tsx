import React from 'react'
import { RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

import ErrorBoundary from './components/ErrorBoundary'
import router from './router'

// Create a React Query client
const queryClient = new QueryClient();


const theme = createTheme({
  typography: {
    fontFamily: [
      'Samim',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

const App: React.FC = () => (

  <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
)
App.displayName = 'App'
export default App
