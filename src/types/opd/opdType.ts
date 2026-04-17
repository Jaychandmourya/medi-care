export interface Token {
  tokenId: number
  patientId?: string
  patientName: string
  department: string
  doctorId: string
  issuedAt: string
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
  countdownTimer: number
}