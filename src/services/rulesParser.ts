import type { ParsedResume, ParseResult, Contact, Experience, Education, Skill } from '../types/resume';

// Regular expression patterns for various resume sections
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([A-Za-z0-9\-\.]+)/gi,
  github: /(?:github\.com\/)([A-Za-z0-9\-\.]+)/gi,
  website: /(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9\-\.]+\.[A-Za-z]{2,})/gi,
  
  // Date patterns
  dateRange: /(\d{1,2}\/\d{4}|\d{4}|[A-Za-z]+ \d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\d{4}|[A-Za-z]+ \d{4}|Present|Current)/gi,
  date: /(\d{1,2}\/\d{4}|\d{4}|[A-Za-z]+ \d{4})/g,
  
  // University/College patterns
  university: /\b(?:University|College|Institute|School|Academy|Polytechnic)\b/gi,
  degree: /\b(?:PhD|Ph\.D|Doctorate|Master|M\.S|M\.A|M\.Sc|MBA|Bachelor|B\.S|B\.A|B\.Sc|B\.Tech|B\.E|Associate|AA|AS|Certificate|Diploma)\b/gi,
  
  // Company indicators
  company: /\b(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Company|Co\.|Technologies|Tech|Solutions|Systems|Services|Group|Enterprises|Associates)\b/gi,
  
  // Skills indicators
  skills: /\b(?:Skills|Technical Skills|Core Competencies|Technologies|Programming Languages|Languages|Tools|Frameworks|Software|Platforms)\b/gi,
  
  // Section headers
  sections: {
    experience: /\b(?:Experience|Employment|Work History|Professional Experience|Career|Jobs)\b/gi,
    education: /\b(?:Education|Academic|Qualifications|Credentials)\b/gi,
    skills: /\b(?:Skills|Technical Skills|Core Competencies|Technologies|Expertise)\b/gi,
    projects: /\b(?:Projects|Personal Projects|Portfolio|Work|Assignments)\b/gi,
    certifications: /\b(?:Certifications|Certificates|Licenses|Credentials)\b/gi,
    languages: /\b(?:Languages|Language Proficiency)\b/gi,
    summary: /\b(?:Summary|Profile|Objective|Overview|About|Bio)\b/gi
  }
};

export function parseResumeWithRules(resumeText: string): ParseResult {
  const startTime = Date.now();
  
  try {
    const normalizedText = resumeText.replace(/\s+/g, ' ').trim();
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const parsedResume: ParsedResume = {
      contact: extractContact(normalizedText),
      summary: extractSummary(lines),
      experience: extractExperience(lines),
      education: extractEducation(lines),
      skills: extractSkills(lines),
      projects: extractProjects(lines),
      certifications: extractCertifications(lines),
      languages: extractLanguages(lines),
      achievements: extractAchievements(lines),
      interests: extractInterests(lines)
    };
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      data: parsedResume,
      method: 'rules',
      processingTime
    };
  } catch (error) {
    console.error('Rules parsing error:', error);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      method: 'rules',
      processingTime
    };
  }
}

function extractContact(text: string): ParsedResume['contact'] {
  const contact: ParsedResume['contact'] = {
    email: undefined,
    phone: undefined,
    name: undefined,
    location: undefined,
    linkedin: undefined,
    github: undefined,
    website: undefined,
  };

  // Extract name (usually the first line)
  const firstLines = text.split('\n').slice(0, 3);
  for (const line of firstLines) {
    const cleanLine = line.trim();
    // Name is typically 2-4 words, all letters and spaces
    if (/^[A-Za-z\s]{3,50}$/.test(cleanLine) && cleanLine.split(' ').length >= 2 && cleanLine.split(' ').length <= 4) {
      contact.name = cleanLine;
      break;
    }
  }

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    contact.email = emailMatch[1];
  }

  // Extract phone (support various formats including +91 for India)
  const phonePatterns = [
    /\+91\s?(\d{10})/,
    /\+(\d{1,3})\s?(\d{10})/,
    /(\d{1}\s\d{10})/,
    /(\d{10})/
  ];
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
      break;
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|\/in\/)([a-zA-Z0-9\-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  // Extract GitHub
  const githubMatch = text.match(/(?:github\.com\/)([a-zA-Z0-9\-]+)/i);
  if (githubMatch) {
    contact.github = `https://github.com/${githubMatch[1]}`;
  }

  return contact;
}

function extractSummary(lines: string[]): string | undefined {
  const summaryKeywords = /^(summary|profile|objective|overview|about)/i;
  
  for (let i = 0; i < lines.length; i++) {
    if (summaryKeywords.test(lines[i])) {
      // Look for the next section or take next 2-3 lines
      const summaryLines = [];
      for (let j = i + 1; j < lines.length && j < i + 4; j++) {
        if (isNewSection(lines[j])) break;
        summaryLines.push(lines[j]);
      }
      if (summaryLines.length > 0) {
        return summaryLines.join(' ').trim();
      }
    }
  }
  return undefined;
}

function extractExperience(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  const experienceStart = findSectionStart(lines, /^(experience|employment|work|professional)/i);
  
  if (experienceStart === -1) return experiences;
  
  const nextSectionStart = findNextSection(lines, experienceStart);
  const experienceLines = lines.slice(experienceStart + 1, nextSectionStart);
  
  let currentJob: Partial<Experience> = {};
  let description: string[] = [];
  
  for (const line of experienceLines) {
    if (line.trim() === '') continue;
    
    // Check if this looks like a job title/company line
    if (isJobTitleLine(line)) {
      // Save previous job
      if (currentJob.position && currentJob.company) {
        experiences.push({
          company: currentJob.company,
          position: currentJob.position,
          startDate: currentJob.startDate,
          endDate: currentJob.endDate,
          location: currentJob.location,
          description: description.length > 0 ? description : undefined,
          current: currentJob.endDate?.toLowerCase().includes('present') || 
                  currentJob.endDate?.toLowerCase().includes('current')
        });
      }
      
      // Start new job
      currentJob = parseJobLine(line);
      description = [];
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // Bullet point description
      description.push(line.replace(/^[•\-*]\s*/, '').trim());
    } else if (currentJob.position && line.length > 20) {
      // Continuation of description
      description.push(line.trim());
    }
  }
  
  // Save last job
  if (currentJob.position && currentJob.company) {
    experiences.push({
      company: currentJob.company,
      position: currentJob.position,
      startDate: currentJob.startDate,
      endDate: currentJob.endDate,
      location: currentJob.location,
      description: description.length > 0 ? description : undefined,
      current: currentJob.endDate?.toLowerCase().includes('present') || 
              currentJob.endDate?.toLowerCase().includes('current')
    });
  }
  
  return experiences;
}

function extractEducation(lines: string[]): Education[] {
  const education: Education[] = [];
  const educationStart = findSectionStart(lines, /^education/i);
  
  if (educationStart === -1) return education;
  
  const nextSectionStart = findNextSection(lines, educationStart);
  const educationLines = lines.slice(educationStart + 1, nextSectionStart);
  
  let currentEntry: Partial<Education> = {};
  
  for (const line of educationLines) {
    if (line.trim() === '') continue;
    
    // Check if this is a new education entry (institution or degree)
    if (isEducationLine(line)) {
      // Save previous entry if it has required fields
      if ((currentEntry.institution && currentEntry.degree) || 
          (currentEntry.institution && currentEntry.institution.length > 0) || 
          (currentEntry.degree && currentEntry.degree.length > 0)) {
        education.push({
          institution: currentEntry.institution || 'Unknown Institution',
          degree: currentEntry.degree || 'Unknown Degree',
          field: currentEntry.field,
          startDate: currentEntry.startDate,
          endDate: currentEntry.endDate,
          gpa: currentEntry.gpa,
          location: currentEntry.location
        });
      }
      
      // Parse new entry
      currentEntry = parseEducationLine(line);
    } else {
      // Look for additional info in this line
      const additionalInfo = parseEducationInfo(line);
      currentEntry = { ...currentEntry, ...additionalInfo };
    }
  }
  
  // Save last entry if it has required fields
  if ((currentEntry.institution && currentEntry.degree) || 
      (currentEntry.institution && currentEntry.institution.length > 0) || 
      (currentEntry.degree && currentEntry.degree.length > 0)) {
    education.push({
      institution: currentEntry.institution || 'Unknown Institution',
      degree: currentEntry.degree || 'Unknown Degree',
      field: currentEntry.field,
      startDate: currentEntry.startDate,
      endDate: currentEntry.endDate,
      gpa: currentEntry.gpa,
      location: currentEntry.location
    });
  }
  
  return education;
}

function extractSkills(lines: string[]): Skill[] {
  const skills: Skill[] = [];
  const skillsStart = findSectionStart(lines, /^(skills|technical)/i);
  
  if (skillsStart === -1) return skills;
  
  const nextSectionStart = findNextSection(lines, skillsStart);
  const skillsLines = lines.slice(skillsStart + 1, nextSectionStart);
  
  const allSkills: string[] = [];
  
  for (const line of skillsLines) {
    if (line.trim() === '') continue;
    
    // Split by common delimiters
    const lineSkills = line.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
    allSkills.push(...lineSkills);
  }
  
  if (allSkills.length > 0) {
    skills.push({
      category: 'Technical Skills',
      skills: allSkills
    });
  }
  
  return skills;
}

function extractProjects(lines: string[]): any[] {
  // Implementation for projects section
  return [];
}

function extractCertifications(lines: string[]): any[] {
  // Implementation for certifications section
  return [];
}

function extractLanguages(lines: string[]): any[] {
  // Implementation for languages section
  return [];
}

function extractAchievements(lines: string[]): string[] {
  const achievements: string[] = [];
  const achievementsStart = findSectionStart(lines, /^(achievements|awards)/i);
  
  if (achievementsStart === -1) return achievements;
  
  const nextSectionStart = findNextSection(lines, achievementsStart);
  const achievementsLines = lines.slice(achievementsStart + 1, nextSectionStart);
  
  for (const line of achievementsLines) {
    if (line.trim() === '') continue;
    if (line.startsWith('•') || line.startsWith('-')) {
      achievements.push(line.replace(/^[•\-]\s*/, '').trim());
    } else {
      achievements.push(line.trim());
    }
  }
  
  return achievements;
}

function extractInterests(lines: string[]): string[] {
  // Implementation for interests section
  return [];
}

// Helper functions
function findSectionStart(lines: string[], pattern: RegExp): number {
  return lines.findIndex(line => pattern.test(line.trim()));
}

function findNextSection(lines: string[], startIndex: number): number {
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (isNewSection(lines[i])) {
      return i;
    }
  }
  return lines.length;
}

function isNewSection(line: string): boolean {
  const sectionPatterns = [
    /^(experience|employment|work|professional)/i,
    /^education/i,
    /^(skills|technical)/i,
    /^projects/i,
    /^(certifications|certificates)/i,
    /^(achievements|awards)/i,
    /^(languages|language)/i,
    /^(interests|hobbies)/i,
    /^(volunteering|volunteer)/i
  ];
  
  return sectionPatterns.some(pattern => pattern.test(line.trim()));
}

function isJobTitleLine(line: string): boolean {
  // Check if line contains job-related keywords and dates
  const hasJobKeywords = /\b(engineer|analyst|manager|developer|consultant|specialist|lead|director|senior|junior)\b/i.test(line);
  const hasCompanyKeywords = /\b(inc|ltd|corp|llc|company|technologies|systems|solutions|group)\b/i.test(line);
  const hasDatePattern = /\b(20\d{2}|19\d{2})\b/.test(line);
  
  return (hasJobKeywords || hasCompanyKeywords) && hasDatePattern;
}

function isEducationLine(line: string): boolean {
  const hasEducationKeywords = /\b(university|college|institute|school|fellowship|bachelor|master|phd|degree|btec|diploma)\b/i.test(line);
  const hasDatePattern = /\b(20\d{2}|19\d{2})\b/.test(line);
  
  return hasEducationKeywords || hasDatePattern;
}

function parseJobLine(line: string): Partial<Experience> {
  const job: Partial<Experience> = {};
  
  // Extract dates first
  const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}|Present|Current)/i);
  if (dateMatch) {
    job.startDate = dateMatch[1];
    job.endDate = dateMatch[2];
  }
  
  // Remove dates to parse company/position
  const lineWithoutDates = line.replace(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}|Present|Current)/gi, '').trim();
  
  // Split by common separators
  const parts = lineWithoutDates.split(/[-–—,]/);
  if (parts.length >= 2) {
    job.position = parts[0].trim();
    job.company = parts[1].trim();
  } else {
    job.position = lineWithoutDates;
  }
  
  return job;
}

function parseEducationLine(line: string): Partial<Education> {
  const edu: Partial<Education> = {};
  
  // Extract dates
  const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}|Present|Current)/i);
  if (dateMatch) {
    edu.startDate = dateMatch[1];
    edu.endDate = dateMatch[2];
  }
  
  // Extract degree
  const degreeMatch = line.match(/\b(fellowship|bachelor|master|phd|ph\.d|b\.?tech|b\.?e|b\.?sc|b\.?a|m\.?tech|m\.?sc|m\.?a|mba|diploma|certificate)\b/i);
  if (degreeMatch) {
    edu.degree = degreeMatch[1];
  }
  
  // Extract institution
  const institutionMatch = line.match(/\b(.*(?:university|college|institute|school|academy).*)\b/i);
  if (institutionMatch) {
    edu.institution = institutionMatch[1].trim();
  }
  
  return edu;
}

function parseEducationInfo(line: string): Partial<Education> {
  const info: Partial<Education> = {};
  
  // Extract GPA
  const gpaMatch = line.match(/(\d\.\d{1,2})\/(\d)/);
  if (gpaMatch) {
    info.gpa = gpaMatch[0];
  }
  
  // Extract field of study
  const fieldMatch = line.match(/\b(computer science|engineering|business|science|technology|management|arts|commerce)\b/i);
  if (fieldMatch) {
    info.field = fieldMatch[1];
  }
  
  return info;
} 