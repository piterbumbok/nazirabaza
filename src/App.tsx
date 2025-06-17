import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CabinDetailPage from './pages/CabinDetailPage';
import AdminPage from './pages/AdminPage';
import CabinsListPage from './pages/CabinsListPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cabins" element={<CabinsListPage />} />
        <Route path="/cabin/:id" element={<CabinDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/:adminPath" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;