export const mockColleges = [
  {
    id: '1',
    name: 'Stanford University (Mock)',
    minPercentage: 95,
    location: 'Stanford',
    state: 'California',
    country: 'USA',
    images: [
      'https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=600&auto=format&fit=crop', // Main
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop', // Lab
      'https://images.unsplash.com/photo-1588693959600-47b7468161f3?q=80&w=600&auto=format&fit=crop', // Playground
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop', // Campus
      'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop', // Library
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop', // Classroom
      'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=600&auto=format&fit=crop'  // Hostel
    ],
    departments: [
      { name: 'Computer Science', startTime: '08:00 AM', endTime: '04:00 PM' },
      { name: 'Mechanical Engineering', startTime: '09:00 AM', endTime: '05:00 PM' },
    ],
    hostel: {
      available: true,
      ac: true,
      nonAc: false,
      fan: true,
      sharing: ['Single', 'Double'],
    },
    transport: {
      provided: true,
      ac: true,
      nonAc: true,
    },
    course: 'B.Tech',
    availableCourses: ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Tech Electronics', 'M.Tech AI'],
    placementsPerYear: 1200,
    topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'],
    fees: '$50,000 / year',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Tech Institute of Science',
    minPercentage: 80,
    location: 'New York City',
    state: 'New York',
    country: 'USA',
    images: [
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop', // Main
      'https://images.unsplash.com/photo-1574607421884-ff64eb4b3eec?q=80&w=600&auto=format&fit=crop', // Lab
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=600&auto=format&fit=crop', // Playground
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop', // Campus
      'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=600&auto=format&fit=crop', // Library
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop', // Classroom
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=600&auto=format&fit=crop'  // Events
    ],
    departments: [
      { name: 'Information Technology', startTime: '08:30 AM', endTime: '03:30 PM' },
      { name: 'Electronics', startTime: '08:30 AM', endTime: '04:30 PM' },
    ],
    hostel: {
      available: true,
      ac: false,
      nonAc: true,
      fan: true,
      sharing: ['Double', 'Four'],
    },
    transport: {
      provided: false,
      ac: false,
      nonAc: false,
    },
    course: 'B.E.',
    availableCourses: ['B.E. Information Technology', 'B.E. Electronics', 'B.E. Civil', 'M.E. Data Science'],
    placementsPerYear: 850,
    topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'IBM'],
    fees: '$20,000 / year',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Global Engineering College',
    minPercentage: 60,
    location: 'Austin',
    state: 'Texas',
    country: 'USA',
    images: [
      'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop', // Main
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop', // Lab
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop', // Playground
      'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=600&auto=format&fit=crop', // Campus
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=600&auto=format&fit=crop', // Library
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop', // Classroom
      'https://images.unsplash.com/photo-1519452310086-6ab28120d0f4?q=80&w=600&auto=format&fit=crop'  // Cafe
    ],
    departments: [
      { name: 'All Departments', startTime: '09:00 AM', endTime: '04:00 PM' },
    ],
    hostel: {
      available: false,
      ac: false,
      nonAc: false,
      fan: false,
      sharing: [],
    },
    transport: {
      provided: true,
      ac: false,
      nonAc: true,
    },
    course: 'B.Tech',
    availableCourses: ['B.Tech Civil', 'B.Tech Chemical', 'B.Tech Biotechnology'],
    placementsPerYear: 400,
    topRecruiters: ['L&T', 'Tata Motors', 'Reliance', 'Mahindra'],
    fees: '$10,000 / year',
    rating: 4.0,
  },
  {
    id: '4',
    name: 'Future Innovators University',
    minPercentage: 70,
    location: 'Seattle',
    state: 'Washington',
    country: 'USA',
    images: [
      'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=600&auto=format&fit=crop', // Main
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop', // Lab
      'https://images.unsplash.com/photo-1588693959600-47b7468161f3?q=80&w=600&auto=format&fit=crop', // Playground
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop', // Campus
      'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop', // Library
      'https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=600&auto=format&fit=crop', // Classroom
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop'  // Events
    ],
    departments: [
      { name: 'Data Science', startTime: '10:00 AM', endTime: '05:00 PM' },
      { name: 'AI & Robotics', startTime: '09:30 AM', endTime: '04:30 PM' },
    ],
    hostel: {
      available: true,
      ac: true,
      nonAc: true,
      fan: true,
      sharing: ['Single', 'Double', 'Four'],
    },
    transport: {
      provided: true,
      ac: true,
      nonAc: false,
    },
    course: 'B.Sc.',
    availableCourses: ['B.Sc. Data Science', 'B.Sc. Artificial Intelligence', 'B.Sc. Cybersecurity', 'M.Sc. Robotics'],
    placementsPerYear: 950,
    topRecruiters: ['Tesla', 'Nvidia', 'OpenAI', 'SpaceX', 'Intel'],
    fees: '$15,000 / year',
    rating: 4.7,
  }
];
