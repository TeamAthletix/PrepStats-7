import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Role-based routing
    const userRole = (session.user as any)?.role?.toUpperCase()
    
    if (userRole === 'ATHLETE') {
      router.push('/athlete/dashboard')
    } else if (userRole === 'COACH') {
      router.push('/coach/dashboard')
    } else if (userRole === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (userRole === 'PARENT') {
      router.push('/parent/dashboard')
    } else if (userRole === 'MEDIA') {
      router.push('/media/dashboard')
    } else if (userRole === 'BUSINESS') {
      router.push('/business/dashboard')
    } else if (userRole === 'FAN') {
      router.push('/fan/dashboard')
    } else {
      // Default fallback for unknown roles
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to your dashboard...</div>
    </div>
  )
}