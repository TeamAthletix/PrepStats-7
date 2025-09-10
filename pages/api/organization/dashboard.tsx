import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

interface BulkImportResult {
  created: any[]
  errors: any[]
  duplicates: any[]
}

export default function OrganizationDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [athletes, setAthletes] = useState([
    { firstName: '', lastName: '', email: '', gradYear: '', position: '', schoolId: '', schoolName: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user && (session.user as any).role !== 'ORGANIZATION') {
      router.push('/')
      return
    }
  }, [session, status, router])

  const addAthleteRow = () => {
    setAthletes([...athletes, { 
      firstName: '', 
      lastName: '', 
      email: '', 
      gradYear: '', 
      position: '', 
      schoolId: '', 
      schoolName: '' 
    }])
  }

  const removeAthleteRow = (index: number) => {
    setAthletes(athletes.filter((_, i) => i !== index))
  }

  const updateAthlete = (index: number, field: string, value: string) => {
    const updated = [...athletes]
    updated[index] = { ...updated[index], [field]: value }
    setAthletes(updated)
  }

  const handleBulkImport = async () => {
    setLoading(true)
    setError('')
    setResults(null)

    // Validate data
    const validAthletes = athletes.filter(athlete => 
      athlete.firstName && 
      athlete.lastName && 
      athlete.email && 
      athlete.gradYear && 
      athlete.schoolId
    )

    if (validAthletes.length === 0) {
      setError('Please fill in at least one complete athlete profile')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/organization/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athletes: validAthletes
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        
        // Clear successful entries
        const failedAthletes = athletes.filter((athlete, index) => {
          const hasError = data.results.errors.some((error: any) => 
            error.athlete === `${athlete.firstName} ${athlete.lastName}`
          )
          const isDuplicate = data.results.duplicates.some((dup: any) => 
            dup.athlete === `${athlete.firstName} ${athlete.lastName}`
          )
          return hasError || isDuplicate
        })
        
        setAthletes(failedAthletes.length > 0 ? failedAthletes : [
          { firstName: '', lastName: '', email: '', gradYear: '', position: '', schoolId: '', schoolName: '' }
        ])
      } else {
        const data = await response.json()
        setError(data.message || 'Import failed')
      }
    } catch (error) {
      setError('Network error during import')
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    setAthletes([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        gradYear: '2026',
        position: 'QB',
        schoolId: 'cmfcvqqyv0002m54rp9yte99s', // You'll need actual school IDs
        schoolName: 'Abbeville High School'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        gradYear: '2025',
        position: 'RB',
        schoolId: 'cmfcvqqyr0001m54rwhl1ewqf',
        schoolName: 'A.P. Brewer High School'
      }
    ])
  }

  if (status === 'loading') {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px' }}>Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e9ecef'
        }}>
          <h1 style={{ 
            fontFamily: 'Squada One, sans-serif', 
            fontSize: '36px', 
            color: '#2c3e50',
            margin: 0
          }}>
            Organization Dashboard
          </h1>
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '8px 16px', 
            borderRadius: '20px',
            border: '1px solid #bbdefb'
          }}>
            <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
              Bulk Athlete Import
            </span>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #ffcc02'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#e65100' }}>How Bulk Import Works:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#bf360c' }}>
            <li>Add athlete profiles from multiple schools (unlike coaches who only manage one school)</li>
            <li>Creates placeholder accounts that athletes can later claim and activate</li>
            <li>You can manage profiles but cannot verify stats (only coaches can verify stats)</li>
            <li>Athletes receive welcome tokens and can complete their own profiles</li>
          </ul>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        {results && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>Import Results:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <strong style={{ color: '#4caf50' }}>Created ({results.created.length}):</strong>
                {results.created.map((athlete, i) => (
                  <div key={i} style={{ fontSize: '14px', color: '#388e3c' }}>
                    {athlete.athlete} - {athlete.school}
                  </div>
                ))}
              </div>
              <div>
                <strong style={{ color: '#ff9800' }}>Duplicates ({results.duplicates.length}):</strong>
                {results.duplicates.map((athlete, i) => (
                  <div key={i} style={{ fontSize: '14px', color: '#f57c00' }}>
                    {athlete.athlete} - {athlete.email}
                  </div>
                ))}
              </div>
              <div>
                <strong style={{ color: '#f44336' }}>Errors ({results.errors.length}):</strong>
                {results.errors.map((athlete, i) => (
                  <div key={i} style={{ fontSize: '14px', color: '#d32f2f' }}>
                    {athlete.athlete} - {athlete.error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Add Athletes</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={loadSampleData}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Load Sample Data
              </button>
              <button
                onClick={addAthleteRow}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add Row
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>First Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Last Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email *</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Grad Year *</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Position</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>School Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>School ID *</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={athlete.firstName}
                        onChange={(e) => updateAthlete(index, 'firstName', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={athlete.lastName}
                        onChange={(e) => updateAthlete(index, 'lastName', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="email"
                        value={athlete.email}
                        onChange={(e) => updateAthlete(index, 'email', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        value={athlete.gradYear}
                        onChange={(e) => updateAthlete(index, 'gradYear', e.target.value)}
                        min="2024"
                        max="2030"
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={athlete.position}
                        onChange={(e) => updateAthlete(index, 'position', e.target.value)}
                        placeholder="QB, RB, etc."
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={athlete.schoolName}
                        onChange={(e) => updateAthlete(index, 'schoolName', e.target.value)}
                        placeholder="High School Name"
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={athlete.schoolId}
                        onChange={(e) => updateAthlete(index, 'schoolId', e.target.value)}
                        placeholder="School ID from database"
                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {athletes.length > 1 && (
                        <button
                          onClick={() => removeAthleteRow(index)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={handleBulkImport}
              disabled={loading}
              style={{
                padding: '12px 32px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Importing Athletes...' : 'Import Athletes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}