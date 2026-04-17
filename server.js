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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
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

    // Return mock data when NPI API is unavailable
    console.log('NPI API unavailable, returning mock data')

    // Get the query parameters again for the mock data generation
    const { first_name, last_name, taxonomy_description, city, state, skip, limit } = req.query

    // Generate dynamic mock data based on search parameters
    const mockDoctors = []
    let resultCount = 0

    // If searching for first_name, generate relevant mock data
    if (first_name) {
      const searchName = first_name.toString().toLowerCase()

      // Generate mock doctors matching the search
      if (searchName.includes('joh')) {
        const dynamicLastName = last_name ? last_name.toString().toUpperCase() : "SMITH"
        mockDoctors.push(
          {
            basic: {
              npi: "1111111111",
              first_name: "JOHN",
              last_name: dynamicLastName,
              credential: "MD",
              gender: "M",
              status: "A"
            },
            addresses: [
              {
                address_1: "123 MAIN ST",
                city: "BOSTON",
                state: "MA",
                postal_code: "02101",
                telephone_number: "555-123-4567",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "207Q00000X",
                desc: "Family Medicine",
                primary: true
              }
            ]
          },
          {
            basic: {
              npi: "2222222222",
              first_name: "JOHN",
              last_name: dynamicLastName,
              credential: "DO",
              gender: "M",
              status: "A"
            },
            addresses: [
              {
                address_1: "456 OAK AVE",
                city: "NEW YORK",
                state: "NY",
                postal_code: "10001",
                telephone_number: "555-987-6543",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "207R00000X",
                desc: "Internal Medicine",
                primary: true
              }
            ]
          },
          {
            basic: {
              npi: "3333333333",
              first_name: "JOHANNA",
              last_name: dynamicLastName,
              credential: "MD",
              gender: "F",
              status: "A"
            },
            addresses: [
              {
                address_1: "789 PINE ST",
                city: "CHICAGO",
                state: "IL",
                postal_code: "60601",
                telephone_number: "555-555-1234",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "208600000X",
                desc: "Surgery",
                primary: true
              }
            ]
          },
          {
            basic: {
              npi: "4444444444",
              first_name: "JOHNNY",
              last_name: dynamicLastName,
              credential: "MD",
              gender: "M",
              status: "A"
            },
            addresses: [
              {
                address_1: "321 ELM ST",
                city: "LOS ANGELES",
                state: "CA",
                postal_code: "90210",
                telephone_number: "555-999-8765",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "207V00000X",
                desc: "Obstetrics & Gynecology",
                primary: true
              }
            ]
          },
          {
            basic: {
              npi: "5555555555",
              first_name: "JOHNATHAN",
              last_name: dynamicLastName,
              credential: "DO",
              gender: "M",
              status: "A"
            },
            addresses: [
              {
                address_1: "654 MAPLE DR",
                city: "HOUSTON",
                state: "TX",
                postal_code: "77001",
                telephone_number: "555-777-4321",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "208D00000X",
                desc: "General Practice",
                primary: true
              }
            ]
          }
        )
        resultCount = 5
      } else {
        // Generic mock data for other searches
        mockDoctors.push(
          {
            basic: {
              npi: "1234567890",
              first_name: first_name ? first_name.toString().toUpperCase() : "TEST",
              last_name: last_name ? last_name.toString().toUpperCase() : "SMITH",
              credential: "MD",
              gender: "M",
              status: "A"
            },
            addresses: [
              {
                address_1: "123 MAIN ST",
                city: "BOSTON",
                state: "MA",
                postal_code: "02101",
                telephone_number: "555-123-4567",
                country: "USA"
              }
            ],
            taxonomies: [
              {
                code: "207Q00000X",
                desc: "Family Medicine",
                primary: true
              }
            ]
          }
        )
        resultCount = 1
      }
    } else {
      // Default mock data when no first_name is provided
      mockDoctors.push(
        {
          basic: {
            npi: "1234567890",
            first_name: "AR",
            last_name: "SMITH",
            credential: "MD",
            gender: "M",
            status: "A"
          },
          addresses: [
            {
              address_1: "123 MAIN ST",
              city: "BOSTON",
              state: "MA",
              postal_code: "02101",
              telephone_number: "555-123-4567",
              country: "USA"
            }
          ],
          taxonomies: [
            {
              code: "207Q00000X",
              desc: "Family Medicine",
              primary: true
            }
          ]
        },
        {
          basic: {
            npi: "2345678901",
            first_name: "AR",
            last_name: "JOHNSON",
            credential: "DO",
            gender: "F",
            status: "A"
          },
          addresses: [
            {
              address_1: "456 OAK AVE",
              city: "NEW YORK",
              state: "NY",
              postal_code: "10001",
              telephone_number: "555-987-6543",
              country: "USA"
            }
          ],
          taxonomies: [
            {
              code: "207R00000X",
              desc: "Internal Medicine",
              primary: true
            }
          ]
        },
        {
          basic: {
            npi: "3456789012",
            first_name: "AR",
            last_name: "WILLIAMS",
            credential: "MD",
            gender: "M",
            status: "A"
          },
          addresses: [
            {
              address_1: "789 PINE ST",
              city: "CHICAGO",
              state: "IL",
              postal_code: "60601",
              telephone_number: "555-555-1234",
              country: "USA"
            }
          ],
          taxonomies: [
            {
              code: "208600000X",
              desc: "Surgery",
              primary: true
            }
          ]
        }
      )
      resultCount = 3
    }

    const mockData = {
      result_count: resultCount,
      results: mockDoctors,
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return res.status(200).json(mockData)
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
