import React from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import Projects from './components/Projects/Projects';
import './App.scss';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <HeroSection />
        <Projects />
      </main>
    </div>
  )
}

export default App
