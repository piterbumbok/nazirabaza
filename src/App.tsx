import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CabinDetailPage from './pages/CabinDetailPage';
import AdminPage from './pages/AdminPage';
import CabinsListPage from './pages/CabinsListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cabins" element={<CabinsListPage />} />
        <Route path="/cabin/:id" element={<CabinDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;