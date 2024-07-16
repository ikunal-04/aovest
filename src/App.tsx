import { Toaster } from "react-hot-toast";
import { HashRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/landing/Landing";
import VestPage from "./pages/app/vest/Vest";
import HistoryPage from "./pages/app/history/History";
import NotFound404Page from "./pages/404/NotFound404Page";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/notfound/NotFound";

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
        <Route
          path="/app/vest"
          element={
            <PrivateRoute>
            <AppLayout>
              <VestPage />
            </AppLayout>
          </PrivateRoute>
          }
        />
        <Route
          path="/app/history"
          element={
            <PrivateRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/404"
          element={
            <AppLayout>
              <NotFound404Page />
            </AppLayout>
          }
        />

        <Route 
          path="/not-found"
          element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          }
        />
      </Routes>

      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
