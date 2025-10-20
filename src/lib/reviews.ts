import { supabase, supabaseAdmin } from './supabaseClient'
import type { Review, NewReview } from '../types/review'

// Public API: Add a review (will be pending approval)
export async function addReview({ name, email, message, rating = 5, photos = [] }: NewReview) {
  // Используем RPC функцию для обхода RLS проблем
  const { data, error } = await supabase
    .rpc('insert_review', {
      p_name: name,
      p_email: email,
      p_message: message,
      p_rating: rating,
      p_photos: photos
    })

  return { data: data as Review[] | null, error }
}

// Public API: List approved reviews only
export async function listApprovedReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  return { data: data as Review[] | null, error }
}

// Upload photo to Supabase Storage (bucket: 'review-photos')
export async function uploadPhoto(file: File, userId = 'anon') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const uploadRes = await supabase.storage
    .from('review-photos')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadRes.error) return { data: null, error: uploadRes.error }

  const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(fileName)
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
