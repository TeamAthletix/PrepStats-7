import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin') // Not logged in
  }, [session, status, router])

  if (status === 'loading') {
    return <Layout><div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div></Layout>
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px', fontFamily: 'Squada One, sans-serif' }}>
          Welcome, {session.user?.profiles?.[0]?.firstName || 'User'}!
        </h1>
        
        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '10px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '15px', fontFamily: 'Oswald, sans-serif' }}>Account Details</h2>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Role:</strong> {session.user?.role}</p>
          <p><strong>Tokens:</strong> {session.user?.tokens || 0}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Oswald, sans-serif' }}>Submit Stats</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>Add your game statistics for verification</p>
            <button style={{ backgroundColor: '#b3a369', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Add Stats
            </button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Oswald, sans-serif' }}>View Leaderboards</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>See where you rank among peers</p>
            <button style={{ backgroundColor: '#b3a369', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              View Rankings
            </button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Oswald, sans-serif' }}>Create Spotlight</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>Promote your achievements</p>
            <button style={{ backgroundColor: '#b3a369', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Create Spotlight
            </button>
          </div>

        </div>
      </div>
    </Layout>
  )
}
