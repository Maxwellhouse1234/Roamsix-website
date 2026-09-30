import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { router } from './router'
import './index.css'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const application = <RouterProvider router={router} future={{ v7_startTransition: true }} />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {clerkPublishableKey
      ? <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/member/login">{application}</ClerkProvider>
      : application}
  </React.StrictMode>
)
