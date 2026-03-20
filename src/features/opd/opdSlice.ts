import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Token {
  tokenId: number
  patientName: string
  department: string
  doctorId: string
  issuedAt: Date
  status: 'waiting' | 'in-progress' | 'skipped' | 'done'
  waitTime?: number
}

export interface OPDState {
  queue: Token[]
  currentToken: number | null
  simulationRunning: boolean
  servedToday: number
  lastTokenId: number
  departments: string[]
  doctors: { [key: string]: string }
  countdownTimer: number
}

const initialState: OPDState = {
  queue: [],
  currentToken: null,
  simulationRunning: false,
  servedToday: 0,
  lastTokenId: 0,
  departments: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology'],
  doctors: {
    'DOC001': 'Dr. Smith - General Medicine',
    'DOC002': 'Dr. Johnson - Cardiology',
    'DOC003': 'Dr. Williams - Orthopedics',
    'DOC004': 'Dr. Brown - Pediatrics',
    'DOC005': 'Dr. Davis - Dermatology',
  },
  countdownTimer: 30
}

const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    issueToken: (state, action: PayloadAction<{ patientName: string; department: string; doctorId: string }>) => {
      const { patientName, department, doctorId } = action.payload
      state.lastTokenId += 1

      const newToken: Token = {
        tokenId: state.lastTokenId,
        patientName,
        department,
        doctorId,
        issuedAt: new Date(),
        status: 'waiting',
        waitTime: 0
      }

      state.queue.push(newToken)

      // Set as current token if it's the first one
      if (state.queue.length === 1) {
        state.currentToken = newToken.tokenId
      }
    },

    advanceQueue: (state) => {
      const currentIndex = state.queue.findIndex(token => token.tokenId === state.currentToken)

      if (currentIndex !== -1) {
        // Mark current token as done
        state.queue[currentIndex].status = 'done'
        state.servedToday += 1

        // Find next waiting token
        const nextIndex = state.queue.findIndex((token, index) =>
          index > currentIndex && token.status === 'waiting'
        )

        if (nextIndex !== -1) {
          state.currentToken = state.queue[nextIndex].tokenId
          state.queue[nextIndex].status = 'in-progress'
        } else {
          state.currentToken = null
        }
      } else if (state.queue.length > 0) {
        // No current token set, set first waiting token
        const firstWaiting = state.queue.find(token => token.status === 'waiting')
        if (firstWaiting) {
          state.currentToken = firstWaiting.tokenId
          firstWaiting.status = 'in-progress'
        }
      }
    },

    skipToken: (state, action: PayloadAction<number>) => {
      const tokenToSkip = state.queue.find(token => token.tokenId === action.payload)
      if (tokenToSkip && tokenToSkip.status === 'in-progress') {
        tokenToSkip.status = 'skipped'

        // Move to end of queue as waiting
        const index = state.queue.findIndex(token => token.tokenId === action.payload)
        const [skippedToken] = state.queue.splice(index, 1)
        skippedToken.status = 'waiting'
        state.queue.push(skippedToken)

        // Advance to next token using the same logic as advanceQueue
        const currentIndex = state.queue.findIndex(token => token.tokenId === action.payload)
        if (currentIndex !== -1) {
          const nextIndex = state.queue.findIndex((token, index) =>
            index > currentIndex && token.status === 'waiting'
          )

          if (nextIndex !== -1) {
            state.currentToken = state.queue[nextIndex].tokenId
            state.queue[nextIndex].status = 'in-progress'
          } else {
            state.currentToken = null
          }
        }
      }
    },

    requeueToken: (state, action: PayloadAction<number>) => {
      const tokenToRequeue = state.queue.find(token => token.tokenId === action.payload)
      if (tokenToRequeue && tokenToRequeue.status === 'skipped') {
        tokenToRequeue.status = 'waiting'
      }
    },

    toggleSimulation: (state) => {
      state.simulationRunning = !state.simulationRunning
      if (state.simulationRunning) {
        state.countdownTimer = 30
      }
    },

    decrementTimer: (state) => {
      if (state.countdownTimer > 0) {
        state.countdownTimer -= 1
      }
    },

    resetTimer: (state) => {
      state.countdownTimer = 30
    },

    updateWaitTimes: (state) => {
      const now = new Date()
      state.queue.forEach(token => {
        if (token.status === 'waiting' || token.status === 'skipped') {
          token.waitTime = Math.floor((now.getTime() - token.issuedAt.getTime()) / 1000 / 60) // minutes
        }
      })
    },

    resetQueue: (state) => {
      state.queue = []
      state.currentToken = null
      state.servedToday = 0
      state.lastTokenId = 0
      state.simulationRunning = false
    }
  }
})

export const { issueToken, advanceQueue, skipToken, requeueToken, toggleSimulation, decrementTimer, resetTimer, updateWaitTimes, resetQueue } = opdSlice.actions
export default opdSlice.reducer
