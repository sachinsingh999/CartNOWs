const getProductReviews = (product) => product?.reviews || [];

const getAverageRating = (product) => {
  const reviews = getProductReviews(product);

  if (reviews.length === 0) {
    return 0;
  }

  return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
};

const getReviewCount = (product) => getProductReviews(product).length;

const getStars = (rating) => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${"★".repeat(roundedRating)}${"☆".repeat(5 - roundedRating)}`;
};

export { getAverageRating, getReviewCount, getStars };
