import React, { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/HeroSection/HeroSection";
import Projects from "./components/Projects/Projects";
import RocketTransition from "./components/RocketTransition/RocketTransition";
import ExperiencePanel from "./components/RocketTransition/ExperiencePanel";
import PageIndicator from "./components/PageIndicator/PageIndicator";
import "./App.scss";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const experienceRef = useRef(null);
  const [startRocketTransition, setStartRocketTransition] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lenisRef = useRef(null);

  const handleTransitionComplete = () => {
    setShowExperience(true);
    setTimeout(() => {
      if (lenisRef.current && experienceRef.current) {
        lenisRef.current.scrollTo(experienceRef.current, { immediate: true });
        setActiveSection("experience");
        ScrollTrigger.refresh();
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

    lenis.on("scroll", ScrollTrigger.update);

    const sections = [
      { id: "home", ref: heroRef },
      { id: "projects", ref: projectsRef },
      { id: "experience", ref: experienceRef },
    ];

    sections.forEach((section) => {
      if (section.ref.current) {
        ScrollTrigger.create({
          trigger: section.ref.current,
          start: "top center+=100px",
          end: "bottom center-=100px",
          onEnter: () => {
            if (!startRocketTransition) {
              setActiveSection(section.id);
            }
          },
          onEnterBack: () => {
            if (!startRocketTransition) {
              setActiveSection(section.id);
            }
          },
        });
      }
    });

    const rocketTrigger = ScrollTrigger.create({
      trigger: projectsRef.current,
      start: "bottom bottom-=200px",
      end: "bottom top",
      onEnter: () => {
        setStartRocketTransition(true);
        setActiveSection(null);
      },
      onLeaveBack: () => {
        setStartRocketTransition(false);
        setShowExperience(false);
        setActiveSection("projects");
        ScrollTrigger.refresh();
      },
    });

    ScrollTrigger.refresh();
    setTimeout(() => {
      const scrollY = window.scrollY;
      let currentSection = "home";
      sections.forEach((section) => {
        if (section.ref.current) {
          const top = section.ref.current.offsetTop;
          const bottom = top + section.ref.current.offsetHeight;
          if (
            scrollY + window.innerHeight / 2 >= top &&
            scrollY + window.innerHeight / 2 <= bottom
          ) {
            currentSection = section.id;
          }
        }
      });
      if (!startRocketTransition) {
        setActiveSection(currentSection);
      }
    }, 150);

    return () => {
      gsap.ticker.remove(updateScroll);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [startRocketTransition]);

  return (
    <div className="app">
      <Navbar activeSection={activeSection} />
      <PageIndicator
        activeSection={activeSection}
        lenisInstance={lenisRef.current}
      />
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
