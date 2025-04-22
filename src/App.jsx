import '@/App.scss';
import HeroSection from '@components/HeroSection/HeroSection';
import Navbar from '@components/Navbar/Navbar';
import PageIndicator from '@components/PageIndicator/PageIndicator';
import Projects from '@components/Projects/Projects';
import ExperiencePanel from '@components/RocketTransition/ExperiencePanel';
import RocketTransition from '@components/RocketTransition/RocketTransition';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const lenisRef = useRef(null);
  const isSnappingRef = useRef(false); // Prevent scroll events during snap

  const handleTransitionComplete = () => {
    setShowExperience(true);
    setTimeout(() => {
      if (lenisRef.current && experienceRef.current) {
        lenisRef.current.scrollTo(experienceRef.current, { immediate: true });
        setActiveSection('experience');
        ScrollTrigger.refresh();
        isSnappingRef.current = false;
      }
    }, 100);
  };

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const updateScroll = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateScroll);
    gsap.ticker.lagSmoothing(0);

    // Only update ScrollTrigger if not currently snapping
    lenis.on('scroll', (e) => {
      if (!isSnappingRef.current) {
        ScrollTrigger.update(e.scroll);
      }
    });

    const sections = [
      { id: 'home', ref: heroRef },
      { id: 'projects', ref: projectsRef },
      { id: 'experience', ref: experienceRef },
    ];
    const sectionElements = sections.map(s => s.ref.current).filter(Boolean);

    let snapTrigger;
    const createSnapTrigger = () => {
      if (snapTrigger) snapTrigger.kill();
      snapTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: 'labelsDirectional',
          duration: { min: 0.2, max: 0.6 },
          delay: 0.05,
          ease: 'power2.inOut',
          onStart: () => { isSnappingRef.current = true; },
          onComplete: (self) => {
            isSnappingRef.current = false;
            setActiveSection(self.vars.snap.label);
          },
          enabled: !startRocketTransition,
        },
        onRefresh: self => {
          // Instead of trying to clear labels (which doesn't exist), 
          // we'll store all added labels in a ref and track them manually
          
          // First add base home label
          self.addLabel('home', 0);
          
          // Then add other section labels if they should be included
          sectionElements.forEach(el => {
            const id = el.id;
            if (id) {
              const startPos = (el.offsetTop + 1) / self.scroller.scrollHeight;
              if (id === 'experience' && !showExperience) return;
              self.addLabel(id, startPos);
            }
          });
        },
        onUpdate: self => {
          if (!isSnappingRef.current && !startRocketTransition) {
            const scroll = self.scroll();
            let currentSection = 'home';
            for (const label in self.labels) {
              if (scroll >= self.labels[label] * self.maxScroll - 1) {
                currentSection = label;
              } else {
                break;
              }
            }
            setActiveSection(currentSection);
          }
        }
      });
    };

    // Rocket transition trigger
    const rocketTrigger = ScrollTrigger.create({
      trigger: projectsRef.current,
      start: 'bottom bottom-=200px',
      end: 'bottom top',
      onEnter: () => {
        if (!startRocketTransition) {
          setStartRocketTransition(true);
          setActiveSection(null);
          isSnappingRef.current = true;
          snapTrigger?.disable();
        }
      },
      onLeaveBack: () => {
        setStartRocketTransition(false);
        setShowExperience(false);
        setActiveSection('projects');
        isSnappingRef.current = false;
        setTimeout(() => {
          snapTrigger?.enable();
          ScrollTrigger.refresh();
        }, 50);
      },
    });

    createSnapTrigger();
    ScrollTrigger.refresh();
    const initialCheckTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
      snapTrigger?.update();
    }, 150);

    return () => {
      clearTimeout(initialCheckTimeout);
      gsap.ticker.remove(updateScroll);
      snapTrigger?.kill();
      rocketTrigger?.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger !== snapTrigger && trigger !== rocketTrigger) {
          trigger.kill();
        }
      });
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [startRocketTransition, showExperience]);

  return (
    <div className="app">
      <Navbar activeSection={activeSection} />
      <PageIndicator
        activeSection={activeSection}
        lenisInstance={lenisRef.current}
      />
      <main>
        <section ref={heroRef} id="home">
          <HeroSection isActive={activeSection === 'home'} />
        </section>
        <section ref={projectsRef} id="projects">
          <Projects isActive={activeSection === 'projects'} />
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
