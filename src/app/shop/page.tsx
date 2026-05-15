'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Shop lives in the single-page tab system at /#shop
// Redirect anyone landing on /shop directly
export default function ShopRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/#shop')
  }, [router])
  return null
}
