
export type Department = 'Engineering' | 'Design' | 'Marketing' | 'HR' | 'Finance';

export type Status = 'Active' | 'Inactive' | 'Terminated';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: Department;
  status: Status;
  avatar: string;
  checkInTime?: string;
  location?: string;
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  role: string;
  date: string;
  status: 'Present' | 'Absent' | 'On Leave';
  checkIn: string;
  checkOut: string;
  workHours: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
  score: number;
  avatar: string;
  appliedDate: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

