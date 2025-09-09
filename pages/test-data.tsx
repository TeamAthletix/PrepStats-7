// pages/test-data.tsx
import { GetServerSideProps } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestDataProps {
  users: any[]
  profiles: any[]
  athleteProfiles: any[]
}

export default function TestData({ users, profiles, athleteProfiles }: TestDataProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PrepStats Database Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Users ({users.length})</h2>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="border-b pb-2">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Role: {user.role}</p>
                  <p className="text-sm text-gray-600">Verified: {user.verified ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Profiles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Profiles ({profiles.length})</h2>
            <div className="space-y-3">
              {profiles.map(profile => (
                <div key={profile.id} className="border-b pb-2">
                  <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-gray-600">Type: {profile.type}</p>
                  <p className="text-sm text-gray-600">School: {profile.school || 'No School'}</p>
                  <p className="text-sm text-gray-600">Position: {profile.position || 'No Position'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Athlete Profiles with Generated URLs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Athlete Profiles ({athleteProfiles.length})</h2>
            <div className="space-y-3">
              {athleteProfiles.map(profile => {
                const slug = `${profile.firstName}-${profile.lastName}`
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '')
                
                return (
                  <div key={profile.id} className="border-b pb-2">
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                    <p className="text-sm text-gray-600">Position: {profile.position || 'No Position'}</p>
                    <p className="text-sm text-gray-600">School: {profile.school || 'No School'}</p>
                    <p className="text-sm text-blue-600">
                      URL: <a href={`/player/${slug}`} className="hover:underline">/player/{slug}</a>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Player Profile Links</h2>
          <div className="space-y-2">
            {athleteProfiles.map(profile => {
              const slug = `${profile.firstName}-${profile.lastName}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
              
              return (
                <div key={profile.id}>
                  <a 
                    href={`/player/${slug}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                  >
                    View {profile.firstName} {profile.lastName}'s Profile →
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* API Test */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Test</h2>
          <p className="text-gray-600 mb-4">Test the player search API:</p>
          <code className="bg-gray-100 p-2 rounded block">
            curl "http://localhost:3000/api/players/search"
          </code>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        verified: true
      }
    })

    // Get all profiles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        school: true,
        position: true,
        public: true
      }
    })

    // Get athlete profiles specifically
    const athleteProfiles = await prisma.profile.findMany({
      where: {
        OR: [
          { type: 'ATHLETE' },
          { type: 'Athlete' }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        school: true,
        position: true,
        public: true
      }
    })

    return {
      props: {
        users: JSON.parse(JSON.stringify(users)),
        profiles: JSON.parse(JSON.stringify(profiles)),
        athleteProfiles: JSON.parse(JSON.stringify(athleteProfiles))
      }
    }
  } catch (error) {
    console.error('Error fetching test data:', error)
    return {
      props: {
        users: [],
        profiles: [],
        athleteProfiles: []
      }
    }
  }
}