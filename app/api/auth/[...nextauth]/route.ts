import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCollection } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const usersCollection = await getCollection('users')
        const user = await usersCollection.findOne({ 
          email: credentials.email.toLowerCase() 
        })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.password) {
          throw new Error('Please sign in with Google')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.picture,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const usersCollection = await getCollection('users')
          
          // Check if user exists
          const existingUser = await usersCollection.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user
            await usersCollection.insertOne({
              name: user.name,
              email: user.email,
              picture: user.image,
              password: null,
              provider: 'google',
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          } else {
            // Update last login and picture if changed
            await usersCollection.updateOne(
              { email: user.email },
              { 
                $set: { 
                  updatedAt: new Date(),
                  picture: user.image || existingUser.picture
                } 
              }
            )
          }
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return true // Still allow sign in even if DB fails
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger, session: updateSession }) {
      // Initial sign in
      if (account && user) {
        try {
          const usersCollection = await getCollection('users')
          const dbUser = await usersCollection.findOne({ email: user.email })
          
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.email = dbUser.email
            token.name = dbUser.name
            token.role = dbUser.role || 'user'
            token.picture = dbUser.picture
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }
      
      // Handle session update (when update() is called from client)
      if (trigger === 'update' && updateSession) {
        if (updateSession.name) token.name = updateSession.name
        if (updateSession.image) token.picture = updateSession.image
      }
      
      return token
    },
    async session({ session, token }) {
      // Always fetch fresh user data from database
      if (token.email) {
        try {
          const usersCollection = await getCollection('users')
          const dbUser = await usersCollection.findOne({ email: token.email as string })
          
          if (dbUser && session.user) {
            session.user.name = dbUser.name
            session.user.email = dbUser.email
            session.user.image = dbUser.picture
            ;(session.user as { id?: string }).id = dbUser._id.toString()
            ;(session.user as { role?: string }).role = dbUser.role || 'user'
            ;(session.user as { picture?: string }).picture = dbUser.picture
          }
        } catch (error) {
          console.error('Session callback error:', error)
          // Fallback to token data if DB fetch fails
          if (session.user) {
            ;(session.user as { id?: string }).id = token.id as string
            ;(session.user as { role?: string }).role = token.role as string
            ;(session.user as { picture?: string }).picture = token.picture as string
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
