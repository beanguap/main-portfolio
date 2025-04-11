import React, { useEffect, useRef, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import throttle from 'lodash/throttle';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import Projects from './components/Projects/Projects';
import './App.scss';

gsap.registerPlugin(ScrollTrigger);

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

function App() {
  const projectsRef = useRef(null);
  const heroRef = useRef(null);
  const isMobileDevice = isMobile();

  // Throttle scroll updates for better performance
  const handleScroll = useCallback(
    throttle((time) => {
      ScrollTrigger.update();
    }, isMobileDevice ? 100 : 16),
    [isMobileDevice]
  );

  useEffect(() => {
    // Initialize smooth scroll with mobile optimization
    const lenis = new Lenis({
      duration: isMobileDevice ? 1 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isMobileDevice,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', handleScroll);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Add classes for safer targeting
    if (heroRef.current) {
      heroRef.current.classList.add('hero-container');
    }

    // Create transition animation with mobile optimizations
    const heroToProjectsAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: projectsRef.current,
        start: "top bottom",
        end: "top 40%",
        scrub: isMobileDevice ? 0.5 : 1,
        markers: false,
        onEnter: () => {
          document.body.classList.add('projects-active');
        },
        onLeaveBack: () => {
          document.body.classList.remove('projects-active');
        }
      }
    });

    // More specific targeting with mobile-optimized animations
    heroToProjectsAnimation
      .to('.hero-element', { 
        opacity: 0, 
        y: -50, 
        stagger: isMobileDevice ? 0.02 : 0.05,
        ease: "power2.inOut"
      }, 0)
      .to('.hero-container', { 
        scale: 0.95, 
        opacity: 0.8,
        ease: "power2.inOut" 
      }, 0);

    // Clean up function
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      handleScroll.cancel();
      document.body.classList.remove('projects-active');
    };
  }, [handleScroll, isMobileDevice]);

  // Handle navigation scroll with touch feedback
  const scrollToSection = (sectionRef) => {
    if (!sectionRef.current) return;
    
    if (isMobileDevice) {
      // Add touch feedback
      const button = document.activeElement;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 200);
      }
    }
    
    sectionRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: isMobileDevice ? 'start' : 'center'
    });
  };

  return (
    <div className="app">
      <Navbar onProjectsClick={() => scrollToSection(projectsRef)} />
      <main>
        <div ref={heroRef} className="section-container">
          <HeroSection />
        </div>
        <div ref={projectsRef} className="section-container">
          <Projects />
        </div>
      </main>
    </div>
  );
}

export default App;
