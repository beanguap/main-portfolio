import { AnimatePresence, motion } from 'framer-motion';
import styles from './ExperiencePanel.module.scss';

// Add section transition variant - new for magnetic effect
const sectionVariants = {
  initial: { opacity: 0, y: -30 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      ease: [0.25, 0.1, 0.25, 1.0], // Smooth entrance
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.97,
    y: 20,
    transition: { 
      duration: 0.3,
      ease: [0.36, 0, 0.66, -0.56], // Elastic/magnetic-like exit
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const panelVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
      staggerChildren: 0.2, // Stagger children animations
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Data for the panel
const technologies = [
  'React',
  'Vue.js',
  'Next.js',
  'Node.js',
  'Express',
  'TypeScript',
  'JavaScript (ES6+)',
  'Python',
  'Three.js / R3F',
  'WebGL',
  'GSAP',
  'Framer Motion',
  'HTML5',
  'CSS3 / SCSS',
  'Tailwind CSS',
  'GraphQL',
  'REST APIs',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Git',
];

const applications = [
  {
    title: 'Syllabyte-Progress-SVG',
    description:
      'Custom React component using SVG animations for dynamic progress visualization, ideal for loading states or dashboards.',
  },
  {
    title: 'Loan Management System',
    description:
      'Full-stack web application facilitating loan processing, tracking, and reporting for financial institutions. Built with [Specify Tech, e.g., React, Node.js, PostgreSQL].',
  },
  {
    title: 'Airport Flight App',
    description:
      'Mobile-responsive application displaying real-time flight information, gate assignments, and delays. Integrated with flight data APIs. Built with [Specify Tech, e.g., Vue.js, Express].',
  },
];

export default function ExperiencePanel() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={styles.experiencePanel}
        variants={sectionVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <motion.h2 variants={itemVariants}>Technical Expertise</motion.h2>

        <motion.div className={styles.techGrid} variants={itemVariants}>
          {technologies.map((tech, index) => (
            <motion.span
              key={index}
              className={styles.techTag}
              variants={itemVariants}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        <motion.h2 variants={itemVariants} style={{ marginTop: '2rem' }}>
          Featured Applications
        </motion.h2>

        <div className={styles.applicationsList}>
          {applications.map((app, index) => (
            <motion.div
              key={index}
              className={styles.appCard}
              variants={itemVariants}
            >
              <h3>{app.title}</h3>
              <p>{app.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p className={styles.footerNote} variants={itemVariants}>
          For a more detailed overview, please refer to my full resume.
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
