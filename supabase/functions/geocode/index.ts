import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:8080']
const DEFAULT_RATE_LIMIT_COUNT = 60
const DEFAULT_RATE_LIMIT_WINDOW = '1 hour'

const getAllowedOrigins = () => {
  const raw = Deno.env.get('ALLOWED_ORIGINS')
  if (!raw) return DEFAULT_ALLOWED_ORIGINS
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean)
}

const buildCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
})

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigins = getAllowedOrigins()
  const originAllowed = origin !== '' && allowedOrigins.includes(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    if (!originAllowed) {
      return new Response(null, { status: 403 })
    }
    return new Response(null, { headers: buildCorsHeaders(origin) })
  }

  if (!originAllowed) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') ?? '',
      },
    },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 401,
      }
    )
  }

  const rateLimitCount = Number(Deno.env.get('GEOCODE_RATE_LIMIT_COUNT') ?? DEFAULT_RATE_LIMIT_COUNT)
  const rateLimitWindow = Deno.env.get('GEOCODE_RATE_LIMIT_WINDOW') ?? DEFAULT_RATE_LIMIT_WINDOW
  const { data: rateAllowed, error: rateError } = await supabase.rpc('check_rate_limit', {
    p_action: 'geocode',
    p_limit: rateLimitCount,
    p_window: rateLimitWindow,
  })

  if (rateError) {
    return new Response(
      JSON.stringify({ error: 'Rate limit check failed' }),
      {
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }

  if (!rateAllowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      {
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 429,
      }
    )
  }

  try {
    const { lat, lng, address } = await req.json()
    
    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      console.error('Google Maps API key not configured')
      return new Response(
        JSON.stringify({ error: 'Geocoding service unavailable' }),
        {
          headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
          status: 503,
        }
      )
    }

    let url: string

    if (lat !== undefined && lng !== undefined) {
      // Reverse geocoding (coordinates to address)
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    } else if (address) {
      // Forward geocoding (address to coordinates)
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        {
          headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Geocode error:', errorMessage)
    return new Response(
      JSON.stringify({ error: 'Failed to process location request' }),
      {
        headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
