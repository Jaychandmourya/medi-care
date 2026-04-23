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
        <Label htmlFor='Country' className="mb-1.5">Country</Label>
        <select
          id="Country"
          value={selectedCountry}
          onChange={handleCountryChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 appearance-none bg-position-[right_12px_center] bg-size-[16px_16px] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]"
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
        <Label htmlFor='State' className="mb-1.5">State</Label>
        <select
          id="State"
          value={selectedState}
          onChange={handleStateChange}
          disabled={!selectedCountry}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-position-[right_12px_center] bg-size-[16px_16px] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]"
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
        <Label htmlFor='City' className="mb-1.5">City</Label>
        <select
          id="City"
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-position-[right_12px_center] bg-size-[16px_16px] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]"
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
