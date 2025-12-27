import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

// GET - Fetch all users (admin only)
export async function GET() {
  try {
    const usersCollection = await getCollection('users')
    const users = await usersCollection
      .find({}, { projection: { password: 0 } }) // Exclude password
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user (signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, provider = 'credentials', picture = null } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation for credentials signup
    if (provider === 'credentials') {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
    }

    const usersCollection = await getCollection('users')

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password if provided
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    // Create user document
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      picture: picture,
      role: 'user',
      provider: provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // Return user without password - using destructuring to exclude password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        data: { ...userWithoutPassword, _id: result.insertedId }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
