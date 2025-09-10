import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

interface PendingUser {
  id: string
  email: string
  role: string
  name: string
  createdAt: string
  verificationStatus: string
  schoolInfo?: {
    name: string
    city: string
    state: string
    classification: string
  }
  schoolEmail?: string
  communicationEmail?: string
  verificationSubmittedAt?: string
  isValidSchoolDomain?: boolean
  mediaOutlet?: string
  mediaCredentials?: string
  profileInfo?: {
    firstName: string
    lastName: string
    gradYear?: number
    position?: string
    additionalInfo?: string
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/')
      return
    }

    if (session?.user && (session.user as any).role === 'ADMIN') {
      fetchPendingUsers()
    }
  }, [session, status, router])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users')
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.users || [])
      } else {
        setError('Failed to fetch pending users')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string, verified: boolean, rejectReason?: string) => {
    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verified,
          rejectReason
        })
      })

      if (response.ok) {
        // Remove the user from pending list
        setPendingUsers(prev => prev.filter(user => user.id !== userId))
        alert(`User ${verified ? 'approved' : 'rejected'} successfully!`)
      } else {
        const data = await response.json()
        alert(data.message || 'Error processing request')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setProcessingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px' }}>Loading admin dashboard...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ color: '#c62828', fontSize: '18px' }}>{error}</div>
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
            Admin Dashboard
          </h1>
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '8px 16px', 
            borderRadius: '20px',
            border: '1px solid #c8e6c9'
          }}>
            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {pendingUsers.length} Pending Verifications
            </span>
          </div>
        </div>

        {pendingUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>All Caught Up!</h2>
            <p style={{ color: '#6c757d', margin: 0 }}>No pending verifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{
                        backgroundColor: user.role === 'COACH' ? '#2196F3' : '#FF9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '12px'
                      }}>
                        {user.role}
                      </div>
                      <h3 style={{ margin: 0, color: '#2c3e50' }}>{user.name}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>Contact Info</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Email:</strong> {user.email}</p>
                        {user.communicationEmail && (
                          <p style={{ margin: '0 0 4px 0' }}><strong>Alt Email:</strong> {user.communicationEmail}</p>
                        )}
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>Applied:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {user.role === 'COACH' && (
                        <div>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>School Verification</p>
                          {user.schoolInfo && (
                            <p style={{ margin: '0 0 4px 0' }}>
                              <strong>School:</strong> {user.schoolInfo.name}, {user.schoolInfo.city}
                            </p>
                          )}
                          <p style={{ margin: '0 0 4px 0' }}>
                            <strong>School Email:</strong> {user.schoolEmail}
                            {user.isValidSchoolDomain && (
                              <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Valid Domain</span>
                            )}
                          </p>
                        </div>
                      )}

                      {user.role === 'MEDIA' && (
                        <div>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>Media Verification</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Outlet:</strong> {user.mediaOutlet}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Credentials:</strong></p>
                          <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '8px', 
                            borderRadius: '4px',
                            fontSize: '14px',
                            maxHeight: '60px',
                            overflow: 'hidden'
                          }}>
                            {user.mediaCredentials}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                    <button
                      onClick={() => handleVerifyUser(user.id, true)}
                      disabled={processingId === user.id}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: processingId === user.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: processingId === user.id ? 0.7 : 1
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):')
                        if (reason !== null) {
                          handleVerifyUser(user.id, false, reason || undefined)
                        }
                      }}
                      disabled={processingId === user.id}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: processingId === user.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: processingId === user.id ? 0.7 : 1
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}