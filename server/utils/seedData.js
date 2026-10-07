const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Allocation = require('../models/Allocation');
const Notification = require('../models/Notification');
const { calculateMatchScore } = require('../services/matchingEngine');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internship_allocation_db');
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await FacultyProfile.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
    await Allocation.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // 1. Create Admin (@cumail.in)
    const admin = await User.create({
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@cumail.in',
      password: 'password123',
      role: 'admin',
    });

    // 2. Create Faculty Members (@cumail.in)
    const faculty1 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'alan.turing@cumail.in',
      password: 'password123',
      role: 'faculty',
    });
    await FacultyProfile.create({
      user: faculty1._id,
      department: 'Computer Science',
      designation: 'Chair & Distinguished Professor',
    });

    const faculty2 = await User.create({
      name: 'Prof. Ada Lovelace',
      email: 'ada.lovelace@cumail.in',
      password: 'password123',
      role: 'faculty',
    });
    await FacultyProfile.create({
      user: faculty2._id,
      department: 'Information Technology',
      designation: 'Associate Professor',
    });

    // 3. Create Students (@cuchd.in)
    const student1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@cuchd.in',
      password: 'password123',
      role: 'student',
    });
    const student1Profile = await StudentProfile.create({
      user: student1._id,
      department: 'Computer Science',
      year: 3,
      skills: ['Python', 'PyTorch', 'Machine Learning', 'TensorFlow', 'Data Structures', 'Git'],
      resumeParsedSkills: ['Python', 'Machine Learning', 'Data Science', 'Docker', 'Linux'],
      preferences: ['AI Research', 'Machine Learning', 'Computer Vision'],
    });

    const student2 = await User.create({
      name: 'Emily Chen',
      email: 'emily.chen@cuchd.in',
      password: 'password123',
      role: 'student',
    });
    await StudentProfile.create({
      user: student2._id,
      department: 'Computer Science',
      year: 4,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      resumeParsedSkills: ['React', 'Node.js', 'REST API', 'Git', 'CSS3'],
      preferences: ['Full Stack Development', 'Cloud Architecture', 'Web Engineering'],
    });

    const student3 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.vance@cuchd.in',
      password: 'password123',
      role: 'student',
    });
    await StudentProfile.create({
      user: student3._id,
      department: 'Cybersecurity',
      year: 2,
      skills: ['Python', 'Linux', 'Cybersecurity', 'Ethical Hacking', 'Cryptography', 'Wireshark'],
      resumeParsedSkills: ['Cybersecurity', 'Linux', 'System Design'],
      preferences: ['Network Security', 'Penetration Testing'],
    });

    // 4. Create Opportunities
    const opp1 = await Opportunity.create({
      title: 'Deep Learning for Medical Image Classification',
      type: 'internship',
      description: 'Research internship focusing on training Vision Transformers (ViT) on histopathology MRI scans using PyTorch and CUDA accelerators.',
      requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Computer Vision'],
      capacity: 2,
      department: 'Computer Science',
      postedBy: faculty1._id,
      status: 'open',
    });

    const opp2 = await Opportunity.create({
      title: 'Full Stack Microservices Portal for Campus Life',
      type: 'project',
      description: 'Building a responsive MERN portal with real-time notifications, Docker containerization, and RESTful API integrations.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
      capacity: 3,
      department: 'Information Technology',
      postedBy: faculty2._id,
      status: 'open',
    });

    const opp3 = await Opportunity.create({
      title: 'Automated Threat Intelligence & Log Analysis Framework',
      type: 'project',
      description: 'Engineering an intrusion detection system that uses anomaly detection algorithms on server access logs.',
      requiredSkills: ['Python', 'Cybersecurity', 'Linux', 'Machine Learning'],
      capacity: 2,
      department: 'Computer Science',
      postedBy: faculty1._id,
      status: 'open',
    });

    const opp4 = await Opportunity.create({
      title: 'Distributed Cloud Storage Optimization Engine',
      type: 'internship',
      description: 'High-performance storage deduplication algorithms deployed across AWS and Kubernetes clusters.',
      requiredSkills: ['Go', 'Docker', 'Kubernetes', 'AWS', 'System Design'],
      capacity: 1,
      department: 'Computer Science',
      postedBy: faculty2._id,
      status: 'open',
    });

    // 5. Create Applications & Allocations
    const score1 = calculateMatchScore(student1Profile, opp1).score;
    const app1 = await Application.create({
      student: student1._id,
      opportunity: opp1._id,
      status: 'allocated',
      matchScore: score1,
    });

    await Allocation.create({
      application: app1._id,
      student: student1._id,
      opportunity: opp1._id,
      allocatedAt: new Date(),
      hoursCompleted: 35,
    });

    const score2 = calculateMatchScore(student1Profile, opp3).score;
    await Application.create({
      student: student1._id,
      opportunity: opp3._id,
      status: 'under_review',
      matchScore: score2,
    });

    // Notifications
    await Notification.create({
      user: student1._id,
      message: 'Congratulations! You have been allocated to "Deep Learning for Medical Image Classification".',
      type: 'status_update',
    });

    await Notification.create({
      user: faculty1._id,
      message: 'John Doe has submitted an application for "Automated Threat Intelligence & Log Analysis Framework".',
      type: 'new_application',
    });

    console.log('[Seed] Demo data seeded successfully with institutional domains!');
    console.log('--- Demo Accounts ---');
    console.log('Student:  john.doe@cuchd.in         / password123');
    console.log('Faculty:  alan.turing@cumail.in     / password123');
    console.log('Admin:    admin@cumail.in           / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seed();
