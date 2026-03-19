import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { itemId, message } = await request.json()

    if (!itemId || !message) {
      return NextResponse.json(
        { error: 'Missing itemId or message' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user already claimed this item
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id')
      .eq('item_id', itemId)
      .eq('claimer_id', user.id)
      .single()

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already claimed this item' },
        { status: 409 }
      )
    }

    // Insert new claim
    const { data, error } = await supabase
      .from('claims')
      .insert({
        item_id: itemId,
        claimer_id: user.id,
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Claims API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const itemId = request.nextUrl.searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get claims for item (only if user owns the item)
    const { data: item } = await supabase
      .from('items')
      .select('owner_id')
      .eq('id', itemId)
      .single()

    if (item?.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Claims API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
