import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CabinDetailPage from './pages/CabinDetailPage';
import AdminPage from './pages/AdminPage';
import CabinsListPage from './pages/CabinsListPage';
import ContactsPage from './pages/ContactsPage';
import ReviewsPage from './pages/ReviewsPage';
import { apiService } from './services/api';

function App() {
  const [adminPath, setAdminPath] = useState('admin');

  useEffect(() => {
    const loadAdminPath = async () => {
      try {
        const response = await apiService.getAdminPath();
        setAdminPath(response.path);
      } catch (error) {
        console.error('Error loading admin path:', error);
      }
    };

    loadAdminPath();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cabins" element={<CabinsListPage />} />
        <Route path="/cabin/:id" element={<CabinDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path={`/${adminPath}`} element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;