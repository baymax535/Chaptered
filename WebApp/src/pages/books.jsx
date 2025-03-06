import { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import './books.css';

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    console.log('Fetching books from:', `${import.meta.env.DEV ? 'http://localhost:8006' : ''}/api/books/`);
    
    bookService.getAll()
      .then(response => {
        console.log('Books data received:', response);
        setBooks(response.data.results || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching books details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        setError(`Failed to load books: ${error.message}. ${error.response?.data?.detail || ''}`);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="books-container">
      <h1>Explore Books</h1>
      
      <div className="books-grid">
        {books.length > 0 ? (
          books.map(book => (
            <div className="book-card" key={book.id}>
              <div className="book-card-header">
                <h2>{book.title}</h2>
                {book.avg_rating && (
                  <div className="book-rating">
                    {book.avg_rating.toFixed(1)} ★
                  </div>
                )}
              </div>
              <div className="book-author">by {book.author}</div>
              <div className="book-genre">{book.genre} • {book.publication_year}</div>
              <p className="book-summary">{book.summary}</p>
              <div className="book-actions">
                <button className="btn-primary">Read Reviews</button>
                <button className="btn-secondary">Add to Wishlist</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-books">No books found</div>
        )}
      </div>
    </div>
  );
}

export default Books; 