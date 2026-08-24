import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
const pdfsDir = path.join(uploadsDir, 'books');
const coversDir = path.join(uploadsDir, 'covers');

[uploadsDir, pdfsDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') cb(null, pdfsDir);
    else if (file.fieldname === 'coverImage') cb(null, coversDir);
    else cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      if (isPdf) return cb(null, true);
      return cb(new Error('Security check: Only PDF files (.pdf) are allowed for book uploads.'));
    } else if (file.fieldname === 'coverImage') {
      const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.mimetype.startsWith('image/') && allowedImageExts.includes(ext)) {
        return cb(null, true);
      }
      return cb(new Error('Security check: Only image files (JPG, PNG, WEBP) are allowed for covers.'));
    }
    cb(null, true);
  }
});

const DATA_FILE = path.join(__dirname, 'data_store.json');

const expandedBooks = [
  // --- B.TECH CS ---
  {
    id: 'bk_cs_1',
    title: 'Data Structures and Algorithms in Python',
    author: 'Michael T. Goodrich & Roberto Tamassia',
    program: 'B.Tech CS',
    category: 'Computer Science',
    coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-1118290279',
    rating: 4.8,
    pages: 748,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Comprehensive breakdown of Stacks, Queues, Trees, Graphs, and Hash Tables.',
        'Object-oriented design patterns applied in modern Python 3 syntax.',
        'Asymptotic analysis (Big-O notation) with practical real-world benchmarks.'
      ],
      keyTakeaways: [
        'Master algorithmic efficiency and memory optimization strategies.',
        'Implement core graph algorithms like Dijkstra and A* search.',
        'Prepare for technical coding interviews at top tech firms.'
      ],
      estimatedReadingTime: '14 Hours',
      difficultyLevel: 'Intermediate to Advanced'
    },
    description: 'An essential textbook for B.Tech CS students covering foundational data structures, algorithmic complexity, and efficient coding techniques in Python.'
  },
  {
    id: 'bk_cs_2',
    title: 'Artificial Intelligence & Deep Learning Architecture',
    author: 'Ian Goodfellow & Yoshua Bengio',
    program: 'B.Tech CS',
    category: 'Artificial Intelligence',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0262035613',
    rating: 4.9,
    pages: 800,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Mathematical foundations of Neural Networks, Backpropagation, and Loss Functions.',
        'Convolutional Networks (CNNs) for Computer Vision and Transformers for LLMs.',
        'Hands-on PyTorch and TensorFlow implementation guides for lab assignments.'
      ],
      keyTakeaways: [
        'Design deep neural network models from scratch.',
        'Train and fine-tune large language models and vision transformers.',
        'Deploy production-ready AI models to cloud endpoints.'
      ],
      estimatedReadingTime: '16 Hours',
      difficultyLevel: 'Advanced'
    },
    description: 'The definitive textbook for B.Tech CS students specializing in Artificial Intelligence, Machine Learning, and Neural Network architectures.'
  },
  {
    id: 'bk_cs_3',
    title: 'Operating System Concepts & Distributed Computing',
    author: 'Abraham Silberschatz & Peter B. Galvin',
    program: 'B.Tech CS',
    category: 'Systems Engineering',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-1119456339',
    rating: 4.7,
    pages: 976,
    publishedYear: 2024,
    quickSummary: {
      highlights: [
        'Process management, multi-threading, CPU scheduling, and deadlock avoidance.',
        'Virtual memory management, page replacement algorithms, and file systems.',
        'Distributed systems concurrency, RPC protocols, and cloud virtualization.'
      ],
      keyTakeaways: [
        'Understand low-level kernel architecture and memory management.',
        'Solve concurrency synchronization problems using semaphores & mutexes.',
        'Master cloud virtual machine containerization principles.'
      ],
      estimatedReadingTime: '15 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'Fundamental reference book for B.Tech CS scholars covering modern operating system design, kernel architecture, and distributed computing.'
  },
  {
    id: 'bk_cs_4',
    title: 'Database System Concepts & High-Performance SQL',
    author: 'Henry F. Korth & S. Sudarshan',
    program: 'B.Tech CS',
    category: 'Data Engineering',
    coverUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0078022159',
    rating: 4.8,
    pages: 1376,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Relational data model, ER diagrams, Normalization (BCNF, 3NF), and SQL queries.',
        'ACID transaction processing, B-Tree indexing, and query optimization.',
        'Distributed databases, NoSQL stores (MongoDB), and Big Data pipelines.'
      ],
      keyTakeaways: [
        'Architect normalized enterprise database schemas.',
        'Write high-performance SQL queries with optimized index strategies.',
        'Manage concurrent database transactions without data corruption.'
      ],
      estimatedReadingTime: '18 Hours',
      difficultyLevel: 'Intermediate to Advanced'
    },
    description: 'Comprehensive data engineering textbook covering SQL relational systems, indexing performance tuning, and modern NoSQL architectures.'
  },

  // --- MBA ---
  {
    id: 'bk_mba_1',
    title: 'Corporate Finance: Strategy and Principles',
    author: 'Stephen A. Ross & Randolph W. Westerfield',
    program: 'MBA',
    category: 'Finance',
    coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-1259918940',
    rating: 4.9,
    pages: 620,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Capital budgeting, Net Present Value (NPV), and Internal Rate of Return (IRR).',
        'Risk management, portfolio theory, and Capital Asset Pricing Model (CAPM).',
        'Mergers & acquisitions valuation techniques used by investment bankers.'
      ],
      keyTakeaways: [
        'Evaluate corporate investment opportunities using quantitative financial models.',
        'Optimize capital structure decisions to minimize weighted average cost of capital (WACC).',
        'Master cash flow forecasting and valuation techniques.'
      ],
      estimatedReadingTime: '12 Hours',
      difficultyLevel: 'Advanced'
    },
    description: 'Core textbook for Sunstone MBA students. Provides deep insight into managerial finance, capital structure, and strategic corporate decision making.'
  },
  {
    id: 'bk_mba_2',
    title: 'Strategic Marketing Management & Consumer Analytics',
    author: 'Philip Kotler & Kevin Lane Keller',
    program: 'MBA',
    category: 'Marketing Strategy',
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0133856460',
    rating: 4.8,
    pages: 720,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Strategic brand positioning, Customer Relationship Management (CRM), and growth channels.',
        'Consumer behavior psychology, market segmentation, and digital campaign metrics.',
        'Omnichannel retail strategy and price elasticity modeling.'
      ],
      keyTakeaways: [
        'Build end-to-end strategic marketing plans for product launches.',
        'Analyze customer acquisition cost (CAC) and customer lifetime value (LTV).',
        'Lead global brand positioning campaigns.'
      ],
      estimatedReadingTime: '11 Hours',
      difficultyLevel: 'Intermediate to Advanced'
    },
    description: 'Essential reading for Sunstone MBA scholars specializing in Marketing, Product Growth, and Digital Consumer Analytics.'
  },
  {
    id: 'bk_mba_3',
    title: 'Business Analytics & Predictive Modeling',
    author: 'James R. Evans',
    program: 'MBA',
    category: 'Business Analytics',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0135231678',
    rating: 4.7,
    pages: 650,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Descriptive, predictive, and prescriptive analytics for executive leaders.',
        'Regression analysis, time series sales forecasting, and Monte Carlo simulations.',
        'Data visualization storytelling with Tableau and Power BI.'
      ],
      keyTakeaways: [
        'Transform raw enterprise data into strategic executive dashboards.',
        'Build predictive revenue and demand forecasting models.',
        'Apply data-driven decision frameworks to complex business problems.'
      ],
      estimatedReadingTime: '10 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'Hands-on guide for MBA students combining statistical modeling, business intelligence tools, and predictive decision frameworks.'
  },

  // --- BCA ---
  {
    id: 'bk_bca_1',
    title: 'Full Stack Web Development with React & Node',
    author: 'Robin Wieruch',
    program: 'BCA',
    category: 'Web Engineering',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-1789341230',
    rating: 4.7,
    pages: 450,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Building RESTful APIs with Node.js, Express, and MongoDB/SQL.',
        'Modern React hooks, state management, and component architecture.',
        'Deployment pipelines with Docker, Vercel, and Cloud infrastructure.'
      ],
      keyTakeaways: [
        'Develop end-to-end scalable web applications from design to production.',
        'Master modern JavaScript ES6+ features and async programming patterns.',
        'Implement secure user authentication (JWT/OAuth) and data persistence.'
      ],
      estimatedReadingTime: '9 Hours',
      difficultyLevel: 'Beginner to Intermediate'
    },
    description: 'Practical guide tailored for BCA students to master modern client-side and server-side web engineering.'
  },
  {
    id: 'bk_bca_2',
    title: 'Java Programming & Enterprise Application Development',
    author: 'Herbert Schildt',
    program: 'BCA',
    category: 'Software Development',
    coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-1260440232',
    rating: 4.8,
    pages: 1248,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Object-Oriented Programming (OOP) principles: Inheritance, Encapsulation, Polymorphism.',
        'Java Collections Framework, Stream API, and Concurrency Multithreading.',
        'Spring Boot microservices, JPA/Hibernate, and enterprise REST APIs.'
      ],
      keyTakeaways: [
        'Write robust multi-threaded Java applications.',
        'Build enterprise backends with Spring Boot and relational databases.',
        'Apply design patterns like Singleton, Factory, and MVC.'
      ],
      estimatedReadingTime: '14 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'Standard Java reference manual for BCA students covering core syntax, OOP paradigms, and Spring Boot enterprise development.'
  },
  {
    id: 'bk_bca_3',
    title: 'Computer Networks & Cybersecurity Protocols',
    author: 'Andrew S. Tanenbaum & David J. Wetherall',
    program: 'BCA',
    category: 'Networking & Security',
    coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0132126953',
    rating: 4.7,
    pages: 960,
    publishedYear: 2024,
    quickSummary: {
      highlights: [
        'OSI 7-Layer model, TCP/IP stack, IP routing protocols, and DNS infrastructure.',
        'Wireless network protocols (Wi-Fi 6, 5G), network security, and TLS encryption.',
        'Ethical hacking fundamentals, firewalls, and network intrusion detection systems (IDS).'
      ],
      keyTakeaways: [
        'Analyze network packet captures using Wireshark.',
        'Configure secure network topologies and subnet masks.',
        'Understand modern cryptographic protocols (RSA, AES, SSL/TLS).'
      ],
      estimatedReadingTime: '12 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'Comprehensive networking guide covering physical layer transmission, TCP/IP protocols, and cybersecurity defense mechanics.'
  },

  // --- BBA ---
  {
    id: 'bk_bba_1',
    title: 'Principles of Modern Marketing & Consumer Analytics',
    author: 'Philip Kotler & Gary Armstrong',
    program: 'BBA',
    category: 'Marketing',
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0134492452',
    rating: 4.6,
    pages: 580,
    publishedYear: 2024,
    quickSummary: {
      highlights: [
        'The 4 Ps of marketing integrated with digital social strategy.',
        'Consumer buyer behavior analysis and target market segmentation.',
        'Brand positioning, equity management, and omnichannel campaigns.'
      ],
      keyTakeaways: [
        'Craft data-backed marketing strategies for product launches.',
        'Understand customer lifetime value (CLV) and churn analytics.',
        'Leverage modern digital platforms for customer acquisition.'
      ],
      estimatedReadingTime: '10 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'The standard reference book for BBA students introducing essential marketing fundamentals and contemporary digital strategy.'
  },
  {
    id: 'bk_bba_2',
    title: 'Financial Accounting & Business Economics',
    author: 'Robert N. Anthony & David F. Hawkins',
    program: 'BBA',
    category: 'Accounting & Economics',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-0073379609',
    rating: 4.7,
    pages: 720,
    publishedYear: 2025,
    quickSummary: {
      highlights: [
        'Balance sheets, income statements, and cash flow analysis.',
        'Microeconomics supply/demand principles and market structure dynamics.',
        'Managerial cost accounting and break-even financial analysis.'
      ],
      keyTakeaways: [
        'Read and interpret corporate financial statements.',
        'Analyze cost behavior to determine optimal product pricing.',
        'Understand macroeconomic indicators affecting business growth.'
      ],
      estimatedReadingTime: '11 Hours',
      difficultyLevel: 'Intermediate'
    },
    description: 'Foundational accounting and business economics textbook tailored for Sunstone BBA undergraduate scholars.'
  },
  {
    id: 'bk_bba_3',
    title: 'Entrepreneurship & Indian Startup Ecosystem',
    author: 'Dr. V. K. Sharma & Sunstone Innovation Board',
    program: 'BBA',
    category: 'Entrepreneurship',
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-9352864120',
    rating: 4.9,
    pages: 420,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Business model canvas design, lean startup methodology, and MVP testing.',
        'Venture capital fundraising, pitch deck creation, and valuation formulas.',
        'Case studies of successful unicorns in the Indian startup ecosystem.'
      ],
      keyTakeaways: [
        'Formulate viable business plans from initial product ideation.',
        'Pitch venture ideas effectively to angel investors and lab mentors.',
        'Navigate legal entity registration and compliance in India.'
      ],
      estimatedReadingTime: '8 Hours',
      difficultyLevel: 'Practical / Applied'
    },
    description: 'Inspiring handbook for BBA students introducing startup incubation, pitch deck design, and Indian venture financing.'
  },

  // --- SPECIAL COLLECTIONS ---
  {
    id: 'bk_spec_1',
    title: 'Prayas Lab Special Edition: Artificial Intelligence in Industry 5.0',
    author: 'Dr. R. K. Sunstone & Prayas Research Group',
    program: 'Special Collections',
    category: 'AI & Future Tech',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: 'PRAYAS-SPEC-2026-01',
    rating: 5.0,
    pages: 310,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Exclusive Prayas Lab case studies on Generative AI in Indian Tech Startups.',
        'Human-AI collaborative frameworks and ethical AI deployment.',
        'Hands-on lab experiments with Neural Networks and LLM Agentic workflows.'
      ],
      keyTakeaways: [
        'Explore cutting-edge innovation frameworks developed at Prayas Lab.',
        'Gain practical skills in building domain-adapted AI agents.',
        'Understand regulatory, ethical, and governance standards in AI.'
      ],
      estimatedReadingTime: '7 Hours',
      difficultyLevel: 'Advanced'
    },
    description: 'Exclusive research collection published by Prayas Lab detailing real-world industry AI integrations, automation blueprints, and student projects.'
  },
  {
    id: 'bk_spec_2',
    title: 'Prayas Innovation Lab: FinTech & AgriTech Industry Case Studies',
    author: 'Sunstone Industry Mentorship Cell',
    program: 'Special Collections',
    category: 'Industry Case Studies',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: 'PRAYAS-CASE-2026-02',
    rating: 4.9,
    pages: 280,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Real business problem statements solved by Sunstone Prayas Lab scholars.',
        'UPI payments scaling, micro-lending algorithms, and Agri-supply chains.',
        'Empirical field data and execution methodologies.'
      ],
      keyTakeaways: [
        'Analyze multi-dimensional business challenges with real company data.',
        'Formulate practical Go-To-Market and technological solution blueprints.',
        'Prepare for high-impact campus placement interviews.'
      ],
      estimatedReadingTime: '6 Hours',
      difficultyLevel: 'Practical / Case Study'
    },
    description: 'Curated collection of live industry case studies solved by Sunstone students during Prayas Lab hackathons and corporate residencies.'
  },
  {
    id: 'bk_spec_3',
    title: 'Startup & Entrepreneurship Playbook: From Idea to Scale',
    author: 'Sunstone Prayas Incubation Cell',
    program: 'Special Collections',
    category: 'Entrepreneurship',
    coverUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: '978-8194821034',
    rating: 4.9,
    pages: 260,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Lean startup validation, MVP design, and rapid market discovery.',
        'Fundraising term sheets, venture capital economics, and angel rounds.',
        'Go-to-market execution, viral loops, and sustainable unit economics.'
      ],
      keyTakeaways: [
        'Validate startup ideas with minimal capital and fast user feedback.',
        'Structure investor pitch decks and financial projections.',
        'Scale from seed stage to Series A with strong product-market fit.'
      ],
      estimatedReadingTime: '6 Hours',
      difficultyLevel: 'Practical / Industry'
    },
    description: 'Comprehensive practical playbook crafted by Prayas Lab startup mentors and founders for students building tech and venture-backed startups.'
  },

  // --- JOURNALS ---
  {
    id: 'bk_jrnl_1',
    title: 'Journal of Indian Management & Applied Computing (Vol. 14)',
    author: 'Sunstone Academic Review Board',
    program: 'Journals',
    category: 'Research Papers',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: 'ISSN-2455-8912',
    rating: 4.9,
    pages: 180,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'Peer-reviewed articles on FinTech growth in emerging economies.',
        'Empirical study on Agile software delivery models in Indian IT firms.',
        'Supply chain resilience strategies post-digital transformation.'
      ],
      keyTakeaways: [
        'Synthesize peer-reviewed research for thesis and project work.',
        'Learn quantitative and qualitative research methodologies.',
        'Discover current trends across technology management.'
      ],
      estimatedReadingTime: '4 Hours',
      difficultyLevel: 'Academic / Research'
    },
    description: 'Official academic research journal published bi-annually, showcasing high-impact research papers from faculty and postgraduate scholars.'
  },
  {
    id: 'bk_jrnl_2',
    title: 'International Review of Artificial Intelligence & Computer Engineering',
    author: 'Global Tech Research Consortium',
    program: 'Journals',
    category: 'Peer Review',
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
    fileType: 'url',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: true,
    isbn: 'ISSN-1943-2011',
    rating: 4.8,
    pages: 210,
    publishedYear: 2026,
    quickSummary: {
      highlights: [
        'High-impact papers on Autonomous Agents, Quantum Computing, and NLP.',
        'Benchmark analysis of state-of-the-art transformer architectures.',
        'Ethical implications of AI automation in modern labor markets.'
      ],
      keyTakeaways: [
        'Stay ahead of global breakthroughs in artificial intelligence research.',
        'Understand rigorous scientific evaluation metrics.',
        'Cite authoritative research papers in capstone projects.'
      ],
      estimatedReadingTime: '5 Hours',
      difficultyLevel: 'Academic / High Impact'
    },
    description: 'Peer-reviewed international research journal indexed for academic scholars, covering state-of-the-art developments in computer science and AI.'
  }
];

const defaultData = {
  users: [
    {
      id: 'usr_admin',
      name: 'Prayas Lab Admin',
      email: 'admin@sunstone.in',
      password: 'admin',
      role: 'admin',
      program: 'All Programs',
      status: 'Active',
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      id: 'usr_student1',
      name: 'Jatin',
      email: 'jatin@sunstone.in',
      password: 'pass',
      role: 'student',
      program: 'B.Tech CS',
      status: 'Active',
      createdAt: '2026-02-01T10:00:00.000Z'
    },
    {
      id: 'usr_student2',
      name: 'Ananya Verma',
      email: 'ananya@sunstone.in',
      password: 'pass',
      role: 'student',
      program: 'MBA',
      status: 'Active',
      createdAt: '2026-02-05T10:00:00.000Z'
    }
  ],
  books: expandedBooks,
  borrowRequests: [
    {
      id: 'req_101',
      studentId: 'usr_student1',
      studentName: 'Jatin',
      studentEmail: 'jatin@sunstone.in',
      studentProgram: 'B.Tech CS',
      bookId: 'bk_cs_1',
      bookTitle: 'Data Structures and Algorithms in Python',
      requestDate: '2026-08-18T14:30:00.000Z',
      borrowType: 'Physical Copy',
      studentMessage: 'Respected Admin, I need the physical copy of this textbook for 2 weeks to prepare for the Prayas Lab hackathon and end-term exam. Kindly approve.',
      status: 'Pending',
      adminNote: ''
    }
  ],
  userNotes: [],
  readingProgress: {}
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure we use expanded dataset if catalog is small
      if (!parsed.books || parsed.books.length < 10) {
        parsed.books = expandedBooks;
        saveData(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error reading data_store.json', e);
    }
  }
  saveData(defaultData);
  return defaultData;
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadData();

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db = loadData();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (user.status !== 'Active') return res.status(403).json({ error: 'Account suspended.' });
  res.json({ user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, program } = req.body;
  db = loadData();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    password,
    role: 'student',
    program: program || 'All Programs',
    status: 'Active',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveData(db);
  res.json({ user: newUser });
});

// --- Book Routes ---
app.get('/api/books', (req, res) => {
  db = loadData();
  res.json(db.books);
});

app.post('/api/books', upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
  db = loadData();
  const { title, author, program, category, fileType, pdfUrl, downloadable, isbn, pages, publishedYear, highlights, keyTakeaways, description } = req.body;
  
  let finalPdfUrl = pdfUrl;
  let finalCoverUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  if (fileType === 'file' && req.files && req.files.pdfFile && req.files.pdfFile[0]) {
    finalPdfUrl = '/uploads/books/' + req.files.pdfFile[0].filename;
  }

  if (req.files && req.files.coverImage && req.files.coverImage[0]) {
    finalCoverUrl = '/uploads/covers/' + req.files.coverImage[0].filename;
  } else if (req.body.coverUrl) {
    finalCoverUrl = req.body.coverUrl;
  }

  const parseSnippets = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
    // Text fallback: split by blank lines or 'Chapter' headers
    const blocks = input.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    return blocks.map((block, idx) => {
      const firstLine = block.split('\n')[0];
      const rest = block.split('\n').slice(1).join(' ').trim();
      return {
        chapterNumber: idx + 1,
        title: firstLine.startsWith('Chapter') ? firstLine : `Chapter ${idx + 1}: ${firstLine.slice(0, 40)}`,
        summary: rest || block
      };
    });
  };

  const newBook = {
    id: 'bk_' + Date.now(),
    title: title || 'Untitled Book',
    author: author || 'Unknown Author',
    program: program || 'All Programs',
    category: category || 'General Academic',
    coverUrl: finalCoverUrl,
    fileType: fileType || (finalPdfUrl?.startsWith('/uploads') ? 'file' : 'url'),
    pdfUrl: finalPdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    downloadable: downloadable === 'true' || downloadable === true,
    isbn: isbn || 'ISBN-' + Math.floor(100000000 + Math.random() * 900000000),
    rating: 4.8,
    pages: parseInt(pages) || 350,
    publishedYear: parseInt(publishedYear) || 2026,
    chapterSnippets: parseSnippets(req.body.chapterSnippets),
    quickSummary: {
      highlights: parseArray(highlights).length > 0 ? parseArray(highlights) : ['Comprehensive academic material mapped to Sunstone curriculum.'],
      keyTakeaways: parseArray(keyTakeaways).length > 0 ? parseArray(keyTakeaways) : ['Gain key theoretical and practical insights.'],
      estimatedReadingTime: '6 Hours',
      difficultyLevel: 'Standard Academic'
    },
    description: description || 'No summary provided.'
  };

  db.books.unshift(newBook);
  saveData(db);
  res.json({ message: 'Book uploaded successfully', book: newBook });
});

app.delete('/api/books/:id', (req, res) => {
  db = loadData();
  db.books = db.books.filter(b => b.id !== req.params.id);
  saveData(db);
  res.json({ message: 'Book deleted successfully' });
});

// --- Borrow Requests Routes ---
app.get('/api/borrow-requests', (req, res) => {
  db = loadData();
  res.json(db.borrowRequests);
});

app.post('/api/borrow-requests', (req, res) => {
  db = loadData();
  const { studentId, studentName, studentEmail, studentProgram, bookId, bookTitle, borrowType, studentMessage } = req.body;
  const newRequest = {
    id: 'req_' + Date.now(),
    studentId,
    studentName,
    studentEmail,
    studentProgram: studentProgram || 'General',
    bookId,
    bookTitle,
    requestDate: new Date().toISOString(),
    borrowType: borrowType || 'Physical Copy',
    studentMessage: studentMessage || 'I would like to borrow this book for study reference.',
    status: 'Pending',
    adminNote: ''
  };
  db.borrowRequests.unshift(newRequest);
  saveData(db);
  res.json({ message: 'Borrow request submitted', request: newRequest });
});

app.put('/api/borrow-requests/:id', (req, res) => {
  db = loadData();
  const { status, adminNote } = req.body;
  const reqItem = db.borrowRequests.find(r => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Request not found' });
  if (status) reqItem.status = status;
  if (adminNote !== undefined) reqItem.adminNote = adminNote;
  saveData(db);
  res.json({ message: 'Borrow request updated', request: reqItem });
});

// --- Students Roster ---
app.get('/api/students', (req, res) => {
  db = loadData();
  res.json(db.users.filter(u => u.role === 'student'));
});

app.put('/api/students/:id/status', (req, res) => {
  db = loadData();
  const { status } = req.body;
  const student = db.users.find(u => u.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  student.status = status;
  saveData(db);
  res.json({ message: 'Student status updated', student });
});

// --- Notes ---
app.get('/api/notes/:studentId', (req, res) => {
  db = loadData();
  res.json(db.userNotes.filter(n => n.studentId === req.params.studentId));
});

app.post('/api/notes', (req, res) => {
  db = loadData();
  const { studentId, bookId, bookTitle, pageNumber, noteText } = req.body;
  const newNote = {
    id: 'note_' + Date.now(),
    studentId,
    bookId,
    bookTitle,
    pageNumber: pageNumber || 1,
    noteText,
    createdAt: new Date().toISOString()
  };
  db.userNotes.unshift(newNote);
  saveData(db);
  res.json({ note: newNote });
});

app.delete('/api/notes/:id', (req, res) => {
  db = loadData();
  db.userNotes = db.userNotes.filter(n => n.id !== req.params.id);
  saveData(db);
  res.json({ message: 'Note deleted' });
});

app.listen(PORT, () => {
  console.log(`Sunstone Prayas Library Backend Server running on http://localhost:${PORT}`);
});
