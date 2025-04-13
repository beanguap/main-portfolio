import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import Projects from './components/Projects/Projects';
import RocketTransition from './components/RocketTransition/RocketTransition';
import ExperiencePanel from './components/RocketTransition/ExperiencePanel';
import './App.scss';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleTransitionComplete = () => {
    setShowExperience(true);
  };

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const sections = [
      { id: 'home', ref: heroRef },
      { id: 'projects', ref: projectsRef },
      { id: 'experience', ref: experienceRef },
    ];

    sections.forEach(section => {
      if (section.ref.current) {
        ScrollTrigger.create({
          trigger: section.ref.current,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(section.id),
          onEnterBack: () => setActiveSection(section.id),
        });
      }
    });

    const rocketTrigger = ScrollTrigger.create({
      trigger: projectsRef.current,
      start: 'bottom bottom-=200px',
      end: 'bottom top',
      onEnter: () => setStartRocketTransition(true),
      onLeaveBack: () => {
        setStartRocketTransition(false);
        setShowExperience(false);
        if (ScrollTrigger.isInViewport(projectsRef.current, 0.5)) {
           setActiveSection('projects');
        } else if (ScrollTrigger.isInViewport(heroRef.current, 0.5)) {
           setActiveSection('home');
        }
      }
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="app">
      <Navbar activeSection={activeSection} />
      <main>
        <section ref={heroRef} id="home">
          <HeroSection />
        </section>
        <section ref={projectsRef} id="projects">
          <Projects />
        </section>
        <RocketTransition 
          startTransition={startRocketTransition} 
          onTransitionComplete={handleTransitionComplete} 
        />
        <section ref={experienceRef} id="experience">
          {showExperience && <ExperiencePanel />}
        </section>
      </main>
    </div>
  );
}

export default App;
