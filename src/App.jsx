import Lenis from 'lenis';
import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';

// Lazy load components
const HeroSection = lazy(() => import('@components/HeroSection/HeroSection'));
const Navbar = lazy(() => import('@components/Navbar/Navbar'));
const PageIndicator = lazy(() => import('@components/PageIndicator/PageIndicator'));
const Projects = lazy(() => import('@components/Projects/Projects'));
const ExperiencePanel = lazy(() => import('@components/RocketTransition/ExperiencePanel'));
const RocketTransition = lazy(() => import('@components/RocketTransition/RocketTransition'));

import './App.scss';

function App() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const mainContentRef = useRef(null);

  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const lenisRef = useRef(null);

  const scrollToSection = useCallback((ref) => {
    if (lenisRef.current && ref.current) {
      lenisRef.current.scrollTo(ref.current, { offset: 0, duration: 1.2 });
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowExperience(true);
    requestAnimationFrame(() => {
      if (lenisRef.current && experienceRef.current) {
        lenisRef.current.scrollTo(experienceRef.current, { immediate: true });
        setActiveSection('experience');
      }
    });
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const updateScroll = (time) => {
      lenis.raf(time * 1000);
    };

    let rafId;
    const raf = (time) => {
      updateScroll(time / 1000);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const centerViewport = scrollY + windowHeight / 2;

      // Determine active section
      let currentSection = 'home'; // Default
      const heroBounds = heroRef.current?.getBoundingClientRect();
      const projectsBounds = projectsRef.current?.getBoundingClientRect();
      const experienceBounds = experienceRef.current?.getBoundingClientRect();

      // Calculate section midpoints relative to document top
      const heroMid = heroBounds ? scrollY + heroBounds.top + heroBounds.height / 2 : -Infinity;
      const projectsMid = projectsBounds ? scrollY + projectsBounds.top + projectsBounds.height / 2 : Infinity;
      const experienceMid = experienceBounds ? scrollY + experienceBounds.top + experienceBounds.height / 2 : Infinity;

      // Find which section midpoint is closest to the viewport center
      const distToHero = Math.abs(centerViewport - heroMid);
      const distToProjects = Math.abs(centerViewport - projectsMid);
      const distToExperience = showExperience && experienceBounds ? Math.abs(centerViewport - experienceMid) : Infinity;

      if (distToProjects < distToHero && distToProjects <= distToExperience) {
        currentSection = 'projects';
      } else if (showExperience && distToExperience < distToHero && distToExperience < distToProjects) {
        currentSection = 'experience';
      } else {
        currentSection = 'home';
      }

      // Update state only if it changed
      setActiveSection(prevSection => {
        if (prevSection !== currentSection) {
          // console.log('Active Section:', currentSection); // Debug log
          return currentSection;
        }
        return prevSection;
      });

      // Rocket transition trigger logic (keep existing)
      if (projectsBounds && !startRocketTransition) {
        const { bottom } = projectsBounds;
        const triggerPoint = windowHeight * 0.2;
        if (bottom < triggerPoint) {
          console.log('Triggering Rocket Transition');
          setStartRocketTransition(true);
        }
      }
    };

    // Initial check in case the page loads scrolled down
    handleScroll();

    lenis.on('scroll', handleScroll);

    return () => {
      lenis.off('scroll', handleScroll);
      cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
    // Add showExperience to dependencies as it affects experience section calculation
  }, [startRocketTransition, showExperience]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Suspense fallback={<div className="navbar-loading"></div>}>
        <Navbar activeSection={activeSection} />
      </Suspense>

      <Suspense fallback={null}>
        <PageIndicator
          activeSection={activeSection}
          lenisInstance={lenisRef.current}
        />
      </Suspense>

      <main id="main-content" ref={mainContentRef}>
        <Suspense fallback={<div className="fullscreen-loading">Loading...</div>}>
          <section ref={heroRef} id="home" aria-labelledby="hero-heading">
            <HeroSection isActive={activeSection === 'home'} scrollToProjects={() => scrollToSection(projectsRef)} />
          </section>

          <section ref={projectsRef} id="projects" aria-labelledby="projects-heading">
            <Projects isActive={activeSection === 'projects'} />
          </section>

          <RocketTransition
            startTransition={startRocketTransition}
            onTransitionComplete={handleTransitionComplete}
          />

          {showExperience && (
            <section ref={experienceRef} id="experience" aria-labelledby="experience-heading">
              <ExperiencePanel />
            </section>
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
