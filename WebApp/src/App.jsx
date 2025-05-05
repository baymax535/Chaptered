import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Books from './pages/books';
import Movies from './pages/movies';
import LatestBooks from './pages/latestbooks';
import LatestMovies from './pages/latestmovies';
import BookDetail from './pages/bookDetail';
import MovieDetail from './pages/movieDetail';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/profile';
import Navbar from './components/navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/latest-books" element={<LatestBooks />} />
            <Route path="/latest-movies" element={<LatestMovies />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;