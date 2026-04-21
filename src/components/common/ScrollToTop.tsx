import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTo(0, 0)
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
