import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type Theme = "light" | "dark"

const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) return stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "light"
  }
  return "light"
}

interface ThemeState {
  theme: Theme
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "light" : "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme)
        if (state.theme === "light") {
          document.documentElement.classList.add("light")
        } else {
          document.documentElement.classList.remove("light")
        }
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload)
        if (action.payload === "light") {
          document.documentElement.classList.add("light")
        } else {
          document.documentElement.classList.remove("light")
        }
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
