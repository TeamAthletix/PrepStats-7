import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SubmitStats() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [gameData, setGameData] = useState({
    opponent: '',
    gameDate: '',
    gameType: 'regular',
    homeAway: 'home',
    result: 'win',
    playerScore: '',
    opponentScore: ''
  })
  
  const [stats, setStats] = useState({
    // Passing
    completions: '',
    attempts: '',
    passingYards: '',
    passingTds: '',
    interceptions: '',
    // Rushing
    carries: '',
    rushingYards: '',
    rushingTds: '',
    fumbles: '',
    // Receiving
    receptions: '',
    receivingYards: '',
    receivingTds: '',
    drops: '',
    // Defense
    tackles: '',
    assists: '',
    sacks: '',
    defenseInts: '',
    passBreakups: '',
    forcedFumbles: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/submit-stats')
      return
    }
    if (session.user.role !== 'athlete') {
      router.push('/dashboard?error=Only athletes can submit stats')
      return
    }
  }, [session, status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!gameData.opponent || !gameData.gameDate) {
      setError('Please fill in opponent and game date')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/stats/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameData,
          stats: Object.fromEntries(
            Object.entries(stats).filter(([_, value]) => value && value.trim() !== '')
          )
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        setGameData({
          opponent: '',
          gameDate: '',
          gameType: 'regular',
          homeAway: 'home',
          result: 'win',
          playerScore: '',
          opponentScore: ''
        })
        setStats({
          completions: '', attempts: '', passingYards: '', passingTds: '', interceptions: '',
          carries: '', rushingYards: '', rushingTds: '', fumbles: '',
          receptions: '', receivingYards: '', receivingTds: '', drops: '',
          tackles: '', assists: '', sacks: '', defenseInts: '', passBreakups: '', forcedFumbles: ''
        })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(data.message || 'Failed to submit stats')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
  }

  if (!session || session.user.role !== 'athlete') {
    return null
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '28px' }}>
            Submit Game Stats
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Track your performance and build your recruiting profile
          </p>
          <Link href="/dashboard" style={{
            display: 'inline-block',
            marginTop: '15px',
            color: '#667eea',
            textDecoration: 'none'
          }}>
            ← Back to Dashboard
          </Link>
        </div>

        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            ✅ Stats submitted successfully!
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Game Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Opponent *
                </label>
                <input
                  type="text"
                  value={gameData.opponent}
                  onChange={(e) => setGameData({...gameData, opponent: e.target.value})}
                  placeholder="Auburn High School"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Game Date *
                </label>
                <input
                  type="date"
                  value={gameData.gameDate}
                  onChange={(e) => setGameData({...gameData, gameDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Game Type
                </label>
                <select
                  value={gameData.gameType}
                  onChange={(e) => setGameData({...gameData, gameType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="regular">Regular Season</option>
                  <option value="playoff">Playoff</option>
                  <option value="championship">Championship</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Result
                </label>
                <select
                  value={gameData.result}
                  onChange={(e) => setGameData({...gameData, result: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="tie">Tie</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Stats</h2>
            
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Passing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Completions</label>
                <input
                  type="number"
                  value={stats.completions}
                  onChange={(e) => setStats({...stats, completions: e.target.value})}
                  placeholder="25"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Attempts</label>
                <input
                  type="number"
                  value={stats.attempts}
                  onChange={(e) => setStats({...stats, attempts: e.target.value})}
                  placeholder="40"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Passing Yards</label>
                <input
                  type="number"
                  value={stats.passingYards}
                  onChange={(e) => setStats({...stats, passingYards: e.target.value})}
                  placeholder="315"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Passing TDs</label>
                <input
                  type="number"
                  value={stats.passingTds}
                  onChange={(e) => setStats({...stats, passingTds: e.target.value})}
                  placeholder="3"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
            </div>

            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Rushing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Carries</label>
                <input
                  type="number"
                  value={stats.carries}
                  onChange={(e) => setStats({...stats, carries: e.target.value})}
                  placeholder="18"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Rushing Yards</label>
                <input
                  type="number"
                  value={stats.rushingYards}
                  onChange={(e) => setStats({...stats, rushingYards: e.target.value})}
                  placeholder="125"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Rushing TDs</label>
                <input
                  type="number"
                  value={stats.rushingTds}
                  onChange={(e) => setStats({...stats, rushingTds: e.target.value})}
                  placeholder="2"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
            </div>

            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Receiving</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Receptions</label>
                <input
                  type="number"
                  value={stats.receptions}
                  onChange={(e) => setStats({...stats, receptions: e.target.value})}
                  placeholder="8"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Receiving Yards</label>
                <input
                  type="number"
                  value={stats.receivingYards}
                  onChange={(e) => setStats({...stats, receivingYards: e.target.value})}
                  placeholder="145"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Receiving TDs</label>
                <input
                  type="number"
                  value={stats.receivingTds}
                  onChange={(e) => setStats({...stats, receivingTds: e.target.value})}
                  placeholder="2"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
            </div>

            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Defense</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tackles</label>
                <input
                  type="number"
                  value={stats.tackles}
                  onChange={(e) => setStats({...stats, tackles: e.target.value})}
                  placeholder="12"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Assists</label>
                <input
                  type="number"
                  value={stats.assists}
                  onChange={(e) => setStats({...stats, assists: e.target.value})}
                  placeholder="5"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Sacks</label>
                <input
                  type="number"
                  step="0.5"
                  value={stats.sacks}
                  onChange={(e) => setStats({...stats, sacks: e.target.value})}
                  placeholder="1.5"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '15px 40px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Stats'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
