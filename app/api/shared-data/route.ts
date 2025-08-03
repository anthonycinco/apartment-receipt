import { NextResponse } from 'next/server'

// Simple in-memory storage for shared data
let sharedData = {
  sites: [],
  tenants: [],
  billingRecords: [],
  lastUpdated: new Date().toISOString()
}

export async function GET() {
  return NextResponse.json(sharedData)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    sharedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    return NextResponse.json({ success: true, data: sharedData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update shared data' }, { status: 500 })
  }
} 