import ReviewsForm from '../components/ReviewsForm'
import ReviewsList from '../components/ReviewsList'

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <section className="mb-12">
        <h1 className="mb-4 text-3xl font-bold">Отзывы клиентов</h1>
        <ReviewsList />
      </section>

      <section className="rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Оставить отзыв</h2>
        <p className="mb-4 text-sm text-gray-600">
          Ваш отзыв будет опубликован после модерации
        </p>
        <ReviewsForm />
      </section>
    </div>
  )
}
