import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Books from './pages/books';
import Movies from './pages/movies';
<<<<<<< HEAD
import LatestBooks from './pages/latestbooks';
import LatestMovies from './pages/latestmovies';
=======
>>>>>>> e52135338f7de1e3520460255b08674c7b8495c2
import BookDetail from './pages/bookDetail';
import MovieDetail from './pages/movieDetail';
import Login from './pages/login';
import Register from './pages/register';
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
<<<<<<< HEAD
            <Route path="/latest-books" element={<LatestBooks />} />
            <Route path="/latest-movies" element={<LatestMovies />} />
=======
>>>>>>> e52135338f7de1e3520460255b08674c7b8495c2
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
