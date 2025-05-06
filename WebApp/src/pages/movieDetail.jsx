import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService, reviewService } from '../services/api';
import StarIcon from '../components/starIcon';
import './detail.css';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await movieService.getById(id);
        setMovie(response.data);
        
        try {
          const reviewsResponse = await reviewService.getAll({ movie_id: id });
          const filteredReviews = reviewsResponse.data.results || reviewsResponse.data || [];
          
          setReviews(Array.isArray(filteredReviews) ? filteredReviews : []);
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          setReviews([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again.');
        setLoading(false);
      }
    };

    fetchMovieDetails();
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
        setReviewError('You have already submitted a review for this movie. You can only submit one review per movie.');
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
      
      const reviewsResponse = await reviewService.getAll({ movie_id: id });
      console.log('Fetched reviews after submission:', reviewsResponse.data);
      
      const filteredReviews = reviewsResponse.data.results || reviewsResponse.data;
      const movieReviews = Array.isArray(filteredReviews) 
        ? filteredReviews.filter(review => 
            review.movie_id === id || 
            review.media === parseInt(id) || 
            (review.media_id && review.media_id === parseInt(id))
          )
        : [];
      
      console.log('Filtered reviews for this movie:', movieReviews);
      setReviews(movieReviews);
      
      setReviewText('');
      setRating(5);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      console.log('Error response data:', err.response?.data);
      
      if (err.response && err.response.status === 400 && 
          err.response.data && err.response.data.non_field_errors && 
          err.response.data.non_field_errors.includes('The fields user, media must make a unique set.')) {
        setReviewError('You have already submitted a review for this movie. You can only submit one review per movie.');
      } else {
        setReviewError('Failed to submit review. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!movie) return <div className="error-message">Movie not found</div>;

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate('/movies')}>
        ← Back to Movies
      </button>
      
      <div className="detail-content">
        <div className="detail-header">
          <div className="detail-cover">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title} 
              />
            ) : (
              <div className="movie-icon">
                <span>{movie.title.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="detail-info">
            <h1>{movie.title}</h1>
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}
            
            <div className="metadata">
              {movie.release_date && (
                <span className="metadata-item">Released: {movie.release_date}</span>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <span className="metadata-item">
                  Genres: {movie.genres.map(g => g.name).join(', ')}
                </span>
              )}
              {movie.vote_average && (
                <span className="metadata-item rating">
                  <StarIcon /> {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie.runtime && (
                <span className="metadata-item">Runtime: {movie.runtime} min</span>
              )}
            </div>
          </div>
        </div>
        
        {movie.overview && (
          <section className="description">
            <h2>Overview</h2>
            <p>{movie.overview}</p>
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
                  placeholder="Share your thoughts about this movie..."
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
              <p className="no-reviews">No reviews yet. Be the first to review this movie!</p>
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

export default MovieDetail; 