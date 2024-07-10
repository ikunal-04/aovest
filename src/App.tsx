import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Landing from './pages/landing/Landing'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          index
          path="/"
          element={
            <AppLayout>
              <Landing />
            </AppLayout>
          }
        />
      </Routes>

      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
