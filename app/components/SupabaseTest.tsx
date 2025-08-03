'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        
        // Test basic connection
        const { data, error } = await supabase
          .from('sites')
          .select('count')
          .limit(1)
        
        if (error) {
          console.error('Supabase connection error:', error)
          setStatus('error')
          setError(error.message)
        } else {
          console.log('✅ Supabase connected successfully!')
          setStatus('connected')
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  if (status === 'testing') {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        🔄 Testing Supabase connection...
      </div>
    )
  }

  if (status === 'connected') {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ Supabase connected successfully!
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        ❌ Supabase connection failed: {error}
      </div>
    )
  }

  return null
} 