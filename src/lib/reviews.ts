import { supabase, supabaseAdmin } from './supabaseClient'
import type { Review, NewReview, Category } from '../types/review'

// Public API: Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return { data: data as Category[] | null, error }
}

// Public API: Add a review (will be pending approval)
// Использует Edge Function для сохранения IP-адреса
export async function addReview({ name, email, message, rating = 5, photos = [] }: NewReview) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/submit-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      },
      body: JSON.stringify({ name, email, message, rating, photos })
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: new Error(result.error || 'Failed to submit review') }
    }

    return { data: result.data as Review[] | null, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

// Public API: List approved reviews only
export async function listApprovedReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, categories(name)')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  return { data: data as Review[] | null, error }
}

// Upload photo to Supabase Storage (bucket: 'review-photos')
export async function uploadPhoto(file: File, userId = 'anon', isAdmin = false) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Use admin client for admin uploads to bypass RLS, regular client for public users
  const client = isAdmin && supabaseAdmin ? supabaseAdmin : supabase

  const uploadRes = await client.storage
    .from('review-photos')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadRes.error) return { data: null, error: uploadRes.error }

  const { data: urlData } = client.storage.from('review-photos').getPublicUrl(fileName)
  // getPublicUrl returns { data: { publicUrl } }
  return { data: urlData.publicUrl, error: null }
}

export async function deletePhoto(path: string) {
  const { data, error } = await supabase.storage.from('review-photos').remove([path])
  return { data, error }
}

// Admin: update review (edit fields, replace photos array)
export async function updateReview(reviewId: string, patch: Partial<Omit<Review, 'id' | 'created_at'>>) {
  if (!supabaseAdmin) {
    return { data: null, error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY') }
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update(patch)
    .eq('id', reviewId)
    .select()

  return { data: data as Review[] | null, error }
}

// Admin API: List all reviews (pending and approved)
export async function listAllReviews() {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
    }
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data as Review[] | null, error }
}

// Admin API: Approve a review
export async function approveReview(reviewId: string) {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
    }
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({ approved: true })
    .eq('id', reviewId)
    .select()

  return { data: data as Review[] | null, error }
}

// Admin API: Delete a review
export async function deleteReview(reviewId: string) {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
    }
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .select()

  return { data: data as Review[] | null, error }
}
