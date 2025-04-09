import React from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import './App.scss';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  )
}

export default App
