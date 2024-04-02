import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Test from './pages/Test';
// import TestCopy from './pages/old/TestCopy';

import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<Test />} />
      {/* <Route path="/testcopy" element={<TestCopy />} /> */}

      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
