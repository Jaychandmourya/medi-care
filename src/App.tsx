import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/app/routes/AppRouter"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"
import { useAppSelector } from "@/app/hooks"
import ScrollToTop from "@/components/common/ScrollToTop"

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
        <ScrollToTop />
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
