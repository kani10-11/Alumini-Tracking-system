/**
 * CSE AlumniConnect - Persistent Database Engine & Seed Data
 * Database layer backed by localStorage with SQL-like CRUD helpers.
 */

const STORAGE_KEY = 'CSE_ALUMNICONNECT_DB_V1';
const SESSION_KEY = 'CSE_ALUMNICONNECT_SESSION_V1';

// Seed Initial Data
const initialDB = {
  batches: [
    { id: 'b-2020-2024', name: 'CSE 2020–2024', startYear: 2020, endYear: 2024, mentor: 'Dr. Rajesh Verma', description: 'Specialized in Distributed Systems and Cloud Computing.', activeCount: 85 },
    { id: 'b-2021-2025', name: 'CSE 2021–2025', startYear: 2021, endYear: 2025, mentor: 'Dr. Anita Desai', description: 'Focus on Data Science, ML & Software Engineering.', activeCount: 92 },
    { id: 'b-2022-2026', name: 'CSE 2022–2026', startYear: 2022, endYear: 2026, mentor: 'Prof. K. Murali', description: 'Cybersecurity, Full-stack Web Architecture.', activeCount: 96 },
    { id: 'b-2023-2027', name: 'CSE 2023–2027', startYear: 2023, endYear: 2027, mentor: 'Dr. Rajesh Verma', description: 'Artificial Intelligence, Algorithms & Microservices.', activeCount: 100 },
    { id: 'b-2024-2028', name: 'CSE 2024–2028', startYear: 2024, endYear: 2028, mentor: 'Dr. S. Ramesh', description: 'Next-Gen Computing, Mobile & Cloud Systems.', activeCount: 105 },
    { id: 'b-2025-2029', name: 'CSE 2025–2029', startYear: 2025, endYear: 2029, mentor: 'Prof. Lakshmi Priya', description: 'Robotics, IoT and Intelligent Automation.', activeCount: 98 },
    { id: 'b-2026-2030', name: 'CSE 2026–2030', startYear: 2026, endYear: 2030, mentor: 'Dr. Rajesh Verma', description: 'Quantum Information & Modern Software Architecture.', activeCount: 110 }
  ],

  users: [
    {
      id: 'u-1',
      fullName: 'Arun Kumar',
      username: 'arunkumar',
      email: 'arun.cse23@alumni.cse.edu',
      role: 'Student', // Student/Alumni, Teacher, Admin
      batchId: 'b-2023-2027',
      batchName: 'CSE 2023–2027',
      department: 'Computer Science & Engineering',
      graduationYear: '2027',
      company: 'XYZ Technologies',
      designation: 'Software Developer Intern',
      location: 'Chennai, India',
      bio: 'Passionate about Backend Systems, Java, Spring Boot, and Cloud Architectures.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'AWS', 'Docker', 'REST APIs'],
      higherStudies: 'B.Tech CSE (In Progress)',
      linkedin: 'https://linkedin.com/in/arunkumar-cse',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2025-08-10'
    },
    {
      id: 'u-2',
      fullName: 'Sneha Sharma',
      username: 'snehasharma',
      email: 'sneha.sharma@google.com',
      role: 'Alumni',
      batchId: 'b-2020-2024',
      batchName: 'CSE 2020–2024',
      department: 'Computer Science & Engineering',
      graduationYear: '2024',
      company: 'Google',
      designation: 'Senior Software Engineer',
      location: 'Bengaluru, India',
      bio: 'CSE 2020-2024 Alumna. Building scalable storage infrastructure at Google. Mentor for CSE juniors.',
      skills: ['C++', 'Distributed Systems', 'Go', 'Kubernetes', 'System Design'],
      higherStudies: 'M.S. in Computer Science - IISc',
      linkedin: 'https://linkedin.com/in/snehasharma-cse',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2024-06-15'
    },
    {
      id: 'u-3',
      fullName: 'Rahul Verma',
      username: 'rahulv',
      email: 'rahul.verma@aws.com',
      role: 'Alumni',
      batchId: 'b-2021-2025',
      batchName: 'CSE 2021–2025',
      department: 'Computer Science & Engineering',
      graduationYear: '2025',
      company: 'Amazon Web Services (AWS)',
      designation: 'Cloud Solutions Architect',
      location: 'Hyderabad, India',
      bio: 'Cloud enthusiast, AWS Certified Solutions Architect. CSE 2021-2025 Alumnus.',
      skills: ['AWS', 'Python', 'Terraform', 'Serverless', 'Networking', 'DevOps'],
      higherStudies: 'B.Tech CSE',
      linkedin: 'https://linkedin.com/in/rahulverma-cloud',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2025-05-20'
    },
    {
      id: 'u-4',
      fullName: 'Priya Sundaram',
      username: 'priyasun',
      email: 'priya.cse23@alumni.cse.edu',
      role: 'Student',
      batchId: 'b-2023-2027',
      batchName: 'CSE 2023–2027',
      department: 'Computer Science & Engineering',
      graduationYear: '2027',
      company: 'CSE Coding Club',
      designation: 'Lead Frontend Developer',
      location: 'Chennai, India',
      bio: 'UI/UX Enthusiast, React developer, Competitive programmer. Class representative CSE 2023-2027.',
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS3', 'Tailwind', 'Figma'],
      higherStudies: 'B.Tech CSE (In Progress)',
      linkedin: 'https://linkedin.com/in/priyasundaram-dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2025-08-12'
    },
    {
      id: 'u-5',
      fullName: 'Dr. Rajesh Verma',
      username: 'rajeshverma',
      email: 'rajesh.verma@cse.edu',
      role: 'Teacher',
      batchId: 'b-2023-2027',
      batchName: 'CSE 2023–2027',
      department: 'Computer Science & Engineering',
      graduationYear: '2008',
      company: 'Department of CSE',
      designation: 'Professor & Batch Mentor',
      location: 'Chennai, India',
      bio: 'Professor in Computer Science & Engineering. Research interests: AI, Machine Learning, Data Analytics.',
      skills: ['Artificial Intelligence', 'Algorithms', 'Research', 'Python', 'Data Structures'],
      higherStudies: 'Ph.D. in Computer Science - IIT Madras',
      linkedin: 'https://linkedin.com/in/dr-rajeshverma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2020-01-01'
    },
    {
      id: 'u-6',
      fullName: 'Dr. Meenakshi Sundaram',
      username: 'hod_cse',
      email: 'hod@cse.edu',
      role: 'Admin', // Management / Admin
      batchId: 'b-2020-2024',
      batchName: 'CSE Department Management',
      department: 'Computer Science & Engineering',
      graduationYear: '2002',
      company: 'CSE Department Management',
      designation: 'Head of Department (HOD)',
      location: 'Chennai, India',
      bio: 'Head of Department - Computer Science & Engineering. Overseeing academic excellence, alumni affairs, and placement drives.',
      skills: ['Academic Administration', 'Strategic Planning', 'Alumni Affairs', 'Curriculum Design'],
      higherStudies: 'Ph.D. in Computer Engineering',
      linkedin: 'https://linkedin.com/in/dr-m-sundaram',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2019-01-01'
    },
    {
      id: 'u-7',
      fullName: 'Vikramaditya Singh',
      username: 'vikram_ai',
      email: 'vikram@openai.com',
      role: 'Alumni',
      batchId: 'b-2022-2026',
      batchName: 'CSE 2022–2026',
      department: 'Computer Science & Engineering',
      graduationYear: '2026',
      company: 'OpenAI',
      designation: 'AI Research Scientist',
      location: 'San Francisco, USA / Remote',
      bio: 'CSE 2022-2026 Alumnus. Working on Large Language Models and Reinforcement Learning.',
      skills: ['PyTorch', 'Deep Learning', 'Transformers', 'Python', 'LLMs', 'C++'],
      higherStudies: 'M.S. Artificial Intelligence - Stanford University',
      linkedin: 'https://linkedin.com/in/vikramaditya-singh',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
      isApproved: true,
      createdAt: '2025-06-10'
    }
  ],

  career_history: [
    {
      id: 'ch-1',
      userId: 'u-1',
      company: 'ABC Technologies',
      designation: 'Software Trainee',
      startDate: '2024-06',
      endDate: '2025-05',
      location: 'Chennai, India',
      description: 'Worked on Java microservices and internal tooling APIs.'
    },
    {
      id: 'ch-2',
      userId: 'u-1',
      company: 'XYZ Technologies',
      designation: 'Software Developer Intern',
      startDate: '2025-06',
      endDate: 'Present',
      location: 'Chennai, India',
      description: 'Building RESTful APIs with Spring Boot and AWS integration.'
    },
    {
      id: 'ch-3',
      userId: 'u-2',
      company: 'TCS Innovation Labs',
      designation: 'Software Engineer Trainee',
      startDate: '2024-06',
      endDate: '2025-01',
      location: 'Bengaluru, India',
      description: 'Developing high-throughput backend services using Go.'
    },
    {
      id: 'ch-4',
      userId: 'u-2',
      company: 'Google',
      designation: 'Senior Software Engineer',
      startDate: '2025-02',
      endDate: 'Present',
      location: 'Bengaluru, India',
      description: 'Distributed storage infrastructure for Cloud Spanner.'
    }
  ],

  posts: [
    {
      id: 'p-101',
      authorId: 'u-2',
      authorName: 'Sneha Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      authorBatch: 'CSE 2020–2024',
      authorRole: 'Alumni',
      authorDesignation: 'Senior Software Engineer at Google',
      postType: 'Job Opportunity', // General, Job Opportunity, Achievement, Career Update, Workplace Update, Technical Post, College Update, Event Announcement
      batchId: 'b-2020-2024', // or null for all CSE
      isOfficial: false,
      content: `We are hiring Software Engineer Interns and Full-Time SDE-1s at Google Bengaluru! 🚀\n\nLooking for CSE graduates with strong algorithmic problem solving skills, C++/Java, and knowledge of Operating Systems & Networks. Apply through the link below or reach out to me directly!`,
      jobRefId: 'job-1',
      createdAt: '2026-09-28T10:30:00Z',
      reactions: { like: 24, celebrate: 18, support: 5, insightful: 12 },
      userReactions: { 'u-1': 'celebrate', 'u-4': 'like' },
      comments: [
        {
          id: 'c-1',
          authorId: 'u-1',
          authorName: 'Arun Kumar',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          text: 'Thank you Sneha ma\'am! I have submitted my resume through the link.',
          createdAt: '2026-09-28T11:05:00Z'
        },
        {
          id: 'c-2',
          authorId: 'u-4',
          authorName: 'Priya Sundaram',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          text: 'Is this opportunity open for 2027 graduating batch as well?',
          createdAt: '2026-09-28T12:15:00Z'
        }
      ]
    },
    {
      id: 'p-102',
      authorId: 'u-6',
      authorName: 'Dr. Meenakshi Sundaram',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      authorBatch: 'CSE Department Management',
      authorRole: 'Admin',
      authorDesignation: 'Head of Department (HOD)',
      postType: 'Event Announcement',
      batchId: null, // Global CSE announcement
      isOfficial: true,
      content: `📢 OFFICIAL ANNOUNCEMENT: Grand CSE Alumni Reunion & Industry Conclave 2026!\n\nThe Department of Computer Science & Engineering invites all alumni from batches 2020–2024, 2021–2025, 2022–2026, and current students of 2023–2027 to the Annual Alumni Meet on December 20, 2026 at the Main Auditorium.\n\nPlease register early through the Events section to secure your delegate pass!`,
      createdAt: '2026-09-29T09:00:00Z',
      reactions: { like: 45, celebrate: 32, support: 10, insightful: 15 },
      userReactions: { 'u-1': 'like', 'u-5': 'celebrate' },
      comments: [
        {
          id: 'c-3',
          authorId: 'u-3',
          authorName: 'Rahul Verma',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
          text: 'Looking forward to meeting all professors and batchmates!',
          createdAt: '2026-09-29T09:45:00Z'
        }
      ]
    },
    {
      id: 'p-103',
      authorId: 'u-1',
      authorName: 'Arun Kumar',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      authorBatch: 'CSE 2023–2027',
      authorRole: 'Student',
      authorDesignation: 'Software Developer Intern at XYZ Tech',
      postType: 'Achievement',
      batchId: 'b-2023-2027',
      isOfficial: false,
      content: `Extremely thrilled to share that our team won 1st Place in the National Smart Hackathon 2026 for building an AI-assisted Code Optimization engine! 🏆\n\nBig thanks to our Batch Mentor Dr. Rajesh Verma for guidance.`,
      createdAt: '2026-09-30T08:15:00Z',
      reactions: { like: 38, celebrate: 29, support: 8, insightful: 14 },
      userReactions: { 'u-5': 'celebrate' },
      comments: [
        {
          id: 'c-4',
          authorId: 'u-5',
          authorName: 'Dr. Rajesh Verma',
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
          text: 'Proud moment for CSE 2023-2027 batch! Keep up the brilliant work Arun and team.',
          createdAt: '2026-09-30T09:00:00Z'
        }
      ]
    }
  ],

  jobs: [
    {
      id: 'job-1',
      title: 'Software Developer Intern / SDE-1',
      company: 'Google',
      location: 'Bengaluru, India (Hybrid)',
      jobType: 'Full-time / Internship',
      experienceRequired: '0–2 years',
      skillsRequired: ['C++', 'Java', 'Data Structures', 'Operating Systems'],
      salary: '₹18 LPA - ₹28 LPA',
      description: 'Join Google Cloud infrastructure team. Design and implement high-concurrency microservices, write clean testable code, and collaborate with globally distributed engineers.',
      applicationLink: 'https://careers.google.com/jobs/results/cse-sde',
      lastDate: '2026-10-30',
      postedBy: 'Sneha Sharma (Alumni CSE 2020-2024)',
      postedByUserId: 'u-2',
      createdAt: '2026-09-28'
    },
    {
      id: 'job-2',
      title: 'Associate Cloud Engineer',
      company: 'Amazon Web Services (AWS)',
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      experienceRequired: '0–1 years',
      skillsRequired: ['AWS', 'Python', 'Terraform', 'Linux'],
      salary: '₹16 LPA - ₹22 LPA',
      description: 'Assist enterprise clients in architecting multi-region serverless applications on AWS Cloud.',
      applicationLink: 'https://amazon.jobs/en/jobs/aws-cse-cloud',
      lastDate: '2026-11-15',
      postedBy: 'Rahul Verma (Alumni CSE 2021-2025)',
      postedByUserId: 'u-3',
      createdAt: '2026-09-27'
    },
    {
      id: 'job-3',
      title: 'Frontend React Developer',
      company: 'XYZ Technologies',
      location: 'Chennai, India (Remote Available)',
      jobType: 'Full-time / Remote',
      experienceRequired: '1–3 years',
      skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
      salary: '₹10 LPA - ₹15 LPA',
      description: 'Building modern responsive dashboards for enterprise SaaS products.',
      applicationLink: 'https://xyztech.com/careers/frontend',
      lastDate: '2026-10-25',
      postedBy: 'Arun Kumar (Student CSE 2023-2027)',
      postedByUserId: 'u-1',
      createdAt: '2026-09-25'
    }
  ],

  achievements: [
    {
      id: 'ach-1',
      userId: 'u-1',
      userName: 'Arun Kumar',
      userBatch: 'CSE 2023–2027',
      title: 'Winner - National Smart Hackathon 2026',
      category: 'Award', // Award, Certification, Promotion, Research, Publication, Entrepreneurship, Competition, Higher Studies
      date: '2026-09-29',
      organization: 'Ministry of Education & Tech Council',
      description: 'Secured 1st Prize among 500+ teams nationwide for developing an automated real-time code auditor.',
      imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'ach-2',
      userId: 'u-2',
      userName: 'Sneha Sharma',
      userBatch: 'CSE 2020–2024',
      title: 'Google Spotlight Tech Innovation Award',
      category: 'Award',
      date: '2026-04-15',
      organization: 'Google Engineering',
      description: 'Recognized for pioneering zero-downtime database migration architecture in Google Cloud Spanner.'
    },
    {
      id: 'ach-3',
      userId: 'u-7',
      userName: 'Vikramaditya Singh',
      userBatch: 'CSE 2022–2026',
      title: 'Research Paper Published in NeurIPS 2026',
      category: 'Publication',
      date: '2026-08-20',
      organization: 'NeurIPS International Conference',
      description: 'Paper titled "Optimizing Large Language Model Inference with Low-Bit Quantization Trees".'
    }
  ],

  events: [
    {
      id: 'ev-1',
      title: 'CSE ALUMNI MEET & REUNION 2026',
      date: '2026-12-20',
      time: '10:00 AM - 05:00 PM',
      venue: 'Main College Auditorium & CSE Block Quadrangle',
      description: 'The annual flagship gathering of Computer Science & Engineering alumni, teachers, and current students. Keynote talks, networking lunch, batch photo session, and career mentoring panels.',
      organizer: 'CSE Department & Alumni Relations Cell',
      eligibleBatches: ['2020–2024', '2021–2025', '2022–2026', '2023–2027'],
      registrationDeadline: '2026-12-10',
      maxParticipants: 350,
      banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      registrations: [
        { userId: 'u-1', userName: 'Arun Kumar', batch: 'CSE 2023–2027', status: 'Registered', date: '2026-09-29' },
        { userId: 'u-2', userName: 'Sneha Sharma', batch: 'CSE 2020–2024', status: 'Registered', date: '2026-09-29' },
        { userId: 'u-3', userName: 'Rahul Verma', batch: 'CSE 2021–2025', status: 'Interested', date: '2026-09-30' }
      ]
    },
    {
      id: 'ev-2',
      title: 'Workshop: Modern Distributed Systems & Cloud Microservices',
      date: '2026-10-15',
      time: '02:00 PM - 05:00 PM',
      venue: 'CSE Seminar Hall 2 & Live Stream',
      description: 'Hands-on workshop led by alumnus Rahul Verma (AWS Solutions Architect) covering Docker, Kubernetes, and AWS Cloud Native stack.',
      organizer: 'Dr. Rajesh Verma (CSE Mentor)',
      eligibleBatches: ['2022–2026', '2023–2027', '2024–2028'],
      registrationDeadline: '2026-10-12',
      maxParticipants: 120,
      banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      registrations: [
        { userId: 'u-1', userName: 'Arun Kumar', batch: 'CSE 2023–2027', status: 'Registered', date: '2026-09-28' }
      ]
    }
  ],

  messages: [
    {
      id: 'm-1',
      senderId: 'u-2', // Sneha Sharma
      receiverId: 'u-1', // Arun Kumar
      text: 'Hi Arun! Saw your hackathon post. Congratulations! Drop your updated resume if you want a referral for Google internships.',
      createdAt: '2026-09-30T09:30:00Z',
      isRead: true
    },
    {
      id: 'm-2',
      senderId: 'u-1',
      receiverId: 'u-2',
      text: 'Thank you so much Sneha ma\'am! I have shared my updated PDF resume. Truly grateful for your support.',
      createdAt: '2026-09-30T09:35:00Z',
      isRead: true
    },
    {
      id: 'm-3',
      senderId: 'u-5', // Dr. Rajesh Verma
      receiverId: 'u-1',
      text: 'Arun, please submit the team project report for the algorithms course by Friday.',
      createdAt: '2026-09-30T10:15:00Z',
      isRead: false
    }
  ],

  notifications: [
    {
      id: 'n-1',
      userId: 'u-1',
      title: 'New Message',
      message: 'Dr. Rajesh Verma sent you a private message.',
      link: 'messages',
      isRead: false,
      createdAt: '2026-09-30T10:15:00Z'
    },
    {
      id: 'n-2',
      userId: 'u-1',
      title: 'New Job Opportunity',
      message: 'Sneha Sharma posted a new job: Software Developer Intern at Google.',
      link: 'jobs',
      isRead: true,
      createdAt: '2026-09-28T10:30:00Z'
    },
    {
      id: 'n-3',
      userId: 'u-1',
      title: 'Official Department Announcement',
      message: 'Dr. Meenakshi Sundaram posted: CSE Alumni Meet & Reunion 2026.',
      link: 'events',
      isRead: true,
      createdAt: '2026-09-29T09:00:00Z'
    }
  ],

  reports: []
};

class DBEngine {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
    }
  }

  getDB() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : initialDB;
    } catch (e) {
      console.error('Failed to parse DB, resetting to initial', e);
      return initialDB;
    }
  }

  saveDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save DB', e);
    }
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
    return initialDB;
  }

  // Session Helper
  getCurrentUser() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        // Sync with db in case user profile was updated
        const db = this.getDB();
        const found = db.users.find(u => u.id === parsed.id);
        return found || parsed;
      }
    } catch (e) {
      console.error('Session error', e);
    }
    // Default fallback to Student Arun Kumar for immediate interactive testing
    const db = this.getDB();
    const defaultUser = db.users[0];
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  // Generic Query Helpers
  getCollection(name) {
    const db = this.getDB();
    return db[name] || [];
  }

  getItem(collectionName, id) {
    const items = this.getCollection(collectionName);
    return items.find(item => item.id === id);
  }

  addItem(collectionName, item) {
    const db = this.getDB();
    if (!db[collectionName]) db[collectionName] = [];
    db[collectionName].unshift(item);
    this.saveDB(db);
    return item;
  }

  updateItem(collectionName, id, updates) {
    const db = this.getDB();
    if (!db[collectionName]) return null;
    const index = db[collectionName].findIndex(item => item.id === id);
    if (index !== -1) {
      db[collectionName][index] = { ...db[collectionName][index], ...updates };
      this.saveDB(db);
      return db[collectionName][index];
    }
    return null;
  }

  deleteItem(collectionName, id) {
    const db = this.getDB();
    if (!db[collectionName]) return false;
    db[collectionName] = db[collectionName].filter(item => item.id !== id);
    this.saveDB(db);
    return true;
  }
}

export const db = new DBEngine();
