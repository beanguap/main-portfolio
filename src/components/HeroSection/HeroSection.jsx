import React, { useState } from 'react';
// Import icons from react-icons
import { FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6'; 
import styles from './HeroSection.module.scss';

const HeroSection = () => {
  // Add state for potential info panel visibility
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleInfoButtonClick = () => {
    console.log('Info button clicked!');
    // Example: Toggle visibility state
    setIsInfoVisible(!isInfoVisible); 
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroName}>
        <span className={styles.firstName}>JERIEL</span>
        <span className={styles.middleName}>MARTINEZ</span>
        <span className={styles.lastName}>FLORES</span>
      </div>

      {/* Updated Image for top-right */}
      <img 
        src="/src/assets/image-from-rawpixel-id-6171907-png.png"
        alt="Abstract rawpixel graphic"
        className={styles.topRightImage} 
      />

      <div className={styles.socialLinks}>
        <a href="https://twitter.com/jmartinezflores" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)">
          <FaXTwitter />
        </a> 
        <a href="https://github.com/jerielmartinez" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <FaGithub />
        </a>
        <a href="https://linkedin.com/in/jerielmartinez" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <FaLinkedin />
        </a>
      </div>

      {/* Added CTA Buttons Container */}
      <div className={styles.ctaButtonsLeft}>
        <button className={styles.sayHelloBtn}>SAY HELLO</button>
        <button className={styles.downloadCvBtn}>DOWNLOAD CV</button>
      </div>

      {/* Updated to 46.png Image */}
      <img 
        src="/src/assets/46.png"
        alt="Decorative graphic"
        className={styles.decorativeImage46}
      />

      {/* Text under decorative image */}
      <div className={styles.footerTextBlock}>
        <p>Full Stack</p>
        <p>Solutions for a</p>
        <p>Digital World</p>
        <p className={styles.yearText}>2025</p>
      </div>

      {/* Added Info Button */}
      <button 
        className={styles.infoButton} 
        aria-label="More Information" 
        onClick={handleInfoButtonClick}
      >
        +
      </button>

      {/* Optional Info Panel that shows when isInfoVisible is true */}
      {isInfoVisible && (
        <div className={styles.infoPanel}>
          <p>Made with React, SCSS, and ❤️</p>
        </div>
      )}

      {/* Skills List Text Block */}
      <div className={styles.skillsList}>
        <span>FULL STACK</span>
        <span>DEVELOPER</span>
        <span>SOFTWARE</span>
        <span>ENGINEER</span>
        <span>ANIMATION</span>
        <span>UI</span>
        <span>UX</span>
        <span>AI</span>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroImage}>
          <img 
            src="/src/assets/NOBACKGROUNDJMFKEYBOARD .png" 
            alt="JMF Keyboard" 
            className={styles.keyboard}
          />
          {/* Text near keyboard */}
          <div className={styles.keyboardInfoText}>
            <p>From Concept to Code – I Make It Happen /</p>
            <p>Design, Develop, Deploy – The Future Is Built Here</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
