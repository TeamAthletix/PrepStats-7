import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PositionSelect from '../../components/PositionSelect'
import SchoolSelect from '../../components/SchoolSelect'

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Athlete',
    firstName: '',
    lastName: '',
    gradYear: '',
    position: [],
    school: '',
    organization: '',
    businessName: '',
    mediaOutlet: '',
    schoolEmail: '',
    mediaCredentials: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSchool, setSelectedSchool] = useState(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePositionChange = (value: string[]) => {
    setFormData({
      ...formData,
      position: value
    })
  }

  const isSchoolEmail = (email: string) => {
    const schoolDomains = ['.edu', '.k12.', '.schools.', '.school.']
    return schoolDomains.some(domain => email.toLowerCase().includes(domain))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.role === 'Coach' && formData.schoolEmail && !isSchoolEmail(formData.schoolEmail)) {
      setError('Coach verification email must be from a school domain (.edu, .k12, .schools, etc.)')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profileData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            gradYear: formData.gradYear,
            position: Array.isArray(formData.position) ? formData.position.join(",") : formData.position,
            school: selectedSchool?.name || formData.school,
            schoolId: selectedSchool?.id,
            organization: formData.organization,
            businessName: formData.businessName,
            mediaOutlet: formData.mediaOutlet,
            schoolEmail: formData.schoolEmail,
            mediaCredentials: formData.mediaCredentials,
            verificationStatus: (formData.role === 'Coach' || formData.role === 'Media') ? 'pending' : 'verified'
          }
        }),
      })

      if (res.ok) {
        if (formData.role === 'Coach' || formData.role === 'Media') {
          alert(`Account created successfully! Your ${formData.role.toLowerCase()} status is pending verification.`)
        }

        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
        } else {
          setError('Registration successful but auto-login failed. Please sign in manually.')
        }
      } else {
        const data = await res.json()
        setError(data.message || 'Something went wrong')
      }
    } catch (error) {
      setError('Network error')
    }
    
    setLoading(false)
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'Athlete':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Graduation Year:</label>
              <input
                type="number"
                name="gradYear"
                value={formData.gradYear}
                onChange={handleChange}
                min="2024"
                max="2030"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Position(s):</label>
              <PositionSelect
                value={formData.position}
                onChange={handlePositionChange}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>School:</label>
              <SchoolSelect
                value={selectedSchool}
                onChange={setSelectedSchool}
                placeholder="Start typing your school name..."
                state="ALL"
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Organization: <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>(optional)</span>
              </label>
              <input
                type="text"
                name="athleteOrganization"
                value={formData.athleteOrganization}
                onChange={handleChange}
                placeholder="e.g., Travel team, club, training facility, recruiting service"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Optional: Link to travel teams, clubs, or organizations that help manage your athletic profile
              </p>
            </div>
          </>
        )
      
      case 'Coach':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>School/Team:</label>
              <SchoolSelect
                value={selectedSchool}
                onChange={setSelectedSchool}
                placeholder="Start typing your school name..."
                state="ALL"
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                School-Issued Email: <span style={{ color: '#c62828' }}>*</span>
              </label>
              <input
                type="email"
                name="schoolEmail"
                value={formData.schoolEmail}
                onChange={handleChange}
                placeholder="coach@schoolname.edu or coach@district.k12.al.us"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Must be from school domain (.edu, .k12, .schools, etc.) for verification. This will also be used for platform notifications.
              </p>
            </div>
          </>
        )
      
      case 'Media':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Media Outlet: <span style={{ color: '#c62828' }}>*</span>
              </label>
              <input
                type="text"
                name="mediaOutlet"
                value={formData.mediaOutlet}
                onChange={handleChange}
                placeholder="Enter your media outlet/publication"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Media Credentials: <span style={{ color: '#c62828' }}>*</span>
              </label>
              <textarea
                name="mediaCredentials"
                value={formData.mediaCredentials}
                onChange={handleChange}
                placeholder="Provide verification details: press pass number, publication website, editor contact, social media accounts, portfolio links, etc."
                required
                rows={4}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', resize: 'vertical' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Media status requires admin approval. Include verifiable credentials for faster review.
              </p>
            </div>
          </>
        )
      
      case 'Organization':
        return (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Organization Name:</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter your organization name"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
          </div>
        )
      
      case 'Business':
        return (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Business Name:</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter your business name"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontFamily: 'Squada One, sans-serif', fontSize: '32px' }}>Create Account</h1>
        
        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>I am a:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            >
              <option value="Athlete">Athlete</option>
              <option value="Coach">Coach</option>
              <option value="Parent">Parent</option>
              <option value="Media">Media</option>
              <option value="Organization">Organization</option>
              <option value="Business">Business</option>
              <option value="Fan">Fan</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
          </div>

          {renderRoleSpecificFields()}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#b3a369',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link href="/auth/signin" style={{ color: '#b3a369', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </Layout>
  )
}