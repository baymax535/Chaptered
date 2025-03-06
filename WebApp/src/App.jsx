import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Books from './pages/books'
import Navbar from './components/navbar'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
