import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import prisma from '../../../lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { 
              profiles: true 
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          // Update last active timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActive: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            tokenBalance: user.tokenBalance,
            subscriptionTier: user.subscriptionTier,
            verified: user.verified,
            profiles: user.profiles
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.tokenBalance = (user as any).tokenBalance
        token.subscriptionTier = (user as any).subscriptionTier
        token.verified = (user as any).verified
        token.profiles = (user as any).profiles
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).tokenBalance = token.tokenBalance
        ;(session.user as any).subscriptionTier = token.subscriptionTier
        ;(session.user as any).verified = token.verified
        ;(session.user as any).profiles = token.profiles
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

export default NextAuth(authOptions)
