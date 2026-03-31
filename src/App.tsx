import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/app/routes/AppRouter"
import { Toaster } from "react-hot-toast"
import "@/utils/fixDatabase" // Load database fix utility
import DataDebugger from "@/components/debug/DataDebugger"

function App() {

  return (
    <>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      {/* <DataDebugger /> */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App
