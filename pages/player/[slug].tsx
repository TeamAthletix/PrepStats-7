// pages/player/[slug].tsx
import { GetServerSideProps } from 'next'
import { PrismaClient } from '@prisma/client'
import Head from 'next/head'

const prisma = new PrismaClient()

interface PlayerProfileProps {
  profile: any | null
  error?: string
}

export default function PlayerProfile({ profile, error }: PlayerProfileProps) {
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h1>
          <p className="text-gray-600">{error || 'The player you are looking for could not be found.'}</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Home
          </a>
        </div>
      </div>
    )
  }

  // Handle position display (could be string or array)
  const positions = typeof profile.position === 'string' 
    ? profile.position.split(',').map((p: string) => p.trim())
    : Array.isArray(profile.position) 
    ? profile.position 
    : ['No Position']

  return (
    <>
      <Head>
        <title>{profile.firstName} {profile.lastName} - PrepStats</title>
        <meta name="description" content={`${profile.firstName} ${profile.lastName}, ${positions.join('/')}, ${profile.school || 'High School Football'} - PrepStats Player Profile`} />
        <meta property="og:title" content={`${profile.firstName} ${profile.lastName} - PrepStats`} />
        <meta property="og:description" content={`${profile.firstName} ${profile.lastName}, ${positions.join('/')}, ${profile.school || 'High School Football'} - View complete player profile and stats`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${profile.firstName} ${profile.lastName} - PrepStats`} />
        <meta name="twitter:description" content={`${positions.join('/')} - ${profile.school || 'High School Football'}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">PrepStats</h1>
              </div>
              <nav className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
                <a href="/auth/signin" className="text-gray-700 hover:text-blue-600">Sign In</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Player Profile */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Player Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-blue-100">
                      <span className="flex items-center">
                        <span className="font-semibold">Position:</span>
                        <span className="ml-2">{positions.join(' / ')}</span>
                      </span>
                      <span className="flex items-center">
                        <span className="font-semibold">School:</span>
                        <span className="ml-2">{profile.school || 'No School'}</span>
                      </span>
                      {profile.gradYear && (
                        <span className="flex items-center">
                          <span className="font-semibold">Class:</span>
                          <span className="ml-2">{profile.gradYear}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Player Information</h2>
                  
                  {/* Bio Section */}
                  {profile.bio && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About {profile.firstName}</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Basic Stats */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-4">Profile Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position(s):</span>
                        <span className="font-medium">{positions.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">School:</span>
                        <span className="font-medium">{profile.school || 'Not specified'}</span>
                      </div>
                      {profile.gradYear && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Graduation Year:</span>
                          <span className="font-medium">{profile.gradYear}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Status:</span>
                        <span className="font-medium text-green-600">
                          {profile.public ? '✓ Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section - Placeholder for future */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Season Stats</h3>
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600">
                        Stats will be displayed here once submitted and verified by coaches.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact/Actions Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Connect with {profile.firstName}</h3>
                    
                    <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">
                      Contact Player
                    </button>
                    
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-3">
                      Share Profile
                    </button>

                    <button className="w-full border border-blue-300 text-blue-700 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                      Add to Watchlist
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 p-6 rounded-lg mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Views:</span>
                        <span className="font-medium">Coming Soon</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(profile.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Type:</span>
                        <span className="font-medium text-blue-600">Athlete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!

  try {
    // Find profile by recreating slug from firstName-lastName
    const profiles = await prisma.profile.findMany({
      where: {
        type: 'ATHLETE', // Handle both 'ATHLETE' and 'Athlete'
        public: true
      },
      include: {
        user: {
          select: {
            verified: true
          }
        }
      }
    })

    // Find matching profile by slug
    const profile = profiles.find(p => {
      const profileSlug = `${p.firstName}-${p.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      return profileSlug === slug
    })

    if (!profile) {
      return {
        notFound: true
      }
    }

    // Serialize the data to avoid Next.js serialization issues
    const serializedProfile = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    }

    return {
      props: {
        profile: serializedProfile
      }
    }
  } catch (error) {
    console.error('Error fetching player profile:', error)
    return {
      props: {
        profile: null,
        error: 'Failed to load player profile'
      }
    }
  }
}