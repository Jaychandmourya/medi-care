import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Proxy endpoint for NPI Registry API
app.get('/api/npi', async (req, res) => {
  try {
    const { version, first_name, last_name, taxonomy_description, city, state, skip, limit } = req.query

    // Build the NPI API URL
    const params = new URLSearchParams()

    if (version) params.append('version', version.toString())
    if (first_name) params.append('first_name', first_name.toString())
    if (last_name) params.append('last_name', last_name.toString())
    if (taxonomy_description) params.append('taxonomy_description', taxonomy_description.toString())
    if (city) params.append('city', city.toString())
    if (state) params.append('state', state.toString())
    if (skip) params.append('skip', skip.toString())
    if (limit) params.append('limit', limit.toString())

    const npiUrl = `https://npiregistry.cms.hhs.gov/api?${params.toString()}`
    console.log('Proxying request to:', npiUrl)

    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(npiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NPI-Proxy/1.0)',
        'Accept': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`NPI API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    res.json(data)
  } catch (error) {
    console.error('Error proxying NPI request:', error)

    // Handle different types of errors
    let errorMessage = 'Failed to fetch data from NPI Registry'
    let statusCode = 500

    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - NPI API is taking too long to respond'
      statusCode = 408
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout - Unable to reach NPI API'
      statusCode = 408
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'NPI API server not found - Check your internet connection'
      statusCode = 503
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`NPI Proxy server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`NPI API proxy: http://localhost:${PORT}/api/npi`)
})
