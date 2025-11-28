import React, { useState, useEffect } from 'react';
import type { UserProfile, Page, Links, CareerPreferences, Language, Certification, Achievement, EducationRecord, UndergraduateRecord, Responsibility, Project, SuggestionAction, Experience } from '../types';
import { generateValuePropositionWithAI, parseResumeWithAI, parseResumePdfWithAI } from '../services/geminiService';
import { UserIcon } from './icons/UserIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BadgeCheckIcon } from './icons/BadgeCheckIcon';
import { LinkIcon } from './icons/LinkIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { TargetIcon } from './icons/TargetIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { calculateProfileStrength } from '../utils';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

// pdfjs-dist typing requires casting to access GlobalWorkerOptions
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;
import ProfileStrengthIndicator from './ProfileStrengthIndicator';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { XIcon } from './icons/XIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CodeBracketIcon as SkillsIcon } from './icons/CodeBracketIcon';

interface UserProfilePageProps {
  userProfile: UserProfile | null;
  onPhotoUpdate: (photoData: string) => void;
  onClearProfile: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate: (page: Page) => void;
}

const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);


const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; id?: string }> = ({ icon, title, children, id }) => (
    <div id={id} className="mt-8 border-t border-gray-200 dark:border-secondary-focus pt-6">
        <div className="flex items-center">
            <div className="text-primary">{icon}</div>
            <h3 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="mt-4 pl-10">
            {children}
        </div>
    </div>
);


const UserProfilePage: React.FC<UserProfilePageProps> = ({ userProfile, onPhotoUpdate, onClearProfile, onUpdateProfile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(userProfile);
  const [isRegeneratingVP, setIsRegeneratingVP] = useState(false);
  const [courseworkInput, setCourseworkInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [projectUrlErrors, setProjectUrlErrors] = useState<Record<number, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [showAutofillPanel, setShowAutofillPanel] = useState(false);
  const profileStrength = calculateProfileStrength(userProfile);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        } else {
          reject(new Error('Could not read file for AI parsing.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsDataURL(file);
    });
  };
  const handleResumeFileUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setResumeError('Please upload a PDF file.');
      setResumeFile(null);
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
        setResumePreviewUrl(null);
      }
      return;
    }
    // Check file size (20MB limit for Gemini API)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setResumeError('PDF file is too large. Please use a file smaller than 20MB.');
      setResumeFile(null);
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
        setResumePreviewUrl(null);
      }
      return;
    }
    setResumeError(null);
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setResumePreviewUrl(previewUrl);
    setResumeFile(file);
    await handleAutofillFromResume(file);
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str || '')
        .join(' ');
      text += `${pageText}\n`;
    }

    loadingTask.destroy();
    return text.trim();
  };

  const mergeProfiles = (existing: UserProfile, parsed: UserProfile): UserProfile => {
    // Prefer parsed data when available, but keep existing values otherwise
    return {
      ...existing,
      ...parsed,
      skills: parsed.skills?.length ? parsed.skills : existing.skills,
      experience: parsed.experience?.length ? parsed.experience : existing.experience,
      internships: parsed.internships?.length ? parsed.internships : existing.internships,
      projects: parsed.projects?.length ? parsed.projects : existing.projects,
      education: parsed.education || existing.education,
      relevantCoursework: parsed.relevantCoursework?.length ? parsed.relevantCoursework : existing.relevantCoursework,
      languages: parsed.languages?.length ? parsed.languages : existing.languages,
      certifications: parsed.certifications?.length ? parsed.certifications : existing.certifications,
      achievements: parsed.achievements?.length ? parsed.achievements : existing.achievements,
      responsibilities: parsed.responsibilities?.length ? parsed.responsibilities : existing.responsibilities,
      valueProposition: parsed.valueProposition || existing.valueProposition,
      summary: parsed.summary || existing.summary,
    };
  };

  const handleAutofillFromResume = async (fileOverride?: File) => {
    const file = fileOverride || resumeFile;
    if (!file || !userProfile) {
      setResumeError('Please upload a PDF resume first.');
      return;
    }
    setIsParsingResume(true);
    setResumeError(null);
    try {
      let parsedProfile: UserProfile | null = null;
      try {
        const resumeText = await extractTextFromPdf(file);
        console.log('Extracted text length:', resumeText?.length || 0);
        if (resumeText && resumeText.trim().length > 10) {
          // Use text extraction if we got meaningful text
          parsedProfile = await parseResumeWithAI(resumeText);
        } else {
          console.log('Text extraction yielded insufficient text, falling back to direct PDF parsing');
          throw new Error('Empty or insufficient text from PDF.');
        }
      } catch (textError) {
        console.log('Text extraction failed, trying PDF direct parsing:', textError);
        try {
          const pdfBase64 = await convertFileToBase64(file);
          console.log('PDF converted to base64, size:', pdfBase64.length, 'characters');
          parsedProfile = await parseResumePdfWithAI(pdfBase64);
        } catch (pdfError: any) {
          console.error('PDF parsing also failed:', pdfError);
          const errorMsg = pdfError?.message || pdfError?.toString() || 'Unknown error';
          console.error('Full error details:', {
            message: errorMsg,
            error: pdfError,
            fileSize: file.size,
            fileName: file.name
          });
          // Re-throw with the original error message if it's already descriptive
          if (errorMsg.includes('too large') || errorMsg.includes('quota') || errorMsg.includes('format')) {
            throw pdfError;
          }
          throw new Error(`Unable to extract data from this PDF: ${errorMsg}. The file may be corrupted, password-protected, or contain only images. Please try a different PDF file or fill the profile manually.`);
        }
      }
      
      if (!parsedProfile) {
        throw new Error('Failed to parse resume. Please try again or fill the profile manually.');
      }
      
      const mergedProfile = mergeProfiles(userProfile, parsedProfile);
      onUpdateProfile(mergedProfile);
      setShowAutofillPanel(false);
      setResumeFile(null);
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
        setResumePreviewUrl(null);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to parse resume', error);
      setResumeError(error instanceof Error ? error.message : 'Unable to parse the uploaded PDF. Please try another file or fill the profile manually.');
    } finally {
      setIsParsingResume(false);
    }
  };


  useEffect(() => {
    if (!isEditing) {
      setFormData(userProfile);
    } else if (userProfile) {
        // When entering edit mode, ensure all fields have default values to avoid controlled/uncontrolled errors
        setFormData({
            ...userProfile,
            links: userProfile.links || { linkedIn: '', github: '', portfolio: '' },
            careerPreferences: userProfile.careerPreferences || { jobTypes: [], locations: [], desiredRoles: [], availability: 'Immediately' },
            languages: userProfile.languages || [],
            certifications: userProfile.certifications || [],
            achievements: userProfile.achievements || [],
            relevantCoursework: userProfile.relevantCoursework || [],
            responsibilities: userProfile.responsibilities || [],
            projects: userProfile.projects || [],
            experience: userProfile.experience || [],
            internships: userProfile.internships || [],
            education: userProfile.education || {
                tenth: { institution: '', board: '', year: '', score: '' },
                twelfth: { institution: '', board: '', year: '', score: '' },
                undergraduate: { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', score: '' },
            },
        });
    }
  }, [userProfile, isEditing]);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  if (!userProfile) {
    return (
      <div className="text-center p-8 bg-white dark:bg-secondary rounded-lg shadow animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-secondary-content">No Profile Found</h2>
        <p className="mt-2 text-gray-500 dark:text-base-content">Create your profile to get started.</p>
        <button onClick={() => onNavigate('profile-parser')} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
          Build Profile with AI
        </button>
      </div>
    );
  }
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoUpdate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleNestedChange = <K extends 'links' | 'careerPreferences'>(
    section: K,
    field: keyof NonNullable<UserProfile[K]>,
    value: any
  ) => {
    setFormData(prev => {
        if (!prev) return null;
        const sectionData = prev[section] || {};
        return { ...prev, [section]: { ...sectionData, [field]: value } };
    });
  };

  const handleArrayChange = <K extends 'languages' | 'certifications' | 'achievements' | 'responsibilities' | 'projects' | 'experience' | 'internships'>(
    section: K,
    index: number,
    field: keyof NonNullable<UserProfile[K]>[number],
    value: any
  ) => {
    setFormData(prev => {
        if (!prev) return null;
        const newArray = [...(prev[section] || [])];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prev, [section]: newArray as any };
    });
  };

  const handleEducationChange = (
      level: 'tenth' | 'twelfth' | 'undergraduate',
      field: keyof EducationRecord | keyof UndergraduateRecord,
      value: string
  ) => {
      setFormData(prev => {
          if (!prev) return null;
          const educationData = prev.education || { tenth: { institution: '', board: '', year: '', score: '' }, twelfth: { institution: '', board: '', year: '', score: '' }, undergraduate: { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', score: '' } };
          const levelData = educationData[level] || {};
          
          return {
              ...prev,
              education: {
                  ...educationData,
                  [level]: {
                      ...levelData,
                      [field]: value
                  }
              }
          };
      });
  };


  const addArrayItem = (section: 'languages' | 'certifications' | 'achievements' | 'responsibilities' | 'projects' | 'experience' | 'internships') => {
    let newItem: any;
    switch (section) {
        case 'languages': newItem = { name: '', proficiency: 'Intermediate' }; break;
        case 'certifications': newItem = { name: '', issuingBody: '', date: '', credentialUrl: '' }; break;
        case 'achievements': newItem = { title: '', description: '', date: '' }; break;
        case 'responsibilities': newItem = { role: '', organization: '', description: '' }; break;
        case 'projects': newItem = { name: '', description: '', skills: [], link: '' }; break;
        case 'experience': newItem = { company: '', role: '', startDate: '', endDate: '', description: '' }; break;
        case 'internships': newItem = { company: '', role: '', startDate: '', endDate: '', description: '' }; break;
    }
    setFormData(prev => prev ? { ...prev, [section]: [...(prev[section] || []), newItem] } : null);
  };
  
  const removeArrayItem = (section: 'languages' | 'certifications' | 'achievements' | 'responsibilities' | 'projects' | 'experience' | 'internships', index: number) => {
    setFormData(prev => {
        if (!prev) return null;
        const newArray = (prev[section] || []).filter((_: any, i: number) => i !== index);
        return { ...prev, [section]: newArray as any };
    });
  };

    const handleAddCoursework = (course: string) => {
        const trimmed = course.trim();
        if (trimmed && !formData?.relevantCoursework?.includes(trimmed)) {
            setFormData(prev => prev ? { ...prev, relevantCoursework: [...(prev.relevantCoursework || []), trimmed] } : null);
        }
        setCourseworkInput('');
    };

    const handleRemoveCoursework = (index: number) => {
        setFormData(prev => prev ? { ...prev, relevantCoursework: (prev.relevantCoursework || []).filter((_, i) => i !== index) } : null);
    };

    const handleCourseworkInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCoursework(courseworkInput);
        }
    };
    
    const handleAddSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !formData?.skills?.find(s => s.toLowerCase() === trimmed.toLowerCase())) {
            setFormData(prev => prev ? { ...prev, skills: [...(prev.skills || []), trimmed] } : null);
        }
        setSkillInput('');
    };

    const handleRemoveSkill = (index: number) => {
        setFormData(prev => prev ? { ...prev, skills: (prev.skills || []).filter((_, i) => i !== index) } : null);
    };

    const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

  const handleRegenerateVP = async () => {
      if (!formData) return;
      setIsRegeneratingVP(true);
      try {
          const newVp = await generateValuePropositionWithAI(formData);
          setFormData(prev => prev ? { ...prev, valueProposition: newVp } : null);
      } catch (error) {
          console.error("Failed to regenerate value proposition", error);
          alert("Could not regenerate value proposition. Please try again later.");
      } finally {
          setIsRegeneratingVP(false);
      }
  };

  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Optional field is valid if empty
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(url);
  };

  const handleProjectUrlChange = (index: number, value: string) => {
    handleArrayChange('projects', index, 'link', value);
    if (validateUrl(value)) {
      setProjectUrlErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    } else {
      setProjectUrlErrors(prev => ({
        ...prev,
        [index]: 'Please enter a valid URL format (e.g., example.com).'
      }));
    }
  };

  const handleSuggestionAction = (action: SuggestionAction) => {
    if (action.type === 'navigate') {
        onNavigate(action.page);
    } else if (action.type === 'editAndScroll') {
        setIsEditing(true);
        setTimeout(() => {
            const element = document.getElementById(action.sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight effect
                element.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-secondary', 'transition-all', 'duration-300', 'rounded-md', 'p-2', '-m-2');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-secondary', 'p-2', '-m-2');
                }, 2500);
            }
        }, 100);
    }
  };

  const handleSave = () => {
    if (Object.keys(projectUrlErrors).length > 0) {
      alert("Please fix the invalid URL formats before saving.");
      return;
    }
    if (formData) {
      onUpdateProfile(formData);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setProjectUrlErrors({});
  };

  const isEducationValid = userProfile.education && typeof userProfile.education === 'object' && !Array.isArray(userProfile.education);
  
  const inputBaseClasses = "block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-secondary-focus dark:border-secondary-focus/50 dark:text-secondary-content";
  const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const hasLinks = userProfile.links && (userProfile.links.linkedIn || userProfile.links.github || userProfile.links.portfolio);


  return (
    <div className="bg-white dark:bg-secondary shadow-lg rounded-lg overflow-hidden p-8">
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-secondary-focus p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Autofill</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Upload & Autofill</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-secondary-content/80">Use your latest resume to populate sections instantly. You can still edit after import.</p>
          <button
            onClick={() => setShowAutofillPanel(!showAutofillPanel)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
          >
            <UploadIcon className="h-4 w-4" />
            {showAutofillPanel ? 'Hide Upload' : 'Autofill from Resume'}
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-secondary-focus p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Manual</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Fill It Yourself</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-secondary-content/80">Switch to edit mode to update each section manually and keep full control.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Manually
          </button>
        </div>
      </div>

      {showAutofillPanel && (
        <div className="mb-8 rounded-2xl border border-dashed border-gray-300 dark:border-secondary-focus p-6 space-y-4 bg-primary/5">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Upload your resume (PDF only)</h4>
          <p className="text-sm text-gray-600 dark:text-secondary-content/80">We’ll start autofilling as soon as your PDF finishes uploading.</p>
          <label className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${resumeFile ? 'border-primary bg-white' : 'border-gray-300 dark:border-secondary-focus bg-white/80 dark:bg-secondary-focus/60 hover:border-primary'}`}>
            <UploadIcon className="h-10 w-10 text-primary mb-3" />
            <p className="text-sm text-gray-600 dark:text-secondary-content/80">Drag & drop your PDF here or click to choose a file.</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-secondary-content/70">Max size 5 MB</p>
            <input
              type="file"
              className="sr-only"
              accept=".pdf,application/pdf"
              onChange={(e) => handleResumeFileUpload(e.target.files?.[0])}
              disabled={isParsingResume}
            />
          </label>
          {resumeFile && (
            <div className="rounded-xl bg-white dark:bg-secondary-focus/50 p-4 text-sm text-gray-700 dark:text-secondary-content flex items-center justify-between">
              <div>
                <p className="font-semibold">{resumeFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-secondary-content/70">{(resumeFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => {
                  setResumeFile(null);
                  if (resumePreviewUrl) {
                    URL.revokeObjectURL(resumePreviewUrl);
                    setResumePreviewUrl(null);
                  }
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
                disabled={isParsingResume}
              >
                Remove
              </button>
            </div>
          )}
          {resumePreviewUrl && (
            <div className="h-80 rounded-2xl border border-gray-200 dark:border-secondary-focus overflow-hidden bg-white dark:bg-secondary-focus shadow-inner">
              <iframe
                title="Resume preview"
                src={`${resumePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="h-full w-full"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleAutofillFromResume()}
              disabled={isParsingResume || !resumeFile}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-focus disabled:opacity-60"
            >
              {isParsingResume && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              )}
              {isParsingResume ? 'Parsing Resume...' : 'Re-run Autofill'}
            </button>
            <p className="text-xs text-gray-500 dark:text-secondary-content/70">Upload triggers autofill automatically. Button lets you re-run if needed.</p>
          </div>
          {resumeError && <p className="text-sm text-red-600">{resumeError}</p>}
        </div>
      )}
      {/* Header */}
      <div id="profile-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="relative">
                <label htmlFor="photo-upload" className="cursor-pointer group">
                    {userProfile.profilePhoto ? (
                        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-secondary" src={userProfile.profilePhoto} alt="User avatar" />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-secondary-focus flex items-center justify-center ring-4 ring-white dark:ring-secondary">
                        <UserIcon className="h-16 w-16 text-gray-500 dark:text-base-content" />
                        </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                        <PencilIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </label>
                <input id="photo-upload" type="file" className="sr-only" onChange={handlePhotoUpload} accept="image/*"/>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {userProfile.fullName}
                  {userProfile.isVerified && <BadgeCheckIcon className="w-7 h-7 text-primary" title="Verified Profile"/>}
              </h2>
              <p className="text-md text-gray-600 dark:text-base-content">{userProfile.email} &middot; {userProfile.phone}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
            {isEditing ? (
                 <div className="flex gap-2">
                    <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 dark:border-secondary-focus text-sm font-medium rounded-md text-gray-700 dark:text-secondary-content bg-white dark:bg-secondary-focus hover:bg-gray-50 dark:hover:bg-opacity-80">Cancel</button>
                    <button onClick={handleSave} disabled={Object.keys(projectUrlErrors).length > 0} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed">Save Profile</button>
                 </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                </button>
            )}
             {!userProfile.isVerified && (
                <button onClick={() => onNavigate('seeker-verification')} className="text-sm font-semibold text-primary hover:underline">
                    Verify Your Profile &rarr;
                </button>
             )}
          </div>
        </div>

      {/* Profile Strength Indicator */}
      <div className="mt-6">
        <ProfileStrengthIndicator 
          percentage={profileStrength.percentage}
          label={profileStrength.label}
          suggestions={profileStrength.suggestions}
          onActionClick={handleSuggestionAction}
        />
      </div>

        {/* Value Proposition */}
        <Section id="value-proposition-section" icon={<LightBulbIcon className="w-6 h-6" />} title="AI-Generated Value Proposition">
            {isEditing ? (
                <div>
                    <textarea
                        name="valueProposition"
                        value={formData?.valueProposition || ''}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Click 'Regenerate with AI' to create a value proposition based on your profile."
                        className={`${inputBaseClasses} mb-2`}
                    />
                    <button
                        type="button"
                        onClick={handleRegenerateVP}
                        disabled={isRegeneratingVP}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400"
                    >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isRegeneratingVP ? 'Regenerating...' : 'Regenerate with AI'}
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-gray-700 dark:text-secondary-content italic">
                        "{userProfile.valueProposition || 'No value proposition provided.'}"
                    </p>
                </div>
            )}
        </Section>

        {/* Summary */}
        <Section id="summary-section" icon={<UserIcon className="w-6 h-6" />} title="Summary">
            {isEditing ? (
                <textarea name="summary" value={formData?.summary || ''} onChange={handleInputChange} rows={4} placeholder="Write a brief professional summary about yourself..." className={inputBaseClasses}/>
            ) : (
                <p className="text-gray-700 dark:text-secondary-content whitespace-pre-wrap">{userProfile.summary || 'No summary provided.'}</p>
            )}
        </Section>
        
        {/* Skills */}
        <Section id="skills-section" icon={<SkillsIcon className="w-6 h-6" />} title="Skills">
            {isEditing ? (
                <div className="p-2 border border-gray-300 dark:border-secondary-focus rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(formData?.skills || []).map((skill, index) => (
                            <div key={index} className="flex items-center bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content text-sm font-medium px-3 py-1 rounded-full">
                                <span>{skill}</span>
                                <button onClick={() => handleRemoveSkill(index)} className="ml-2 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillInputKeyDown}
                        placeholder="+ Add skill and press Enter"
                        className="w-full bg-transparent border-none focus:ring-0 p-1 text-sm text-gray-800 dark:text-secondary-content placeholder-gray-500 dark:placeholder-gray-500"
                    />
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {(userProfile.skills || []).length > 0 ? (
                        userProfile.skills?.map(skill => (
                            <span key={skill} className="bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content text-sm font-medium px-3 py-1.5 rounded-full">{skill}</span>
                        ))
                    ) : <p className="text-gray-500 dark:text-base-content">No skills listed.</p>}
                </div>
            )}
        </Section>
        
        {/* Experience & Internships - Dynamic Sections */}
        {[
            { key: 'experience' as const, title: 'Experience', icon: <BriefcaseIcon className="w-6 h-6" /> },
            { key: 'internships' as const, title: 'Internships', icon: <BriefcaseIcon className="w-6 h-6" /> },
        ].map(sectionInfo => (
            <Section key={sectionInfo.key} id={`${sectionInfo.key}-section`} icon={sectionInfo.icon} title={sectionInfo.title}>
                 {isEditing ? (
                    <div className="space-y-4">
                        {(formData?.[sectionInfo.key] as Experience[] || []).map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 border rounded-md bg-gray-50 dark:bg-secondary-focus/50 dark:border-secondary-focus">
                                <div className="flex-grow space-y-2">
                                    <input value={item.role} onChange={e => handleArrayChange(sectionInfo.key, i, 'role', e.target.value)} placeholder="Role" className={inputBaseClasses}/>
                                    <input value={item.company} onChange={e => handleArrayChange(sectionInfo.key, i, 'company', e.target.value)} placeholder="Company" className={inputBaseClasses}/>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={item.startDate} onChange={e => handleArrayChange(sectionInfo.key, i, 'startDate', e.target.value)} placeholder="Start Date (Month YYYY)" className={inputBaseClasses}/>
                                        <input value={item.endDate} onChange={e => handleArrayChange(sectionInfo.key, i, 'endDate', e.target.value)} placeholder="End Date (Month YYYY)" className={inputBaseClasses}/>
                                    </div>
                                    <textarea value={item.description} onChange={e => handleArrayChange(sectionInfo.key, i, 'description', e.target.value)} placeholder="Description" rows={3} className={inputBaseClasses}/>
                                </div>
                                <button onClick={() => removeArrayItem(sectionInfo.key, i)} className="text-gray-400 hover:text-red-500 mt-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button onClick={() => addArrayItem(sectionInfo.key)} className="flex items-center text-sm font-semibold text-primary"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add {sectionInfo.title.slice(0, -1)}</button>
                    </div>
                ) : (
                    <div className="space-y-4 text-gray-700 dark:text-secondary-content">
                        {(userProfile[sectionInfo.key] as Experience[] || []).length > 0 ? (
                           (userProfile[sectionInfo.key] as Experience[]).map((item, i) => (
                               <div key={i}>
                                   <p className="font-semibold">{item.role} at {item.company}</p>
                                   <p className="text-sm text-gray-500 dark:text-base-content">{item.startDate} - {item.endDate}</p>
                                   <p className="mt-1 text-gray-600 dark:text-base-content whitespace-pre-wrap">{item.description}</p>
                               </div>
                           ))
                        ) : <p className="text-gray-500 dark:text-base-content">No {sectionInfo.title.toLowerCase()} added yet.</p>}
                    </div>
                )}
            </Section>
        ))}

        {/* Education */}
        <Section id="education-section" icon={<GraduationCapIcon className="w-6 h-6" />} title="Education">
            {isEditing ? (
                <div className="space-y-6">
                    {/* Undergraduate */}
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-secondary-content mb-2">Undergraduate</h4>
                        <div className="space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-secondary-focus/50 dark:border-secondary-focus">
                            <input value={formData?.education?.undergraduate?.institution || ''} onChange={e => handleEducationChange('undergraduate', 'institution', e.target.value)} placeholder="University/College Name" className={inputBaseClasses}/>
                            <input value={formData?.education?.undergraduate?.degree || ''} onChange={e => handleEducationChange('undergraduate', 'degree', e.target.value)} placeholder="e.g., Bachelor of Technology" className={inputBaseClasses}/>
                            <input value={formData?.education?.undergraduate?.fieldOfStudy || ''} onChange={e => handleEducationChange('undergraduate', 'fieldOfStudy', e.target.value)} placeholder="e.g., Computer Science" className={inputBaseClasses}/>
                            <div className="grid grid-cols-3 gap-2">
                                <select value={formData?.education?.undergraduate?.startYear || ''} onChange={e => handleEducationChange('undergraduate', 'startYear', e.target.value)} className={inputBaseClasses}>
                                    <option value="" disabled>Start Year</option>
                                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <select value={formData?.education?.undergraduate?.endYear || ''} onChange={e => handleEducationChange('undergraduate', 'endYear', e.target.value)} className={inputBaseClasses}>
                                    <option value="" disabled>End Year</option>
                                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <input value={formData?.education?.undergraduate?.score || ''} onChange={e => handleEducationChange('undergraduate', 'score', e.target.value)} placeholder="Score/CGPA" className={inputBaseClasses}/>
                            </div>
                        </div>
                    </div>
                     {/* 12th */}
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-secondary-content mb-2">12th Standard</h4>
                         <div className="space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-secondary-focus/50 dark:border-secondary-focus">
                            <input value={formData?.education?.twelfth?.institution || ''} onChange={e => handleEducationChange('twelfth', 'institution', e.target.value)} placeholder="School Name" className={inputBaseClasses}/>
                            <div className="grid grid-cols-3 gap-2">
                               <input value={formData?.education?.twelfth?.board || ''} onChange={e => handleEducationChange('twelfth', 'board', e.target.value)} placeholder="Board (e.g., CBSE)" className={inputBaseClasses}/>
                               <select value={formData?.education?.twelfth?.year || ''} onChange={e => handleEducationChange('twelfth', 'year', e.target.value)} className={inputBaseClasses}>
                                    <option value="" disabled>Year of Completion</option>
                                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                               <input value={formData?.education?.twelfth?.score || ''} onChange={e => handleEducationChange('twelfth', 'score', e.target.value)} placeholder="Score (e.g., 95%)" className={inputBaseClasses}/>
                            </div>
                         </div>
                    </div>
                     {/* 10th */}
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-secondary-content mb-2">10th Standard</h4>
                         <div className="space-y-2 p-4 border rounded-md bg-gray-50 dark:bg-secondary-focus/50 dark:border-secondary-focus">
                            <input value={formData?.education?.tenth?.institution || ''} onChange={e => handleEducationChange('tenth', 'institution', e.target.value)} placeholder="School Name" className={inputBaseClasses}/>
                            <div className="grid grid-cols-3 gap-2">
                               <input value={formData?.education?.tenth?.board || ''} onChange={e => handleEducationChange('tenth', 'board', e.target.value)} placeholder="Board (e.g., CBSE)" className={inputBaseClasses}/>
                               <select value={formData?.education?.tenth?.year || ''} onChange={e => handleEducationChange('tenth', 'year', e.target.value)} className={inputBaseClasses}>
                                    <option value="" disabled>Year of Completion</option>
                                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                               <input value={formData?.education?.tenth?.score || ''} onChange={e => handleEducationChange('tenth', 'score', e.target.value)} placeholder="Score (e.g., 95%)" className={inputBaseClasses}/>
                            </div>
                         </div>
                    </div>
                </div>
            ) : (
                isEducationValid ? (
                     <div className="space-y-4 text-gray-700 dark:text-secondary-content">
                        {userProfile.education.undergraduate?.institution ? (
                            <div>
                                <p className="font-bold">{userProfile.education.undergraduate.institution}</p>
                                <p className="text-sm">{userProfile.education.undergraduate.degree}, {userProfile.education.undergraduate.fieldOfStudy}</p>
                                <p className="text-xs text-gray-500 dark:text-base-content">{userProfile.education.undergraduate.startYear} - {userProfile.education.undergraduate.endYear} &middot; Score: {userProfile.education.undergraduate.score}</p>
                            </div>
                        ) : <p className="text-gray-500 dark:text-base-content">No undergraduate details provided.</p>}
                        {userProfile.education.twelfth?.institution ? (
                            <div>
                                <p className="font-bold">{userProfile.education.twelfth.institution}</p>
                                <p className="text-xs text-gray-500 dark:text-base-content">{userProfile.education.twelfth.board} &middot; {userProfile.education.twelfth.year} &middot; Score: {userProfile.education.twelfth.score}</p>
                            </div>
                         ) : <p className="text-gray-500 dark:text-base-content">No 12th grade details provided.</p>}
                        {userProfile.education.tenth?.institution ? (
                            <div>
                                <p className="font-bold">{userProfile.education.tenth.institution}</p>
                                <p className="text-xs text-gray-500 dark:text-base-content">{userProfile.education.tenth.board} &middot; {userProfile.education.tenth.year} &middot; Score: {userProfile.education.tenth.score}</p>
                            </div>
                        ) : <p className="text-gray-500 dark:text-base-content">No 10th grade details provided.</p>}
                    </div>
                ) : <p className="text-gray-500 dark:text-base-content">No education details provided.</p>
            )}
        </Section>

        {/* Relevant Coursework */}
        <Section id="relevant-coursework-section" icon={<BookOpenIcon className="w-6 h-6" />} title="Relevant Coursework">
            {isEditing ? (
                <div className="p-2 border border-gray-300 dark:border-secondary-focus rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(formData?.relevantCoursework || []).map((course, index) => (
                            <div key={index} className="flex items-center bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content text-sm font-medium px-3 py-1 rounded-full">
                                <span>{course}</span>
                                <button onClick={() => handleRemoveCoursework(index)} className="ml-2 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={courseworkInput}
                        onChange={(e) => setCourseworkInput(e.target.value)}
                        onKeyDown={handleCourseworkInputKeyDown}
                        placeholder="+ Add course and press Enter"
                        className="w-full bg-transparent border-none focus:ring-0 p-1 text-sm text-gray-800 dark:text-secondary-content placeholder-gray-500 dark:placeholder-gray-500"
                    />
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {(userProfile.relevantCoursework || []).length > 0 ? (
                        userProfile.relevantCoursework?.map(course => (
                            <span key={course} className="bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content text-sm font-medium px-3 py-1.5 rounded-full">{course}</span>
                        ))
                    ) : <p className="text-gray-500 dark:text-base-content">No relevant coursework listed.</p>}
                </div>
            )}
        </Section>
        
        {/* Languages, Certs, Achievements - Dynamic Sections */}
        {[
            { key: 'responsibilities' as const, title: 'Positions of Responsibility', icon: <UsersIcon className="w-6 h-6" />, component: (item: Responsibility, i: number) =>
                <div className="space-y-2">
                    <input value={item.role} onChange={e => handleArrayChange('responsibilities', i, 'role', e.target.value)} placeholder="Role (e.g., President)" className={inputBaseClasses}/>
                    <input value={item.organization} onChange={e => handleArrayChange('responsibilities', i, 'organization', e.target.value)} placeholder="Organization (e.g., Coding Club)" className={inputBaseClasses}/>
                    <textarea value={item.description} onChange={e => handleArrayChange('responsibilities', i, 'description', e.target.value)} placeholder="Description" rows={2} className={inputBaseClasses}/>
                </div>
            },
            { key: 'projects' as const, title: 'Projects', icon: <CodeBracketIcon className="w-6 h-6" />, component: (item: Project, i: number) =>
                <div className="space-y-2">
                    <input value={item.name} onChange={e => handleArrayChange('projects', i, 'name', e.target.value)} placeholder="Project Name" className={inputBaseClasses}/>
                    <textarea value={item.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} placeholder="Description" rows={2} className={inputBaseClasses}/>
                    <input value={(Array.isArray(item.skills) ? item.skills.join(', ') : '')} onChange={e => handleArrayChange('projects', i, 'skills', e.target.value.split(',').map(s => s.trim()))} placeholder="Skills (comma-separated)" className={inputBaseClasses}/>
                    <div>
                        <input
                            type="url"
                            value={item.link || ''}
                            onChange={e => handleProjectUrlChange(i, e.target.value)}
                            placeholder="Project URL (Optional)"
                            className={`${inputBaseClasses} ${projectUrlErrors[i] ? 'border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {projectUrlErrors[i] && <p className="mt-1 text-xs text-red-600">{projectUrlErrors[i]}</p>}
                    </div>
                </div>
            },
            { key: 'languages' as const, title: 'Languages', icon: <LanguageIcon className="w-6 h-6" />, component: (item: Language, i: number) => 
                <div className="grid grid-cols-2 gap-2">
                    <input value={item.name} onChange={e => handleArrayChange('languages', i, 'name', e.target.value)} placeholder="Language" className={inputBaseClasses}/>
                    <select value={item.proficiency} onChange={e => handleArrayChange('languages', i, 'proficiency', e.target.value as Language['proficiency'])} className={inputBaseClasses}>
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Native</option>
                    </select>
                </div>
            },
            { key: 'certifications' as const, title: 'Certifications', icon: <IdentificationIcon className="w-6 h-6" />, component: (item: Certification, i: number) => 
                 <div className="space-y-2">
                    <input value={item.name} onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)} placeholder="Certification Name" className={inputBaseClasses}/>
                    <input value={item.issuingBody} onChange={e => handleArrayChange('certifications', i, 'issuingBody', e.target.value)} placeholder="Issuing Body" className={inputBaseClasses}/>
                    <input value={item.date} onChange={e => handleArrayChange('certifications', i, 'date', e.target.value)} placeholder="Date (Month YYYY)" className={inputBaseClasses}/>
                    <input value={item.credentialUrl || ''} onChange={e => handleArrayChange('certifications', i, 'credentialUrl', e.target.value)} placeholder="Credential URL (Optional)" className={inputBaseClasses}/>
                </div>
            },
            { key: 'achievements' as const, title: 'Achievements', icon: <TrophyIcon className="w-6 h-6" />, component: (item: Achievement, i: number) =>
                <div className="space-y-2">
                    <input value={item.title} onChange={e => handleArrayChange('achievements', i, 'title', e.target.value)} placeholder="Achievement Title" className={inputBaseClasses}/>
                    <textarea value={item.description} onChange={e => handleArrayChange('achievements', i, 'description', e.target.value)} placeholder="Description" rows={2} className={inputBaseClasses}/>
                    <input value={item.date} onChange={e => handleArrayChange('achievements', i, 'date', e.target.value)} placeholder="Date (Month YYYY)" className={inputBaseClasses}/>
                </div>
            },
        ].map(sectionInfo => (
            <Section key={sectionInfo.key} id={`${sectionInfo.key}-section`} icon={sectionInfo.icon} title={sectionInfo.title}>
                {isEditing ? (
                    <div className="space-y-4">
                        {(formData?.[sectionInfo.key] as any[] || []).map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 border rounded-md bg-gray-50 dark:bg-secondary-focus/50 dark:border-secondary-focus">
                                <div className="flex-grow">{sectionInfo.component(item, i)}</div>
                                <button onClick={() => removeArrayItem(sectionInfo.key, i)} className="text-gray-400 hover:text-red-500 mt-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button onClick={() => addArrayItem(sectionInfo.key)} className="flex items-center text-sm font-semibold text-primary"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add {sectionInfo.title.slice(0, -1)}</button>
                    </div>
                ) : (
                    <div className="space-y-4 text-gray-700 dark:text-secondary-content">
                        {(userProfile[sectionInfo.key] as any[] || []).length > 0 ? (
                           (userProfile[sectionInfo.key] as any[]).map((item: any, i) => (
                               <div key={i}>
                                   {sectionInfo.key === 'languages' ? (
                                        <div className="flex items-baseline gap-3">
                                            <p className="font-semibold">{item.name}</p>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content">{item.proficiency}</span>
                                        </div>
                                    ) : (
                                        <p className="font-semibold">{item.name || item.title || item.role} <span className="text-sm font-normal text-gray-500 dark:text-base-content">{item.organization && ` at ${item.organization}`} {item.date && `- ${item.date}`}</span></p>
                                    )}
                                   {item.issuingBody && <p className="text-gray-600 dark:text-base-content">{item.issuingBody}</p>}
                                   {item.description && <p className="text-gray-600 dark:text-base-content whitespace-pre-wrap">{item.description}</p>}
                                   {sectionInfo.key === 'projects' && (
                                     <>
                                       {item.skills && Array.isArray(item.skills) && item.skills.length > 0 && (
                                         <div className="mt-2 flex flex-wrap gap-2">
                                           {item.skills.map((skill: string) => (
                                             <span key={skill} className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary dark:bg-secondary-focus text-secondary-content dark:text-secondary-content">{skill}</span>
                                           ))}
                                         </div>
                                       )}
                                       {item.link && (
                                         <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-primary hover:underline inline-flex items-center gap-1">
                                           <LinkIcon className="w-4 h-4"/>
                                           View Project
                                         </a>
                                       )}
                                     </>
                                   )}
                               </div>
                           ))
                        ) : <p className="text-gray-500 dark:text-base-content">No {sectionInfo.title.toLowerCase()} added yet.</p>}
                    </div>
                )}
            </Section>
        ))}

        {/* Links */}
        <Section id="links-section" icon={<LinkIcon className="w-6 h-6" />} title="Professional Links">
             {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 dark:text-secondary-content mb-1">LinkedIn Profile URL</label>
                        <input id="linkedin-url" type="url" placeholder="https://linkedin.com/in/..." value={formData?.links?.linkedIn || ''} onChange={e => handleNestedChange('links', 'linkedIn', e.target.value)} className={inputBaseClasses}/>
                    </div>
                    <div>
                        <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 dark:text-secondary-content mb-1">GitHub Profile URL</label>
                        <input id="github-url" type="url" placeholder="https://github.com/..." value={formData?.links?.github || ''} onChange={e => handleNestedChange('links', 'github', e.target.value)} className={inputBaseClasses}/>
                    </div>
                    <div>
                        <label htmlFor="portfolio-url" className="block text-sm font-medium text-gray-700 dark:text-secondary-content mb-1">Portfolio/Website URL</label>
                        <input id="portfolio-url" type="url" placeholder="https://your-portfolio.com" value={formData?.links?.portfolio || ''} onChange={e => handleNestedChange('links', 'portfolio', e.target.value)} className={inputBaseClasses}/>
                    </div>
                </div>
            ) : (
                hasLinks ? (
                    <div className="flex flex-col space-y-3">
                        {userProfile.links?.linkedIn && (
                            <a href={userProfile.links.linkedIn} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-gray-700 dark:text-secondary-content hover:text-primary transition-colors font-medium group break-all">
                                <LinkedinIcon className="w-6 h-6 text-gray-400 dark:text-base-content group-hover:text-primary flex-shrink-0" />
                                <span>{userProfile.links.linkedIn}</span>
                            </a>
                        )}
                        {userProfile.links?.github && (
                            <a href={userProfile.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-gray-700 dark:text-secondary-content hover:text-primary transition-colors font-medium group break-all">
                                <GitHubIcon className="w-6 h-6 text-gray-400 dark:text-base-content group-hover:text-primary flex-shrink-0" />
                                <span>{userProfile.links.github}</span>
                            </a>
                        )}
                        {userProfile.links?.portfolio && (
                            <a href={userProfile.links.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-gray-700 dark:text-secondary-content hover:text-primary transition-colors font-medium group break-all">
                                <LinkIcon className="w-6 h-6 text-gray-400 dark:text-base-content group-hover:text-primary flex-shrink-0" />
                                <span>{userProfile.links.portfolio}</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-base-content">No links provided.</p>
                )
            )}
        </Section>
        
        {/* Career Preferences */}
        <Section id="career-preferences-section" icon={<TargetIcon className="w-6 h-6" />} title="Career Preferences">
            {isEditing ? (
                 <div className="space-y-4">
                     <input type="text" placeholder="Desired Roles (comma-separated)" value={formData?.careerPreferences?.desiredRoles?.join(', ') || ''} onChange={e => handleNestedChange('careerPreferences', 'desiredRoles', e.target.value.split(',').map(s => s.trim()))} className={inputBaseClasses}/>
                     <input type="text" placeholder="Preferred Locations (comma-separated)" value={formData?.careerPreferences?.locations?.join(', ') || ''} onChange={e => handleNestedChange('careerPreferences', 'locations', e.target.value.split(',').map(s => s.trim()))} className={inputBaseClasses}/>
                      <select value={formData?.careerPreferences?.availability} onChange={e => handleNestedChange('careerPreferences', 'availability', e.target.value)} className={inputBaseClasses}>
                        <option>Immediately</option>
                        <option>In 1 Month</option>
                        <option>In 3 Months</option>
                        <option>Flexible</option>
                      </select>
                 </div>
            ) : (
                <div className="space-y-2 text-gray-700 dark:text-secondary-content">
                    <p><strong>Desired Roles:</strong> {userProfile.careerPreferences?.desiredRoles?.join(', ') || 'Not specified'}</p>
                    <p><strong>Preferred Locations:</strong> {userProfile.careerPreferences?.locations?.join(', ') || 'Not specified'}</p>
                    <p><strong>Availability:</strong> {userProfile.careerPreferences?.availability || 'Not specified'}</p>
                </div>
            )}
        </Section>
        
        {/* Danger Zone */}
        <div className="mt-10 border-t border-red-300 dark:border-red-500/30 pt-6">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-500">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-base-content mt-1">This will permanently delete your profile data and cannot be undone.</p>
            <button onClick={() => { if (window.confirm('Are you sure you want to permanently delete your profile?')) { onClearProfile(); } }} className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear My Profile
            </button>
        </div>
    </div>
  );
};

export default UserProfilePage;