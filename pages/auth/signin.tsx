import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profileData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            gradYear: formData.gradYear ? parseInt(formData.gradYear) : null,
            position: formData.position,
            school: formData.school,
            teamId: formData.teamId || null
          }
        })
      })

      if (response.ok) {
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-form">
          <img src="/logo.png" alt="PrepStats Logo" className="logo" />
          <h1>Join PrepStats</h1>
          <p className="slogan">Rise Up and Score Big!</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="ATHLETE">Athlete</option>
              <option value="COACH">Coach</option>
              <option value="MEDIA">Media</option>
              <option value="PARENT">Parent</option>
              <option value="FAN">Fan</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
            
            {formData.role === 'ATHLETE' && (
              <>
                <input
                  type="number"
                  name="gradYear"
                  placeholder="Graduation Year"
                  value={formData.gradYear}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </>
            )}
            
            <input
              type="text"
              name="school"
              placeholder="School"
              value={formData.school}
              onChange={handleChange}
            />
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="auth-link">
            Already have an account? <Link href="/auth/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
