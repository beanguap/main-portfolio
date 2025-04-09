import React, { useState } from "react";
import styles from "./Navbar.module.scss";
import logoImg from "../../assets/logo-transparent.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main Navigation">
      <div className={styles.logo}>
        <a href="#home" aria-label="Home">
          <img src={logoImg} alt="Logo" />
        </a>
      </div>

      <ul className={`${styles.menuItems} ${menuOpen ? styles.menuOpen : ""}`}>
        <li><a href="#about">About</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className={styles.foundedText}>
        FOUNDED IN 2001 (CAGUAS, PUERTO RICO)
      </div>

      <button 
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
      >
        <span className={styles.hamburgerBar}></span>
        <span className={styles.hamburgerBar}></span>
        <span className={styles.hamburgerBar}></span>
      </button>
    </nav>
  );
};

export default Navbar;
