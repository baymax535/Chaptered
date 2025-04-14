import { useState, useEffect } from 'react';
import { movieService } from '../services/api';
import './movies.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MovieIcon = () => (
  <div className="no-image">🎬</div>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

function LatestMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const moviesPerPage = 24;

  const getMoviePoster = (movie) => {
    if (movie.poster_path) {
      return (
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
        />
      );
    }
    
    const colors = ['4285F4', 'EA4335', 'FBBC05', '34A853', '8F43EE', 'FF5E5B'];
    const colorIndex = movie.title.length % colors.length;
    const color = colors[colorIndex];
    
    const firstLetter = movie.title.charAt(0).toUpperCase();
    
    return (
      <div className="movie-icon" style={{ backgroundColor: `#${color}` }}>
        <span>{firstLetter}</span>
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    console.log('Fetching movies from API');
    
    api.get('/api/latest/movies/')
      .then(response => {
        console.log('Movies data received:', response);
        const movies = response.data.results || response.data;
        console.log(`Loaded ${movies.length} movies`);
        setMovies(movies);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
        setError(`Failed to load movies: ${error.message}`);
        setLoading(false);
      });
  }, []);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = searchTerm === '' || 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGenre = selectedGenre === '' || 
      (movie.genres && movie.genres.some(g => g.name === selectedGenre));
      
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(movies
    .map(movie => movie.genres && movie.genres.map(g => g.name))
    .filter(Boolean)
    .flatMap(genre => genre.split(', ')))
  ].sort();

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / moviesPerPage));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const renderMovieList = () => {
    return movies
      .filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedGenre === '' || (movie.genres && movie.genres.some(g => g.name === selectedGenre)))
      )
      .slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage)
      .map(movie => (
        <Link to={`/movies/${movie.id}`} key={movie.id} className="movie-card">
          <div className="movie-poster">
            {getMoviePoster(movie)}
          </div>
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            {movie.release_date && (
              <p className="movie-year">{movie.release_date.substring(0, 4)}</p>
            )}
            {movie.vote_average && (
              <div className="movie-rating">
                <StarIcon /> {movie.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      ));
  };

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="movies-container">
      <h1>Latest Movies</h1>

      <Link to="/movies" className="back-link-button">🎬 Back to All Movies</Link>
      
      {/* Search and filter controls */}
      <div className="movies-controls">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        
        <div className="filter-dropdown">
          <select 
            value={selectedGenre} 
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Show total count */}
      <div className="results-info">
        Showing {currentMovies.length} of {filteredMovies.length} movies
      </div>
      
      <div className="movies-container latest-movies-page">
        {/* Movies grid */}
        <div className="movies-grid">
            {currentMovies.length > 0 ? (
            renderMovieList()
            ) : (
            <div className="no-movies">No movies found matching your criteria</div>
            )}
        </div>
      </div>
      
      {/* Always show pagination */}
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="page-button"
        >
          Previous
        </button>
        
        {totalPages <= 7 ? (
          // Show all page numbers if there are 7 or fewer
          [...Array(totalPages).keys()].map(number => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={currentPage === number + 1 ? 'page-button active' : 'page-button'}
            >
              {number + 1}
            </button>
          ))
        ) : (
          // Show ellipsis for many pages
          <>
            {/* First page */}
            <button
              onClick={() => paginate(1)}
              className={currentPage === 1 ? 'page-button active' : 'page-button'}
            >
              1
            </button>
            
            {/* Ellipsis or immediate pages */}
            {currentPage > 3 && <span className="ellipsis">...</span>}
            
            {/* Pages around current page */}
            {Array.from({length: 3}, (_, i) => 
              currentPage - 1 + i)
              .filter(p => p > 1 && p < totalPages)
              .map(p => (
                <button
                  key={p}
                  onClick={() => paginate(p)}
                  className={currentPage === p ? 'page-button active' : 'page-button'}
                >
                  {p}
                </button>
              ))
            }
            
            {/* Ellipsis */}
            {currentPage < totalPages - 2 && <span className="ellipsis">...</span>}
            
            {/* Last page */}
            <button
              onClick={() => paginate(totalPages)}
              className={currentPage === totalPages ? 'page-button active' : 'page-button'}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="page-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default LatestMovies;