import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import HeroSection from '@components/HeroSection/HeroSection';
import Navbar from '@components/Navbar/Navbar';
import PageIndicator from '@components/PageIndicator/PageIndicator';
import Projects from '@components/Projects/Projects';
import ExperiencePanel from '@components/RocketTransition/ExperiencePanel';
import RocketTransition from '@components/RocketTransition/RocketTransition';

import './App.scss';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const mainContentRef = useRef(null);

  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const lenisRef = useRef(null);
  const isSnappingRef = useRef(false);

  const handleTransitionComplete = useCallback(() => {
    setShowExperience(true);
    requestAnimationFrame(() => {
      if (lenisRef.current && experienceRef.current) {
        lenisRef.current.scrollTo(experienceRef.current, { immediate: true });
        setActiveSection('experience');
        ScrollTrigger.refresh();
        isSnappingRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const updateScroll = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateScroll);
    gsap.ticker.lagSmoothing(0);

    lenis.on('scroll', ScrollTrigger.update);

    let snapTrigger;
    let rocketTrigger;
    let timeline;

    const setupScrollTriggers = () => {
      snapTrigger?.kill();
      rocketTrigger?.kill();
      timeline?.kill();

      const sections = [
        { id: 'home', ref: heroRef },
        { id: 'projects', ref: projectsRef },
        ...(showExperience ? [{ id: 'experience', ref: experienceRef }] : []),
      ];
      const sectionElements = sections.map(s => s.ref.current).filter(Boolean);

      if (sectionElements.length === 0) return;

      timeline = gsap.timeline({ paused: true });

      timeline.addLabel('home', 0);
      sectionElements.forEach(el => {
        const id = el.id;
        if (id && id !== 'home') {
          ScrollTrigger.refresh();
          const startPos = el.offsetTop / (document.documentElement.scrollHeight - window.innerHeight);
          timeline.addLabel(id, Math.max(0, Math.min(1, startPos)));
        }
      });

      snapTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: false,
        snap: {
          snapTo: (value, self) => {
            // Safe check to prevent "Cannot read properties of undefined (reading 'labels')"
            if (!timeline || !timeline.labels || Object.keys(timeline.labels).length === 0) {
              return 0;
            }
            return self.snapIncrementOffset(value, 0.01, true);
          },
          duration: { min: 0.4, max: 0.8 },
          delay: 0.05,
          ease: 'power3.out',
          onStart: () => { isSnappingRef.current = true; },
          onComplete: (self) => {
            isSnappingRef.current = false;
            const snappedValue = self.snap;
            let closestLabel = 'home';
            let minDist = 1;
            if (timeline && timeline.labels && Object.keys(timeline.labels).length > 0) {
              for (const label in timeline.labels) {
                const dist = Math.abs(snappedValue - timeline.labels[label]);
                if (dist < minDist) {
                  minDist = dist;
                  closestLabel = label;
                }
              }
            }
            setActiveSection(closestLabel);
          },
          enabled: () => !startRocketTransition && timeline && timeline.labels && Object.keys(timeline.labels).length > 0,
        },
        onUpdate: self => {
          if (!isSnappingRef.current && !startRocketTransition && timeline && timeline.labels && Object.keys(timeline.labels).length > 0) {
            const progress = self.progress;
            let currentSection = 'home';
            const labels = timeline.labels;
            const sortedLabels = Object.entries(labels).sort(([, a], [, b]) => a - b);

            for (let i = 0; i < sortedLabels.length; i++) {
              const [label, position] = sortedLabels[i];
              if (progress >= position - 0.01) {
                currentSection = label;
              } else {
                break;
              }
            }
            if (activeSection !== currentSection) {
              setActiveSection(currentSection);
            }
          }
        },
      });

      if (projectsRef.current) {
        rocketTrigger = ScrollTrigger.create({
          trigger: projectsRef.current,
          start: 'bottom bottom',
          onEnter: () => {
            if (!startRocketTransition && !showExperience) {
              setStartRocketTransition(true);
              snapTrigger?.disable();
            }
          },
          onLeaveBack: () => {
            if (startRocketTransition && !showExperience) {
              setStartRocketTransition(false);
              snapTrigger?.enable();
            }
          }
        });
      }
    };

    setupScrollTriggers();
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(updateScroll);
      snapTrigger?.kill();
      rocketTrigger?.kill();
      timeline?.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [showExperience, startRocketTransition, handleTransitionComplete, activeSection]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar activeSection={activeSection} />

      <PageIndicator
        activeSection={activeSection}
        lenisInstance={lenisRef.current}
      />

      <main id="main-content" ref={mainContentRef}>
        <Suspense fallback={<div className="fullscreen-loading">Loading...</div>}>
          <section ref={heroRef} id="home" aria-labelledby="hero-heading">
            <HeroSection isActive={activeSection === 'home'} />
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
