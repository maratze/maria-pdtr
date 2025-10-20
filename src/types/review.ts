export interface Category {
  id: string
  name: string
  display_order: number
  created_at: string
}

export interface Review {
  id: string
  name: string | null
  email: string | null
  message: string
  rating: number
  photos: string[]
  approved: boolean
  category_id: string | null
  categories?: { name: string } | null
  created_at: string
}

export interface NewReview {
  name: string
  email?: string
  message: string
  rating: number
  photos?: string[]
}

export interface ReviewsResponse {
  data: Review[] | null
  error: Error | null
}

export interface ReviewResponse {
  data: Review | null
  error: Error | null
}
