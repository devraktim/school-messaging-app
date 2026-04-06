export interface Message {
  id: string;
  sender: string;
  senderRole: "teacher" | "student";
  text: string;
  timestamp: string;
  isOwn?: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface StudentItem {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const CLASSES: ClassItem[] = [
  { id: "c1", name: "Class 5", section: "A", studentCount: 32, subject: "Mathematics", lastMessage: "Please complete the worksheet.", lastMessageTime: "9:30 AM" },
  { id: "c2", name: "Class 6", section: "B", studentCount: 30, subject: "Mathematics", lastMessage: "Test on Friday.", lastMessageTime: "Yesterday" },
  { id: "c3", name: "Class 7", section: "A", studentCount: 35, subject: "Mathematics", lastMessage: "Great work today!", lastMessageTime: "Mon" },
  { id: "c4", name: "Class 8", section: "C", studentCount: 28, subject: "Mathematics", lastMessage: "Chapter 5 revision.", lastMessageTime: "Sun" },
];

export const STUDENTS: StudentItem[] = [
  { id: "s1", name: "Priya Sharma", class: "Class 7", section: "A", rollNumber: "24", lastMessage: "Thank you sir!", lastMessageTime: "9:30 AM" },
  { id: "s2", name: "Rahul Gupta", class: "Class 7", section: "A", rollNumber: "18", lastMessage: "I'll submit tomorrow.", lastMessageTime: "Yesterday" },
  { id: "s3", name: "Anita Roy", class: "Class 5", section: "A", rollNumber: "3", lastMessage: "Understood.", lastMessageTime: "Mon" },
  { id: "s4", name: "Kiran Bose", class: "Class 6", section: "B", rollNumber: "12", lastMessage: "Can I get an extension?", lastMessageTime: "Mon" },
  { id: "s5", name: "Deepak Singh", class: "Class 8", section: "C", rollNumber: "7", lastMessage: "Got it, sir.", lastMessageTime: "Sun" },
  { id: "s6", name: "Meena Thakur", class: "Class 5", section: "A", rollNumber: "21", lastMessage: "Is homework due today?", lastMessageTime: "Sun" },
  { id: "s7", name: "Aman Verma", class: "Class 7", section: "A", rollNumber: "29", lastMessage: "Hello sir!", lastMessageTime: "Sat" },
  { id: "s8", name: "Sita Devi", class: "Class 8", section: "C", rollNumber: "15", lastMessage: "Thank you!", lastMessageTime: "Sat" },
];

export const TEACHERS: TeacherItem[] = [
  { id: "t1", name: "Mr. Thomas D'Souza", subject: "Mathematics", lastMessage: "Please complete the worksheet.", lastMessageTime: "9:30 AM" },
  { id: "t2", name: "Mrs. Mary Fernandez", subject: "English", lastMessage: "Essay due Friday.", lastMessageTime: "Yesterday" },
  { id: "t3", name: "Mr. Joseph Pinto", subject: "Science", lastMessage: "Lab session tomorrow.", lastMessageTime: "Mon" },
  { id: "t4", name: "Ms. Anjali Mehta", subject: "Social Studies", lastMessage: "Map work assignment.", lastMessageTime: "Sun" },
];

export const CLASS_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Good morning Class 5A! Please open your textbooks to page 42.", timestamp: "8:30 AM" },
    { id: "m2", sender: "Anita Roy", senderRole: "student", text: "Good morning sir!", timestamp: "8:32 AM" },
    { id: "m3", sender: "Meena Thakur", senderRole: "student", text: "Sir, I forgot my book at home.", timestamp: "8:33 AM" },
    { id: "m4", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "That's okay Meena, share with the student next to you.", timestamp: "8:35 AM" },
    { id: "m5", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Please complete the worksheet on fractions by tomorrow.", timestamp: "9:30 AM" },
  ],
  c2: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Hello Class 6B. We have a test on Chapter 3 this Friday.", timestamp: "10:00 AM" },
    { id: "m2", sender: "Kiran Bose", senderRole: "student", text: "Sir, will it include decimals?", timestamp: "10:05 AM" },
    { id: "m3", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Yes, chapters 3 and 4 both. Study all examples.", timestamp: "Yesterday" },
  ],
  c3: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Class 7A, great performance in today's quiz!", timestamp: "Mon 11:00 AM" },
    { id: "m2", sender: "Priya Sharma", senderRole: "student", text: "Thank you sir!", timestamp: "Mon 11:10 AM" },
    { id: "m3", sender: "Rahul Gupta", senderRole: "student", text: "When is the next quiz sir?", timestamp: "Mon 11:15 AM" },
    { id: "m4", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Next Monday. Keep practicing!", timestamp: "Mon 11:20 AM" },
  ],
  c4: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Class 8C, please revise Chapter 5 before Thursday.", timestamp: "Sun" },
    { id: "m2", sender: "Deepak Singh", senderRole: "student", text: "Got it, sir.", timestamp: "Sun" },
    { id: "m3", sender: "Sita Devi", senderRole: "student", text: "Thank you for the notes sir!", timestamp: "Sun" },
  ],
};

export const INDIVIDUAL_MESSAGES: Record<string, Message[]> = {
  s1: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Hi Priya, how are you managing the syllabus?", timestamp: "9:00 AM", isOwn: true },
    { id: "m2", sender: "Priya Sharma", senderRole: "student", text: "I'm doing well sir, just struggling with algebra.", timestamp: "9:15 AM" },
    { id: "m3", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Come for extra classes on Wednesday.", timestamp: "9:20 AM", isOwn: true },
    { id: "m4", sender: "Priya Sharma", senderRole: "student", text: "Thank you sir!", timestamp: "9:30 AM" },
  ],
  s2: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Rahul, your assignment was due today.", timestamp: "Yesterday 2:00 PM", isOwn: true },
    { id: "m2", sender: "Rahul Gupta", senderRole: "student", text: "Sorry sir, I'll submit tomorrow morning.", timestamp: "Yesterday 2:30 PM" },
  ],
  t1: [
    { id: "m1", sender: "Mr. Thomas D'Souza", senderRole: "teacher", text: "Hello! Please complete the worksheet by tomorrow.", timestamp: "9:00 AM" },
    { id: "m2", sender: "Priya Sharma", senderRole: "student", text: "Sure sir, I'll finish it tonight.", timestamp: "9:30 AM", isOwn: true },
  ],
  t2: [
    { id: "m1", sender: "Mrs. Mary Fernandez", senderRole: "teacher", text: "Your essay is due this Friday, Priya.", timestamp: "Yesterday" },
    { id: "m2", sender: "Priya Sharma", senderRole: "student", text: "I'm working on it ma'am!", timestamp: "Yesterday", isOwn: true },
  ],
};
