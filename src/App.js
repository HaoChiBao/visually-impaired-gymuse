import Home from './pages/Home';
import Login from './pages/Login';

import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
