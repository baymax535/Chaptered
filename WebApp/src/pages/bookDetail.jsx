import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookService, reviewService } from '../services/api';
import StarIcon from '../components/starIcon';
import './detail.css';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await bookService.getById(id);
        setBook(response.data);
        
        try {
          const reviewsResponse = await reviewService.getAll({ book_id: id });
          const filteredReviews = reviewsResponse.data.results || reviewsResponse.data || [];
          
          setReviews(Array.isArray(filteredReviews) ? filteredReviews : []);
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          setReviews([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again.');
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    
    if (!isLoggedIn) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }
    
    if (reviewText.trim() === '') {
      setReviewError('Review text cannot be empty.');
      return;
    }
    
    try {
      const userReview = reviews.find(review => 
        review.username === localStorage.getItem('username') || 
        review.user === parseInt(localStorage.getItem('user_id'))
      );
      
      console.log('Current reviews:', reviews);
      console.log('Looking for review by user:', localStorage.getItem('username'), 'or ID:', localStorage.getItem('user_id'));
      console.log('Found existing user review?', userReview);
      
      if (userReview) {
        setReviewError('You have already submitted a review for this book. You can only submit one review per book.');
        return;
      }
      
      setIsSubmitting(true);
      console.log('Submitting review data:', {
        media: id,
        review_text: reviewText,
        rating: parseInt(rating),
      });
      
      const response = await reviewService.create({
        media: id,
        review_text: reviewText,
        rating: parseInt(rating),
      });
      
      console.log('Review submission response:', response);
      
      const reviewsResponse = await reviewService.getAll({ book_id: id });
      console.log('Fetched reviews after submission:', reviewsResponse.data);
      
      const filteredReviews = reviewsResponse.data.results || reviewsResponse.data;
      const bookReviews = Array.isArray(filteredReviews) 
        ? filteredReviews.filter(review => 
            review.book_id === id || 
            review.media === parseInt(id) || 
            (review.media_id && review.media_id === parseInt(id))
          )
        : [];
      
      console.log('Filtered reviews for this book:', bookReviews);
      setReviews(bookReviews);
      
      // Clear form
      setReviewText('');
      setRating(5);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      console.log('Error response data:', err.response?.data);
      
      if (err.response && err.response.status === 400 && 
          err.response.data && err.response.data.non_field_errors && 
          err.response.data.non_field_errors.includes('The fields user, media must make a unique set.')) {
        setReviewError('You have already submitted a review for this book. You can only submit one review per book.');
      } else {
        setReviewError('Failed to submit review. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!book) return <div className="error-message">Book not found</div>;

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate('/books')}>
        ← Back to Books
      </button>
      
      <div className="detail-content">
        <div className="detail-header">
          <div className="detail-cover">
            {book.image_links && book.image_links.thumbnail ? (
              <img src={book.image_links.thumbnail} alt={book.title} />
            ) : (
              <div className="book-icon">
                <span>{book.title.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="detail-info">
            <h1>{book.title}</h1>
            {book.authors && (
              <p className="author">by {book.authors.join(', ')}</p>
            )}
            
            <div className="metadata">
              {book.published_date && (
                <span className="metadata-item">Published: {book.published_date}</span>
              )}
              {book.categories && book.categories.length > 0 && (
                <span className="metadata-item">Categories: {book.categories.join(', ')}</span>
              )}
              {book.average_rating && (
                <span className="metadata-item rating">
                  <StarIcon /> {book.average_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {book.description && (
          <section className="description">
            <h2>Description</h2>
            <p>{book.description}</p>
          </section>
        )}
        
        <section className="reviews-section">
          <h2>Reviews</h2>
          
          {isLoggedIn ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <select 
                  id="rating" 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="review">Your Review:</label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts about this book..."
                  required
                ></textarea>
              </div>
              
              {reviewError && <p className="error-message">{reviewError}</p>}
              
              <button 
                type="submit" 
                className="submit-review" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please <Link to="/login">log in</Link> to leave a review.</p>
            </div>
          )}
          
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this book!</p>
            ) : (
              reviews.map(review => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <span className="reviewer-name">{review.username || 'Anonymous'}</span>
                    <span className="review-rating">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-content">{review.review_text || review.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BookDetail; 