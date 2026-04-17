import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/app/routes/AppRouter"
import { Toaster } from "react-hot-toast"
import "@/utils/fixDatabase" // Load database fix utility
import { useEffect } from "react"
import { useAppSelector } from "@/app/hooks"

function App() {
  const theme = useAppSelector((state) => state.theme.theme)

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
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
