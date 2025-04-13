import React from 'react';
import { motion } from 'framer-motion';
import styles from './ExperiencePanel.module.scss';

export default function ExperiencePanel() {
  return (
    <motion.div
      className={styles.experiencePanel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <h1>Experience</h1>
      <div className={styles.timeline}>
        <div className={styles.timelineItem}>
          <h3>Senior Software Engineer</h3>
          <p>Tech Innovations Inc.</p>
          <span>2023 - Present</span>
          <p>Leading development of cloud-native applications using React, Node.js, and AWS.</p>
        </div>
        <div className={styles.timelineItem}>
          <h3>Full Stack Developer</h3>
          <p>Digital Solutions Ltd</p>
          <span>2020 - 2023</span>
          <p>Developed and maintained enterprise-level web applications.</p>
        </div>
      </div>
    </motion.div>
  );
}