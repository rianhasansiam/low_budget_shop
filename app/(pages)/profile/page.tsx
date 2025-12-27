'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ProfileClient from './ProfileClient'


function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileClient />
    </Suspense>
  )
}
