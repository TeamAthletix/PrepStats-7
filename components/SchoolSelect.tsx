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
          query: query,
          state: state === 'ALL' ? 'AL' : state,
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
        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && schools.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          zIndex: 50, 
          width: '100%', 
          marginTop: '4px', 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
          maxHeight: '256px', 
          overflowY: 'auto' 
        }}>
          {schools.map((school) => (
            <button
              key={school.id}
              type="button"
              onClick={() => handleSchoolSelect(school)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontWeight: '500', color: '#333' }}>{school.name}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {school.city}, {school.state} • {school.classification}
              </div>
            </button>
          ))}
          
          {/* Request new school option */}
          <button
            type="button"
            onClick={handleRequestSchool}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              textAlign: 'left', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderTop: '2px solid #e0e0e0',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ fontWeight: '500', color: '#2563eb' }}>
              Can't find your school?
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Request to add "{query}" to our database
            </div>
          </button>
        </div>
      )}

      {/* No results message */}
      {isOpen && !loading && schools.length === 0 && query.length >= 2 && (
        <div style={{ 
          position: 'absolute', 
          zIndex: 50, 
          width: '100%', 
          marginTop: '4px', 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <div style={{ padding: '12px 16px', color: '#666' }}>
            No schools found for "{query}"
          </div>
          <button
            type="button"
            onClick={handleRequestSchool}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              textAlign: 'left', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderTop: '1px solid #e0e0e0',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ fontWeight: '500', color: '#2563eb' }}>
              Request to add this school
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              We'll review and add it to our database
            </div>
          </button>
        </div>
      )}

      {/* School Request Modal */}
      {showRequestModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '400px', 
            margin: '16px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Request New School</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  School Name *
                </label>
                <input
                  type="text"
                  value={requestForm.schoolName}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={requestForm.city}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, city: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  State *
                </label>
                <select
                  value={requestForm.state}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, state: e.target.value as "AL" | "GA" }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  required
                >
                  <option value="AL">Alabama</option>
                  <option value="GA">Georgia</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Classification (if known)
                </label>
                <select
                  value={requestForm.classification}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, classification: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
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

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                disabled={requestLoading}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  backgroundColor: 'white', 
                  color: '#374151', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSchoolRequest}
                disabled={requestLoading}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  opacity: requestLoading ? 0.5 : 1
                }}
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