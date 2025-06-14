// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuditPage from './pages/AuditPage';
import ReportPage from './pages/ReportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuditPage />} />
        <Route path="/report/:reportId" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
