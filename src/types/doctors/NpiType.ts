export interface NPIAddress {
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  telephone_number?: string
}

export interface NPITaxonomy {
  code?: string
  desc?: string
  primary?: boolean
}

export interface NPIBasic {
  npi?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  credential?: string
  gender?: string
  enumeration_date?: string
  last_updated?: string
  status?: string
}

export interface NPISearchResponse {
  result_count?: number
  results?: NPIResult[]
  skip?: number
  limit?: number
  Errors?: Array<{
    description?: string
    field?: string
    number?: number
  }>
}

export interface NPIResult {
  basic: {
    npi: string
    first_name: string
    last_name: string
    middle_name?: string
    credential?: string
    gender?: string
    status?: string
    enumeration_date?: string
    last_updated?: string
  }
  addresses?: Array<{
    address_1?: string
    address_2?: string
    city?: string
    state?: string
    postal_code?: string
    telephone_number?: string
  }>
  taxonomies?: Array<{
    code?: string
    desc?: string
    primary?: boolean
  }>
  practiceLocations?: Array<{
    name?: string
    address?: {
      city?: string
      state?: string
    }
  }>
  country?: string
}