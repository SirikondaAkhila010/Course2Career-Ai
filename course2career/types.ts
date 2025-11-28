export type UserType = 'seeker' | 'employer';

export interface User {
  email: string;
  password?: string; // Not always present, e.g. when getting current user
  userType: UserType;
}

export type Page = 
  | 'dashboard'
  | 'job-search'
  | 'messages'
  | 'ai-chatbot'
  | 'user-profile'
  | 'profile-parser'
  | 'resume-builder'
  | 'company-prep'
  | 'seeker-verification'
  | 'job-alerts'
  | 'employer-dashboard'
  | 'employer-find-talent'
  | 'talent-discovery'
  | 'employer-company-profile'
  | 'employer-post-job'
  | 'employer-view-applicants'
  | 'employer-verification';

export type AuthPage = 'landing' | 'seeker-login' | 'seeker-signup' | 'employer-login' | 'employer-signup';

export type JobStatus = 'Urgent' | 'Featured';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  companyLogo?: string;
  applyUrl: string;
  salary?: string;
  status?: JobStatus | null;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  skills: string[];
  link?: string;
}

export interface EducationRecord {
  institution: string;
  board: string;
  year: string;
  score: string;
}

export interface UndergraduateRecord {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  score: string;
}

export interface Education {
  tenth: EducationRecord;
  twelfth: EducationRecord;
  undergraduate: UndergraduateRecord;
}

export interface Links {
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface Language {
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Certification {
    name: string;
    issuingBody: string;
    date: string;
    credentialUrl?: string;
}

export interface Achievement {
    title: string;
    description: string;
    date: string;
}

export interface Responsibility {
  role: string;
  organization: string;
  description: string;
}

export interface CareerPreferences {
  jobTypes: string[];
  locations: string[];
  desiredRoles: string[];
  availability: 'Immediately' | 'In 1 Month' | 'In 3 Months' | 'Flexible';
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  internships: Experience[];
  projects: Project[];
  education: Education;
  valueProposition: string;
  links?: Links;
  languages?: Language[];
  certifications?: Certification[];
  achievements?: Achievement[];
  relevantCoursework?: string[];
  responsibilities?: Responsibility[];
  profilePhoto?: string;
  isVerified?: boolean;
  careerPreferences?: CareerPreferences;
}

export interface EmployerProfile {
  companyName: string;
  email: string;
  companyWebsite?: string;
  employeeCount?: string;
  companyDescription?: string;
  missionStatement?: string;
  benefits?: string[];
  galleryPhotos?: string[];
  cultureVideoUrl?: string;
  isVerified?: boolean;
}

export type ApplicationStatus = 'Applied' | 'Viewed' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  feedback?: 'up' | 'down';
}

export interface SkillGapAnalysis {
  summary: string;
  missingSkills: {
    skill: string;
    recommendation: {
      title: string;
      url: string;
      type: 'Course' | 'Video' | 'Article' | 'Documentation';
    };
  }[];
}

export interface CompanyPrepInfo {
  overview: string;
  interviewQuestions: string[];
  latestNews: string;
}

export interface ApplicantRanking {
  email: string;
  rank: number;
  justification: string;
}

export interface ProfileFeedback {
  summary: {
    feedback: string;
    suggestion: string;
  };
  experience: {
    original: string;
    suggestion: string;
  }[];
}

export type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Rejected' | 'Withdrawn';

export interface Application {
  jobId: number;
  userEmail: string;
  status: ApplicantStatus;
  appliedDate: string;
}

export interface Review {
  companyName: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO string
}

export type SuggestionAction = { type: 'navigate', page: Page } | { type: 'editAndScroll', sectionId: string };

export interface Suggestion {
  text: string;
  action: SuggestionAction;
}

export interface JobAlert {
  id: number;
  keywords: string;
  skills: string;
  location: string;
  jobType: string; // 'All' or a specific type
}

export interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
  type: 'job_alert' | 'application_update';
  relatedJobId?: number;
}