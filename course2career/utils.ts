import type { UserProfile, Suggestion } from './types';

export const calculateSkillMatch = (userSkills: string[], jobSkills: string[]): { percentage: number; matchedSkills: Set<string> } => {
  if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
    return { percentage: 0, matchedSkills: new Set() };
  }

  const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());
  
  const matchedSkills = new Set<string>();
  let matchCount = 0;

  jobSkillsLower.forEach(jobSkill => {
    if (userSkillsLower.has(jobSkill)) {
      matchCount++;
      matchedSkills.add(jobSkill);
    }
  });

  const percentage = Math.round((matchCount / jobSkills.length) * 100);

  return { percentage, matchedSkills };
};

export const calculateProfileStrength = (profile: UserProfile | null): { percentage: number, label: string, suggestions: Suggestion[] } => {
    if (!profile) return { percentage: 0, label: 'No Profile', suggestions: [{ text: 'Create your profile with our AI Parser to get started.', action: { type: 'navigate', page: 'profile-parser' } }] };

    let score = 0;
    const maxScore = 10;
    const suggestions: Suggestion[] = [];

    if (profile.summary?.trim()) score++;
    else suggestions.push({ text: 'Add a professional summary to introduce yourself to recruiters.', action: { type: 'editAndScroll', sectionId: 'summary-section' } });

    if (profile.skills?.length > 0) score++;
    else suggestions.push({ text: 'List at least one skill to showcase your abilities.', action: { type: 'editAndScroll', sectionId: 'skills-section' } });

    if (profile.profilePhoto) score++;
    else suggestions.push({ text: 'Upload a professional profile photo to make a great first impression.', action: { type: 'editAndScroll', sectionId: 'profile-header' } });

    if (profile.isVerified) score++;
    else suggestions.push({ text: 'Verify your profile to build trust with employers.', action: { type: 'navigate', page: 'seeker-verification' } });
    
    if (profile.experience?.length > 0) score++;
    else suggestions.push({ text: 'Add your work experience. If you have none, add volunteer work or relevant activities.', action: { type: 'editAndScroll', sectionId: 'experience-section' } });

    if (profile.internships?.length > 0) score++;
    else suggestions.push({ text: 'Include any internships you have completed to show practical experience.', action: { type: 'editAndScroll', sectionId: 'internships-section' } });

    if (profile.projects?.length > 0) score++;
    else suggestions.push({ text: 'Showcase personal or academic projects to demonstrate your skills in action.', action: { type: 'editAndScroll', sectionId: 'projects-section' } });

    if (profile.education?.undergraduate?.degree) score++;
    else suggestions.push({ text: 'Complete your undergraduate education details.', action: { type: 'editAndScroll', sectionId: 'education-section' } });

    if (profile.education?.tenth?.score && profile.education?.twelfth?.score) score++;
    else suggestions.push({ text: 'Fill in your 10th and 12th standard education details for a complete academic record.', action: { type: 'editAndScroll', sectionId: 'education-section' } });

    if (profile.careerPreferences?.desiredRoles?.length > 0) score++;
    else suggestions.push({ text: 'Add your career preferences to receive more relevant job recommendations.', action: { type: 'editAndScroll', sectionId: 'career-preferences-section' } });
    
    const percentage = Math.round((score / maxScore) * 100);
    let label = 'Beginner';
    if (percentage >= 95) {
      label = 'All-Star';
    } else if (percentage >= 70) {
      label = 'Strong';
    } else if (percentage >= 40) {
      label = 'Intermediate';
    }
  
    return { percentage, label, suggestions };
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
};