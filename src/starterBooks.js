import { catalogBooks } from './booksCatalog.js';

/** Real library books with Google Drive + local PDF paths */
export const initialBooks = catalogBooks;

export const initialBorrowRequests = [
  {
    id: 'req_demo_1',
    studentId: 'usr_student1',
    studentName: 'Jatin',
    studentEmail: 'jatin@sunstone.in',
    studentProgram: 'B.Tech CS',
    bookId: 'bk_devops_1',
    bookTitle: 'Automating DevOps with GitLab CI CD Pipelines',
    requestDate: new Date().toISOString(),
    status: 'Approved',
    adminNote: 'Approved for Prayas Lab study session.',
    borrowDuration: '14 Days',
    pickupLocation: 'Prayas Lab Library Desk'
  }
];

export const initialStudents = [
  {
    id: 'usr_student1',
    name: 'Jatin',
    email: 'jatin@sunstone.in',
    role: 'student',
    program: 'B.Tech CS',
    status: 'Active',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'usr_student2',
    name: 'Ananya Verma',
    email: 'ananya@sunstone.in',
    role: 'student',
    program: 'MBA',
    status: 'Active',
    createdAt: '2026-02-05T10:00:00.000Z'
  }
];
