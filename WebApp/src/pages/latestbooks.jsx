import { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import './books.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BookIcon = () => (
  <div className="no-image">📚</div>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

function LatestBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const booksPerPage = 24;

  const getBookCover = (book) => {
    if (book.image_links && book.image_links.thumbnail) {
      return (
        <img src={book.image_links.thumbnail} alt={book.title} />
      );
    }
    
    const colors = ['4285F4', 'EA4335', 'FBBC05', '34A853', '8F43EE', 'FF5E5B'];
    const colorIndex = book.title.length % colors.length;
    const color = colors[colorIndex];
    
    const firstLetter = book.title.charAt(0).toUpperCase();
    
    return (
      <div className="book-icon" style={{ backgroundColor: `#${color}` }}>
        <span>{firstLetter}</span>
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    console.log('Fetching books from API');
    
    api.get('/api/latest/books/')
      .then(response => {
        console.log('Books data received:', response);
        const books = response.data.results || response.data;
        console.log(`Loaded ${books.length} books`);
        setBooks(books);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        setError(`Failed to load books: ${error.message}`);
        setLoading(false);
      });
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGenre = selectedGenre === '' || 
      (book.genre && book.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(books
    .map(book => book.genre)
    .filter(Boolean)
    .flatMap(genre => genre.split(', ')))
  ].sort();

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const renderBookList = () => {
    return books
      .filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedGenre === '' || (book.categories && book.categories.includes(selectedGenre)))
      )
      .slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)
      .map(book => (
        <Link to={`/books/${book.id}`} key={book.id} className="book-card">
          <div className="book-cover">
            {getBookCover(book)}
          </div>
          <div className="book-info">
            <h3 className="book-title">{book.title}</h3>
            {book.authors && book.authors[0] && (
              <p className="book-author">{book.authors[0]}</p>
            )}
            {book.average_rating && (
              <div className="book-rating">
                <StarIcon /> {book.average_rating.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      ));
  };

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="books-container">
      <h1>Latest Books</h1>

      <Link to="/books" className="back-link-button">📚 Back to All Books</Link>
      
      {/* Search and filter controls */}
      <div className="books-controls">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search books..."
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
        Showing {currentBooks.length} of {filteredBooks.length} books
      </div>
      
      <div className='books-container latest-books-page'>
        {/* Books grid */}
        <div className="books-grid">
            {currentBooks.length > 0 ? (
            renderBookList()
            ) : (
            <div className="no-books">No books found matching your criteria</div>
            )}
        </div>
      </div>
      
      {/* Always show pagination if there are any books */}
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="page-button"
        >
          Previous
        </button>
        
        {totalPages <= 7 ? (
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

export default LatestBooks; 