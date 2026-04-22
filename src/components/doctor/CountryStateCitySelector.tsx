import { useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import { Label } from '@/components/common/Label'

interface CountryStateCitySelectorProps {
  selectedCountry: string
  selectedState: string
  selectedCity: string
  onCountryChange: (countryCode: string, countryName: string) => void
  onStateChange: (stateCode: string, stateName: string) => void
  onCityChange: (cityName: string) => void
}

const CountryStateCitySelector = ({
  selectedCountry,
  selectedState,
  selectedCity,
  onCountryChange,
  onStateChange,
  onCityChange
}: CountryStateCitySelectorProps) => {
  const countries = useMemo(() => Country.getAllCountries(), [])

  const states = useMemo(() => {
    if (!selectedCountry) return []
    return State.getStatesOfCountry(selectedCountry)
  }, [selectedCountry])

  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return []
    return City.getCitiesOfState(selectedCountry, selectedState)
  }, [selectedCountry, selectedState])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    const country = countries.find(c => c.isoCode === countryCode)
    onCountryChange(countryCode, country?.name || '')
    onStateChange('', '')
    onCityChange('')
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value
    const state = states.find(s => s.isoCode === stateCode)
    onStateChange(stateCode, state?.name || '')
    onCityChange('')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Country Dropdown */}
      <div className="space-y-2">
        <Label className="mb-1.5">Country</Label>
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown */}
      <div className="space-y-2">
        <Label className="mb-1.5">State</Label>
        <select
          value={selectedState}
          onChange={handleStateChange}
          disabled={!selectedCountry}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{selectedCountry ? 'Select State' : 'Select Country First'}</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.isoCode} - {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div className="space-y-2">
        <Label className="mb-1.5">City</Label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{selectedState ? 'Select City' : 'Select State First'}</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CountryStateCitySelector
