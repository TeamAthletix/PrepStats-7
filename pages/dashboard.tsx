import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentStats, setRecentStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Case-insensitive role check
    if (session.user.role?.toLowerCase() === 'athlete') {
      fetchRecentStats()
    } else {
      setLoading(false)
    }
  }, [session, status, router])

  const fetchRecentStats = async () => {
    try {
      const response = await fetch('/api/stats/recent')
      if (response.ok) {
        const data = await response.json()
        setRecentStats(data.stats || [])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const isAthlete = session.user.role?.toLowerCase() === 'athlete'

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '28px' }}>
                Welcome back, {session.user.firstName}!
              </h1>
              <p style={{ color: '#666', margin: 0, fontSize: '16px' }}>
                Role: {session.user.role?.charAt(0).toUpperCase() + session.user.role?.slice(1).toLowerCase()}
                {session.user.schoolName && ` • ${session.user.schoolName}`}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {isAthlete && (
            <Link href="/submit-stats" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                border: '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.borderColor = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'transparent'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ color: 'white', fontSize: '24px' }}>📊</span>
                </div>
                <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '20px' }}>
                  Submit Game Stats
                </h3>
                <p style={{ color: '#666', margin: 0, lineHeight: '1.5' }}>
                  Record your latest game performance and build your recruiting profile
                </p>
              </div>
            </Link>
          )}

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ color: 'white', fontSize: '24px' }}>👤</span>
            </div>
            <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '20px' }}>
              My Profile
            </h3>
            <p style={{ color: '#666', margin: 0, lineHeight: '1.5' }}>
              View and edit your profile information and settings
            </p>
            <p style={{ color: '#999', margin: '10px 0 0 0', fontSize: '14px' }}>
              Coming soon...
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ color: 'white', fontSize: '24px' }}>🏆</span>
            </div>
            <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '20px' }}>
              Leaderboards
            </h3>
            <p style={{ color: '#666', margin: 0, lineHeight: '1.5' }}>
              See how you stack up against other players in your area
            </p>
            <p style={{ color: '#999', margin: '10px 0 0 0', fontSize: '14px' }}>
              Coming soon...
            </p>
          </div>
        </div>

        {isAthlete && (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '24px' }}>
              Recent Game Stats
            </h2>
            
            {recentStats.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e1e5e9' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Opponent</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Result</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Key Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStats.slice(0, 5).map((stat, index) => (
                      <tr key={stat.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', color: '#333' }}>
                          {new Date(stat.gameDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', color: '#333' }}>{stat.opponent}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: stat.result === 'win' ? '#d4edda' : stat.result === 'loss' ? '#f8d7da' : '#e2e3e5',
                            color: stat.result === 'win' ? '#155724' : stat.result === 'loss' ? '#721c24' : '#495057'
                          }}>
                            {stat.result.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                          {stat.passingYards && `${stat.passingYards} pass yds`}
                          {stat.rushingYards && stat.passingYards && ', '}
                          {stat.rushingYards && `${stat.rushingYards} rush yds`}
                          {stat.receivingYards && (stat.passingYards || stat.rushingYards) && ', '}
                          {stat.receivingYards && `${stat.receivingYards} rec yds`}
                          {stat.tackles && (stat.passingYards || stat.rushingYards || stat.receivingYards) && ', '}
                          {stat.tackles && `${stat.tackles} tackles`}
                          {!stat.passingYards && !stat.rushingYards && !stat.receivingYards && !stat.tackles && 'Stats recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>No stats yet</h3>
                <p style={{ marginBottom: '20px' }}>
                  Start tracking your performance by submitting your first game stats
                </p>
                <Link href="/submit-stats" style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  Submit Stats
                </Link>
              </div>
            )}
          </div>
        )}

        {!isAthlete && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
            <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '24px' }}>
              Welcome to PrepStats!
            </h2>
            <p style={{ color: '#666', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
              More features for your role are coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
