import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import Projects from './components/Projects/Projects';
import './App.scss';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const projectsRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Add a class to the container for safer targeting
    heroRef.current.classList.add('hero-container');

    // Create transition animation with more specific targeting
    const heroToProjectsAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: projectsRef.current,
        start: "top bottom",
        end: "top 40%",
        scrub: true,
        markers: false, // Turn on for debugging, off for production
      }
    });

    // More specific targeting with fallbacks
    heroToProjectsAnimation
      .to('.hero-element', { opacity: 0, y: -50, stagger: 0.05 }, 0)
      .to('.hero-container', { scale: 0.95, opacity: 0.8 }, 0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main>
        <div ref={heroRef}>
          <HeroSection />
        </div>
        <div ref={projectsRef}>
          <Projects />
        </div>
      </main>
    </div>
  )
}

export default App
