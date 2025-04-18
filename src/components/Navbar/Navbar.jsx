import React, { useState } from 'react';
import styles from './Navbar.module.scss';
import logoImg from '../../assets/logo-transparent.png';

const Navbar = ({ activeSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = ['about', 'experience', 'projects', 'contact'];

  return (
    <nav
      className={styles.navbar}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className={styles.logo}>
        <a href="#home" aria-label="Home">
          <img src={logoImg} alt="Logo" />
        </a>
      </div>

      <ul className={`${styles.menuItems} ${menuOpen ? styles.menuOpen : ''}`}>
        {menuItems.map((item) => (
          <li key={item}>
            <a
              href={`#${item}`}
              className={activeSection === item ? styles.active : ''}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.foundedText}>
        FOUNDED IN 2001 (CAGUAS, PUERTO RICO)
      </div>

      <button
        className={`${styles.hamburger} ${
          menuOpen ? styles.hamburgerOpen : ''
        }`}
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
