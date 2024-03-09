import Home from './pages/Home';
import Login from './pages/Login';

import Test from './pages/Test';

import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
