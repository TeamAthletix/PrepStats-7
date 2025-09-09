import { useState, useEffect, useRef } from 'react'

interface School {
  id: string
  name: string
  city: string
  state: string
  classification: string
}

interface SchoolSelectProps {
  value: School | null
  onChange: (school: School | null) => void
  placeholder?: string
  state?: 'AL' | 'GA' | 'ALL'
  required?: boolean
}

export default function SchoolSelect({
  value,
  onChange,
  placeholder = "Start typing your school name...",
  state = 'ALL',
  required = false
}: SchoolSelectProps) {
  const [query, setQuery] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form data for school request
  const [requestForm, setRequestForm] = useState({
    schoolName: '',
    city: '',
    state: state === 'ALL' ? 'AL' : state,
    classification: ''
  })

  useEffect(() => {
    if (value) {
      setQuery(`${value.name} - ${value.city}, ${value.state}`)
    } else {
      setQuery('')
    }
  }, [value])

  // Search schools when query changes
  useEffect(() => {
    const searchSchools = async () => {
      if (query.length < 2) {
        setSchools([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query,
          state: state,
          limit: '8'
        })

        const response = await fetch(`/api/schools/search?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setSchools(data.schools)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('School search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchSchools, 300)
    return () => clearTimeout(timeoutId)
  }, [query, state])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    
    // Clear selection if input doesn't match
    if (value && !newQuery.includes(value.name)) {
      onChange(null)
    }
  }

  const handleSchoolSelect = (school: School) => {
    onChange(school)
    setQuery(`${school.name} - ${school.city}, ${school.state}`)
    setIsOpen(false)
  }

  const handleRequestSchool = () => {
    setRequestForm(prev => ({
      ...prev,
      schoolName: query || ''
    }))
    setShowRequestModal(true)
  }

  const submitSchoolRequest = async () => {
    if (!requestForm.schoolName || !requestForm.city || !requestForm.state) {
      alert('Please fill in all required fields')
      return
    }

    setRequestLoading(true)
    try {
      const response = await fetch('/api/schools/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestForm)
      })

      const data = await response.json()

      if (response.ok) {
        alert('School request submitted successfully! We\'ll review it and add the school to our database.')
        setShowRequestModal(false)
        setRequestForm({
          schoolName: '',
          city: '',
          state: state === 'ALL' ? 'AL' : state,
          classification: ''
        })
      } else {
        alert(data.message || 'Error submitting school request')
      }
    } catch (error) {
      console.error('Request submission error:', error)
      alert('Error submitting school request')
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && schools.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {schools.map((school) => (
            <button
              key={school.id}
              type="button"
              onClick={() => handleSchoolSelect(school)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="font-medium text-gray-900">{school.name}</div>
              <div className="text-sm text-gray-600">
                {school.city}, {school.state} • {school.classification}
              </div>
            </button>
          ))}
          
          {/* Request new school option */}
          <button
            type="button"
            onClick={handleRequestSchool}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t-2 border-gray-200 focus:outline-none focus:bg-blue-50"
          >
            <div className="font-medium text-blue-600">
              Can't find your school?
            </div>
            <div className="text-sm text-gray-600">
              Request to add "{query}" to our database
            </div>
          </button>
        </div>
      )}

      {/* No results message */}
      {isOpen && !loading && schools.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-600">
            No schools found for "{query}"
          </div>
          <button
            type="button"
            onClick={handleRequestSchool}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-200 focus:outline-none focus:bg-blue-50"
          >
            <div className="font-medium text-blue-600">
              Request to add this school
            </div>
            <div className="text-sm text-gray-600">
              We'll review and add it to our database
            </div>
          </button>
        </div>
      )}

      {/* School Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request New School</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  value={requestForm.schoolName}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={requestForm.city}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={requestForm.state}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, state: e.target.value as "AL" | "GA" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="AL">Alabama</option>
                  <option value="GA">Georgia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification (if known)
                </label>
                <select
                  value={requestForm.classification}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, classification: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select classification</option>
                  <option value="1A">1A</option>
                  <option value="2A">2A</option>
                  <option value="3A">3A</option>
                  <option value="4A">4A</option>
                  <option value="5A">5A</option>
                  <option value="6A">6A</option>
                  <option value="7A">7A</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSchoolRequest}
                disabled={requestLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {requestLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
