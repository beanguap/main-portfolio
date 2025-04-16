import React from 'react';
import styles from './PageIndicator.module.scss';

// Define the sections that the indicator will track
const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
];

export default function PageIndicator({ activeSection, lenisInstance }) {

  const handleDotClick = (sectionId) => {
    // Scroll to the section using Lenis
    const targetElement = document.getElementById(sectionId);
    if (targetElement && lenisInstance) {
        lenisInstance.scrollTo(targetElement, { offset: 0, duration: 1.5 });
    }
  };

  return (
    <nav className={styles.indicatorContainer} aria-label="Page sections">
      {SECTIONS.map((section) => (
        <button 
          key={section.id} 
          className={`${styles.dot} ${activeSection === section.id ? styles.active : ''}`} 
          onClick={() => handleDotClick(section.id)}
          aria-label={`Scroll to ${section.label} section`}
          aria-current={activeSection === section.id ? 'page' : undefined}
          type="button" // Explicitly set type for accessibility
        >
          {/* Dot itself is styled via CSS, no inner content needed */}
        </button>
      ))}
    </nav>
  );
} 