export interface Contact {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  location?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string[];
  current?: boolean;
}

export interface Skill {
  category: string;
  skills: string[];
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface ParsedResume {
  contact: Contact;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  achievements?: string[];
  interests?: string[];
}

export interface ParseResult {
  success: boolean;
  data?: ParsedResume;
  error?: string;
  method: 'llm' | 'rules';
  processingTime: number;
} 