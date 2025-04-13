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
  const projectsRef = useRef(null);
  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);

  const handleTransitionComplete = () => {
    setShowExperience(true);
  };

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      trigger: projectsRef.current,
      start: 'bottom bottom',
      end: 'bottom top',
      onEnter: () => setStartRocketTransition(true),
      onLeaveBack: () => {
        setStartRocketTransition(false);
        setShowExperience(false);
      }
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      trigger.kill();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main>
        <HeroSection />
        <section ref={projectsRef} id="projects">
          <Projects />
        </section>
        <RocketTransition 
          startTransition={startRocketTransition} 
          onTransitionComplete={handleTransitionComplete} 
        />
        <section id="experience">
          {showExperience && <ExperiencePanel />}
        </section>
      </main>
    </div>
  );
}

export default App;
