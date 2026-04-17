import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/features/db/dexie'
import type { Appointment } from '@/types/appointment/appointmentType'
import type { OPDState, Token } from '@/types/opd/opdType'

const initialState: OPDState = {
  queue: [],
  currentToken: null,
  simulationRunning: false,
  servedToday: 0,
  lastTokenId: 0,
  departments: [
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Cardiovascular Disease',
    'Orthopaedic Surgery',
    'Neurology',
    'General Surgery',
    'Psychiatry',
    'Emergency Medicine',
    'Obstetrics & Gynecology',
    'Anesthesiology',
    'Dermatology',
    'General Medicine',
    'Cardiology',
    'Orthopedics'
  ],
  countdownTimer: 30
}

const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    issueToken: (state, action: PayloadAction<{ patientName: string; patientId?: string; department: string; doctorId: string }>) => {
      const { patientName, patientId, department, doctorId } = action.payload
      state.lastTokenId += 1

      const newToken: Token = {
        tokenId: state.lastTokenId,
        patientId,
        patientName,
        department,
        doctorId,
        issuedAt: new Date().toISOString(),
        status: 'waiting',
        waitTime: 0
      }

      state.queue.push(newToken)

      // Save as appointment to database
      const appointmentId = `opd-${Date.now()}-${newToken.tokenId}`
      const appointment: Appointment = {
        id: appointmentId,
        patientId: patientId || `temp-${Date.now()}`,
        doctorId,
        department,
        date: new Date().toISOString().split('T')[0],
        slot: 'OPD',
        duration: 15,
        status: 'scheduled',
        reason: 'OPD Token',
        notes: `Token ID: ${newToken.tokenId}${patientName ? ` - Patient: ${patientName}` : ''}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to database asynchronously
      db.appointments.add(appointment).catch(error => {
        console.error('Failed to save OPD appointment:', error)
      })

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

        // Update appointment status in database
        const completedToken = state.queue[currentIndex]
        db.appointments.where('id').startsWith(`opd-${completedToken.tokenId}`).first().then(appointment => {
          if (appointment) {
            return db.appointments.update(appointment.id, {
              status: 'completed',
              updatedAt: new Date().toISOString()
            })
          }
        }).catch(error => {
          console.error('Failed to update appointment status:', error)
        })

        // Find next waiting token
        const nextIndex = state.queue.findIndex((token, index) =>
          index > currentIndex && token.status === 'waiting'
        )

        if (nextIndex !== -1) {
          state.currentToken = state.queue[nextIndex].tokenId
          state.queue[nextIndex].status = 'in-progress'

          // Update next token to in-progress in database
          const nextToken = state.queue[nextIndex]
          db.appointments.where('id').startsWith(`opd-${nextToken.tokenId}`).first().then(appointment => {
            if (appointment) {
              return db.appointments.update(appointment.id, {
                status: 'in_progress',
                updatedAt: new Date().toISOString()
              })
            }
          }).catch(error => {
            console.error('Failed to update appointment status:', error)
          })
        } else {
          state.currentToken = null
        }
      } else if (state.queue.length > 0) {
        // No current token set, set first waiting token
        const firstWaiting = state.queue.find(token => token.status === 'waiting')
        if (firstWaiting) {
          state.currentToken = firstWaiting.tokenId
          firstWaiting.status = 'in-progress'

          // Update first waiting token to in-progress in database
          db.appointments.where('id').startsWith(`opd-${firstWaiting.tokenId}`).first().then(appointment => {
            if (appointment) {
              return db.appointments.update(appointment.id, {
                status: 'in_progress',
                updatedAt: new Date().toISOString()
              })
            }
          }).catch(error => {
            console.error('Failed to update appointment status:', error)
          })
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
          const issuedAt = new Date(token.issuedAt)
          token.waitTime = Math.floor((now.getTime() - issuedAt.getTime()) / 1000 / 60) // minutes
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
