import React, { useEffect, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaGithub, FaPlay } from 'react-icons/fa6';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene3D } from './Scene3D';
import styles from './Projects.module.scss';

gsap.registerPlugin(ScrollTrigger);

const projectsData = [
  {
    id: 1,
    title: 'AI Finger Drummer',
    description: 'Computer vision-based hand tracking application that turns hand gestures into drum beats. Built with Python for ML processing and JavaScript for the web interface.',
    imageUrl: '/src/assets/129.jpg',
    tech: ['Python', 'JavaScript', 'TensorFlow', 'MediaPipe', 'WebAudio API'],
    links: {
      github: 'https://github.com/yourusername/ai-finger-drummer',
      demo: 'https://demo-url.com/finger-drummer'
    }
  },
  {
    id: 2,
    title: 'Tank Battle Mobile',
    description: 'A React Native mobile game featuring tank battles with real-time physics and multiplayer capabilities. Available on iOS.',
    imageUrl: '/src/assets/156.jpg',
    tech: ['React Native', 'TypeScript', 'Redux', 'React Game Engine', 'iOS'],
    links: {
      github: 'https://github.com/yourusername/tank-battle',
      demo: 'https://apps.apple.com/app/tank-battle'
    }
  },
  {
    id: 3,
    title: 'Brain Progress Animation',
    description: 'Custom React component featuring an animated "unwinding" brain logo effect using SVG animations. Perfect for loading states or progress indicators.',
    imageUrl: '/src/assets/MockPortfolioLanding.png',
    tech: ['React', 'TypeScript', 'SVG', 'Framer Motion', 'SCSS'],
    links: {
      github: 'https://github.com/yourusername/brain-progress',
      demo: 'https://demo-url.com/brain-progress'
    }
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
};

const Projects = () => {
  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Set up scroll animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#projects',
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      })
      .fromTo('.scene-container', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1 }
      )
      .fromTo('.project-content', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2 },
        '<0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  const { scrollYProgress } = useScroll();
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section className={styles.projectsSection} id="projects">
      <motion.div 
        className={styles.backgroundScene}
        style={{ opacity: backgroundOpacity }}
      >
        <div className="scene-container">
          <Scene3D projects={projectsData} />
        </div>
      </motion.div>

      <h2>Featured Projects</h2>
      <motion.div
        className={styles.projectsGrid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {projectsData.map((project, index) => (
          <motion.div
            key={project.id}
            className={`${styles.projectCard} project-content`}
            variants={cardVariants}
            custom={index}
          >
            <div className={styles.projectImage}>
              <img src={project.imageUrl} alt={project.title} />
              <div className={styles.projectLinks}>
                <a href={project.links.github} target="_blank" rel="noopener noreferrer" aria-label="View Source Code">
                  <FaGithub />
                </a>
                <a href={project.links.demo} target="_blank" rel="noopener noreferrer" aria-label="View Live Demo">
                  <FaPlay />
                </a>
              </div>
            </div>
            <div className={styles.projectContent}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.techStack}>
                {project.tech.map((tech, i) => (
                  <span key={i} className={styles.techTag}>{tech}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Projects;