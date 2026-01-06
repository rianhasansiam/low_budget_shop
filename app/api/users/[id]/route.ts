import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { requireOwnerOrAdmin, requireAdmin } from '@/lib/auth'

// Helper to get ID filter - always convert to ObjectId for valid IDs
function getIdFilter(id: string): { _id: ObjectId } {
  // Always try to convert to ObjectId for MongoDB queries
  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    return { _id: new ObjectId(id) }
  }
  // For non-ObjectId strings, create a new ObjectId (this will throw if invalid)
  throw new Error('Invalid user ID format')
}

// GET - Get single user by ID (Owner or Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user is owner or admin
    const authResult = await requireOwnerOrAdmin(id)
    if (!authResult.isAuthorized) {
      return authResult.response
    }

    const usersCollection = await getCollection('users')
    
    const user = await usersCollection.findOne(
      getIdFilter(id),
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT - Update user (Owner or Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user is owner or admin
    const authResult = await requireOwnerOrAdmin(id)
    if (!authResult.isAuthorized) {
      return authResult.response
    }

    const body = await request.json()
    const { name, image, role, password } = body

    const usersCollection = await getCollection('users')

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (image !== undefined) updateData.image = image
    
    // Only admins can change roles
    if (role !== undefined && authResult.isAdmin) {
      updateData.role = role
    }

    // Hash new password if provided
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const result = await usersCollection.findOneAndUpdate(
      getIdFilter(id),
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can delete users
    const authResult = await requireAdmin()
    if (!authResult.isAdmin) {
      return authResult.response
    }

    const { id } = await params
    const usersCollection = await getCollection('users')

    const result = await usersCollection.deleteOne(getIdFilter(id))

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
