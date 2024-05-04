import React from 'react';
import ReactDOM from 'react-dom/client';

import Map from './Map';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Concert from './Concert';
import SearchBar from './SearchBar';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' exact element={<Map />} />
        <Route path='/concert/:concertId' element={<Concert />} />
        <Route path='/SearchBar' exact element={<SearchBar />} />
        
      </Routes>
      
    </Router>
    
    
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

