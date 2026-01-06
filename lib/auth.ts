import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Extended session type with custom properties
export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string
  role: 'user' | 'admin'
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

/**
 * Get the current authenticated session
 * @returns The session object or null if not authenticated
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions)
  return session as AuthSession | null
}

/**
 * Check if the user is authenticated
 * @returns Object with isAuthenticated flag and user data
 */
export async function requireAuth(): Promise<{
  isAuthenticated: true
  user: AuthUser
} | {
  isAuthenticated: false
  response: NextResponse
}> {
  const session = await getAuthSession()
  
  if (!session || !session.user) {
    return {
      isAuthenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to access this resource' },
        { status: 401 }
      )
    }
  }

  return {
    isAuthenticated: true,
    user: session.user
  }
}

/**
 * Check if the user is an admin
 * @returns Object with isAdmin flag and user data
 */
export async function requireAdmin(): Promise<{
  isAdmin: true
  user: AuthUser
} | {
  isAdmin: false
  response: NextResponse
}> {
  const session = await getAuthSession()
  
  if (!session || !session.user) {
    return {
      isAdmin: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to access this resource' },
        { status: 401 }
      )
    }
  }

  if (session.user.role !== 'admin') {
    return {
      isAdmin: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
  }

  return {
    isAdmin: true,
    user: session.user
  }
}

/**
 * Check if the user owns the resource or is an admin
 * @param resourceUserId - The ID of the user who owns the resource
 * @returns Object with isAuthorized flag and user data
 */
export async function requireOwnerOrAdmin(resourceUserId: string): Promise<{
  isAuthorized: true
  user: AuthUser
  isAdmin: boolean
} | {
  isAuthorized: false
  response: NextResponse
}> {
  const session = await getAuthSession()
  
  if (!session || !session.user) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to access this resource' },
        { status: 401 }
      )
    }
  }

  const isAdmin = session.user.role === 'admin'
  const isOwner = session.user.id === resourceUserId

  if (!isAdmin && !isOwner) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - You do not have permission to access this resource' },
        { status: 403 }
      )
    }
  }

  return {
    isAuthorized: true,
    user: session.user,
    isAdmin
  }
}
