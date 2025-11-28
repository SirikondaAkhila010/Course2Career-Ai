
import type { Job } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Innovate Inc.',
    location: 'San Francisco, CA (Remote)',
    description: 'Join our team to build next-generation web applications using React, TypeScript, and Tailwind CSS. You will be responsible for creating beautiful and performant user interfaces.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
    type: 'Full-time',
    companyLogo: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600',
    applyUrl: 'https://example.com/apply/1',
  },
  {
    id: 2,
    title: 'Full-Stack Developer (Node.js/React)',
    company: 'Tech Solutions LLC',
    location: 'New York, NY',
    description: `We are looking for a skilled full-stack developer to work on both our frontend and backend systems.
Key responsibilities include:
* Developing and maintaining server-side logic with Node.js and Express.
* Building responsive and user-friendly interfaces with React.
* Managing database schemas and queries in PostgreSQL.

Experience with **Node.js**, **Express**, **PostgreSQL**, and **React** is required.`,
    skills: ['Node.js', 'Express', 'PostgreSQL', 'React', 'RESTful APIs'],
    type: 'Full-time',
    companyLogo: 'https://tailwindui.com/img/logos/mark.svg?color=slate&shade=600',
    applyUrl: 'https://example.com/apply/2',
  },
  {
    id: 3,
    title: 'Data Scientist - AI/ML',
    company: 'DataDriven Co.',
    location: 'Austin, TX',
    description: 'Help us build intelligent systems. You will work on our job matching engine using Scikit-learn, TensorFlow, and advanced NLP techniques to connect candidates with opportunities.',
    skills: ['Python', 'TensorFlow', 'Scikit-learn', 'NLP', 'SQL'],
    type: 'Full-time',
    applyUrl: 'https://example.com/apply/3',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Seattle, WA',
    description: 'Manage and scale our cloud infrastructure on AWS. Experience with Docker, Kubernetes, and CI/CD pipelines is essential for this role.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    type: 'Full-time',
    applyUrl: 'https://example.com/apply/4',
  },
  {
    id: 5,
    title: 'UI/UX Designer',
    company: 'Creative Minds Studio',
    location: 'Boston, MA',
    description: 'Design intuitive and engaging user experiences for our web and mobile platforms. A strong portfolio showcasing your design process and final products is required.',
    skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
    type: 'Contract',
    applyUrl: 'https://example.com/apply/5',
  },
  {
    id: 6,
    title: 'Product Manager, AI Features',
    company: 'Innovate Inc.',
    location: 'San Francisco, CA',
    description: 'Lead the product vision and strategy for our AI-powered features, including resume parsing, job recommendations, and our career chatbot.',
    skills: ['Product Management', 'Agile', 'AI/ML', 'Roadmap Planning'],
    type: 'Full-time',
    companyLogo: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600',
    applyUrl: 'https://example.com/apply/6',
  },
  {
    id: 7,
    title: 'Junior React Developer',
    company: 'Tech Solutions LLC',
    location: 'New York, NY (Hybrid)',
    description: 'An exciting opportunity for a junior developer to grow their skills. You will work alongside senior engineers on our main React application.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    type: 'Internship',
    companyLogo: 'https://tailwindui.com/img/logos/mark.svg?color=slate&shade=600',
    applyUrl: 'https://example.com/apply/7',
  }
];