import React from 'react';
import { motion } from 'framer-motion';
import styles from './Projects.module.scss';

// Sample project data (replace with your actual projects)
const projectsData = [
  {
    id: 1,
    title: 'Project One',
    description: 'A brief description of the first project, highlighting key technologies or features.',
    imageUrl: '', // Optional: Add image paths later
  },
  {
    id: 2,
    title: 'Project Two',
    description: 'Description for the second project. Mention the problem it solves or its main purpose.',
    imageUrl: '',
  },
  {
    id: 3,
    title: 'Project Three',
    description: 'Details about the third project. Maybe focus on the tech stack used.',
    imageUrl: '',
  },
  // Add more projects as needed
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2, // Stagger animation
      duration: 0.5,
    },
  }),
};

const Projects = () => {
  return (
    <section className={styles.projectsSection}>
      <h2>My Projects</h2>
      <motion.div
        className={styles.projectsGrid}
        initial="hidden"
        whileInView="visible" // Animate when the grid enters the viewport
        viewport={{ once: true, amount: 0.2 }} // Trigger animation once, when 20% is visible
      >
        {projectsData.map((project, index) => (
          <motion.div
            key={project.id}
            className={styles.projectCard}
            variants={cardVariants}
            custom={index} // Pass index for stagger calculation
            initial="hidden"
            animate="visible" // Use animate prop directly if not using whileInView on the parent
          >
            <div className={styles.projectImagePlaceholder}></div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            {/* Add link/buttons later */}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Projects; 