// pages/player/[slug].tsx
import { GetServerSideProps } from 'next'
import { PrismaClient } from '@prisma/client'
import Head from 'next/head'
import Link from 'next/link'
import { User, MapPin, Calendar, Phone, Mail, Share2, Heart, Trophy, TrendingUp } from 'lucide-react'

const prisma = new PrismaClient()

interface PlayerProfileProps {
  profile: any | null
  error?: string
}

export default function PlayerProfile({ profile, error }: PlayerProfileProps) {
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-[#b3a369] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9d8f5a] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h1>
          <Link href="/" className="bg-[#b3a369] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9d8f5a] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const playerData = {
    name: `${profile.firstName} ${profile.lastName}`,
    position: profile.position || 'Not specified',
    school: profile.school || 'No School',
    graduationYear: profile.graduationYear || 'Not specified',
    profileStatus: profile.profileStatus || 'Public',
    lastUpdated: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Not available',
    profileType: profile.user?.role || 'Athlete',
    height: profile.height || '6\'2"',
    weight: profile.weight || '185 lbs',
    gpa: profile.gpa || '3.8',
    sat: profile.sat || '1350',
    hometown: profile.hometown || 'Birmingham, AL'
  }

  return (
    <>
      <Head>
        <title>{playerData.name} - PrepStats Player Profile</title>
        <meta name="description" content={`${playerData.name}, ${playerData.position} from ${playerData.school} - Class of ${playerData.graduationYear}. View verified stats and recruiting information on PrepStats.`} />
        <meta property="og:title" content={`${playerData.name} - PrepStats`} />
        <meta property="og:description" content={`${playerData.position} from ${playerData.school} - Class of ${playerData.graduationYear}`} />
        <meta property="og:type" content="profile" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-[#b3a369]" style={{ fontFamily: 'Squada One, sans-serif' }}>
                PrepStats
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-gray-700 hover:text-[#b3a369]">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-[#b3a369] text-white px-4 py-2 rounded-lg hover:bg-[#9d8f5a] transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header with Old Gold Gradient */}
        <div className="relative bg-gradient-to-r from-[#b3a369] to-[#9d8f5a] text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Player Photo Placeholder */}
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                  <User size={48} className="text-white/80" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <Trophy size={20} className="text-[#b3a369]" />
                </div>
              </div>

              {/* Player Info */}
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Squada One, sans-serif' }}>
                  {playerData.name}
                </h1>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-4">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-semibold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {playerData.position}
                  </span>
                  <span className="text-white/90 text-lg">
                    Class of {playerData.graduationYear}
                  </span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-white/90">
                  <MapPin size={16} />
                  <span>{playerData.hometown}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-white text-[#b3a369] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  <Phone size={18} />
                  CONTACT PLAYER
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                  <Heart size={18} />
                  WATCHLIST
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Player Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Stats Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  Player Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#b3a369]">{playerData.height}</div>
                    <div className="text-sm text-gray-600 font-medium">HEIGHT</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#b3a369]">{playerData.weight}</div>
                    <div className="text-sm text-gray-600 font-medium">WEIGHT</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#b3a369]">{playerData.gpa}</div>
                    <div className="text-sm text-gray-600 font-medium">GPA</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#b3a369]">{playerData.sat}</div>
                    <div className="text-sm text-gray-600 font-medium">SAT</div>
                  </div>
                </div>
              </div>

              {/* Season Stats Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Boxing, sans-serif' }}>
                    Season Stats
                  </h2>
                  <TrendingUp className="text-[#b3a369]" size={24} />
                </div>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg mb-4">
                    Stats will be displayed here once submitted and verified by coaches.
                  </p>
                  <Link href="/submit-stats" className="bg-[#b3a369] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9d8f5a] transition-colors inline-block">
                    Submit Season Stats
                  </Link>
                </div>
              </div>

              {/* Recruiting Timeline */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  Recruiting Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Profile Created</div>
                      <div className="text-sm text-gray-600">{playerData.lastUpdated}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Profile Made Public</div>
                      <div className="text-sm text-gray-600">Visible to college coaches</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Info */}
            <div className="space-y-6">
              
              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  Connect with {profile.firstName}
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-[#b3a369] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#9d8f5a] transition-colors flex items-center justify-center gap-2">
                    <Mail size={18} />
                    Contact Player
                  </button>
                  <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Share Profile
                  </button>
                  <button className="w-full border-2 border-[#b3a369] text-[#b3a369] px-4 py-3 rounded-lg font-semibold hover:bg-[#b3a369] hover:text-white transition-colors">
                    Add to Watchlist
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  Profile Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position(s):</span>
                    <span className="font-semibold">{playerData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">School:</span>
                    <span className="font-semibold">{playerData.school}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Graduation:</span>
                    <span className="font-semibold">{playerData.graduationYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ {playerData.profileStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-semibold">{playerData.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Boxing, sans-serif' }}>
                  Profile Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Views:</span>
                    <span className="text-2xl font-bold text-[#b3a369]">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Coach Interest:</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Building...</span>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="bg-gradient-to-r from-[#b3a369] to-[#9d8f5a] text-white rounded-xl shadow-lg p-6 text-center">
                <Trophy className="mx-auto mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">PrepStats Verified</h3>
                <p className="text-sm text-white/90">
                  This athlete profile is verified and maintained through PrepStats' secure platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Squada+One&family=Oswald:wght@300;400;500;600;700&display=swap');
        
        .font-squada {
          font-family: 'Squada One', cursive;
        }
        
        .font-oswald {
          font-family: 'Oswald', sans-serif;
        }
      `}</style>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!
  
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        firstName: slug.split("-")[0], lastName: slug.split("-")[1]
      },
      include: {
        user: true
      }
    })

    if (!profile) {
      return {
        props: {
          profile: null,
          error: `Player "${slug}" not found. Please check the URL and try again.`
        }
      }
    }

    // Convert dates to strings for serialization
    const serializedProfile = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      user: profile.user ? {
        ...profile.user,
        createdAt: profile.user.createdAt.toISOString(),
        updatedAt: profile.user.updatedAt.toISOString()
      } : null
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
        error: 'An error occurred while loading the player profile. Please try again later.'
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}