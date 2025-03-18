import { useState, useEffect } from 'react';
import { movieService } from '../services/api';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    console.log('Fetching movies from:', `${import.meta.env.DEV ? 'http://localhost:8006' : ''}/api/movies/`);
    
    movieService.getAll()
      .then(response => {
        console.log('Movies data received:', response);
        setMovies(response.data.results || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
        setError(`Failed to load movies: ${error.message}. ${error.response?.data?.detail || ''}`);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="movies-container">
      <h1>Explore Movies</h1>
      <div className="movies-grid">
        {movies.length > 0 ? (
          movies.map(movie => (
            <div className="movie-card" key={movie.id}>
              <div className="movie-card-header">
                <h2>{movie.title}</h2>
                {movie.avg_rating && (
                  <div className="movie-rating">
                    {movie.avg_rating.toFixed(1)} ★
                  </div>
                )}
              </div>
              <div className="movie-director">Directed by {movie.director}</div>
              <div className="movie-genre">{movie.genre} • {movie.release_year}</div>
              <p className="movie-summary">{movie.summary}</p>
              <div className="movie-actions">
                <button className="btn-primary">Read Reviews</button>
                <button className="btn-secondary">Add to Wishlist</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-movies">No movies found</div>
        )}
      </div>
    </div>
  );
}

export default Movies;