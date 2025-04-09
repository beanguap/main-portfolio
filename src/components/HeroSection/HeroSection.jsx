import React from 'react';
// Import icons from react-icons
import { FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6'; 
import styles from './HeroSection.module.scss';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroName}>
        <span className={styles.firstName}>JERIEL</span>
        <span className={styles.middleName}>MARTINEZ</span>
        <span className={styles.lastName}>FLORES</span>
      </div>

      <div className={styles.socialLinks}>
        <a href="YOUR_X_URL" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)">
          <FaXTwitter />
        </a> 
        <a href="YOUR_GITHUB_URL" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <FaGithub />
        </a>
        <a href="YOUR_LINKEDIN_URL" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <FaLinkedin />
        </a>
      </div>

      {/* Added CTA Buttons Container */}
      <div className={styles.ctaButtonsLeft}>
        <button className={styles.sayHelloBtn}>SAY HELLO</button>
        <button className={styles.downloadCvBtn}>DOWNLOAD CV</button>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroImage}>
          <img 
            src="src/assets/NOBACKGROUNDJMFKEYBOARD .png" 
            alt="JMF Keyboard" 
            className={styles.keyboard}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
