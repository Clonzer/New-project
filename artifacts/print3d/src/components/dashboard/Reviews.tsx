import { format } from "date-fns";
import { CheckCircle2, Star, User } from "lucide-react";

export function Reviews({ myReviews, reviewsReceived }) {
  return (
    <div className="space-y-6">
      {/* Reviews Received Section */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Reviews you've received
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Feedback from customers and other sellers about your work.</p>
        </div>
        {!reviewsReceived?.reviews?.length ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No reviews received yet.</p>
            <p className="text-sm text-zinc-600 mt-2">Complete orders to start receiving reviews!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviewsReceived.reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-400" />
                      {review.reviewerName}
                    </p>
                    <p className="text-sm text-zinc-500">Order #{review.orderId} · {format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300">
                    {review.rating}/5
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {review.comment?.trim() || "No written comment was included with this rating."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Left Section */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">Reviews you've left</h2>
          <p className="text-sm text-zinc-500 mt-1">A history of the feedback you have submitted after completed orders.</p>
        </div>
        {!myReviews?.reviews?.length ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No reviews submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {myReviews.reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{review.revieweeName}</p>
                    <p className="text-sm text-zinc-500">Order #{review.orderId} · {format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300">
                    {review.rating}/5
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {review.comment?.trim() || "No written comment was included with this rating."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
