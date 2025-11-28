import React, { useState, useEffect } from 'react';
import type { Page, UserProfile, Experience } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { improveResumeSectionWithAI, generateResumeContentWithAI } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { XIcon } from './icons/XIcon';

interface ResumeBuilderPageProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate: (page: Page) => void;
}

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "AI is working..." }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-base-content">
        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);

const ResumeBuilderPage: React.FC<ResumeBuilderPageProps> = ({ userProfile, onUpdateProfile, onNavigate }) => {
  const [formData, setFormData] = useState<UserProfile | null>(userProfile);
  const [resumePreview, setResumePreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvingSection, setImprovingSection] = useState<string | null>(null); // e.g., 'summary' or 'experience-0'
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);
  
  useEffect(() => {
    const generatePreview = async () => {
        if (formData) {
            setIsGenerating(true);
            try {
                const content = await generateResumeContentWithAI(formData);
                setResumePreview(content);
            } catch (error) {
                console.error(error);
                setResumePreview("Error generating preview.");
            } finally {
                setIsGenerating(false);
            }
        }
    };
    // Debounce the preview generation to avoid too many API calls
    const handler = setTimeout(() => {
        generatePreview();
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [formData]);


  if (!formData) {
    return (
      <div className="text-center p-8 bg-white dark:bg-secondary rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-secondary-content">No Profile Found</h2>
        <p className="mt-2 text-gray-500 dark:text-base-content">Create your profile to use the Resume Builder.</p>
        <button onClick={() => onNavigate('profile-parser')} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
          Build Profile with AI
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => {
        if (!prev) return null;
        const newExperience = [...prev.experience];
        newExperience[index] = { ...newExperience[index], [field]: value };
        return { ...prev, experience: newExperience };
    });
  };
  
  const handleImproveWithAI = async (section: 'summary' | 'experience', index?: number) => {
      const sectionId = section === 'experience' && index !== undefined ? `experience-${index}` : 'summary';
      setImprovingSection(sectionId);

      let textToImprove = '';
      if (section === 'summary') {
          textToImprove = formData.summary;
      } else if (section === 'experience' && index !== undefined) {
          textToImprove = formData.experience[index].description;
      }
      
      if (!textToImprove) {
          setImprovingSection(null);
          return;
      }

      try {
          const improvedText = await improveResumeSectionWithAI(textToImprove, section);
          if (section === 'summary') {
              setFormData(prev => prev ? { ...prev, summary: improvedText } : null);
          } else if (section === 'experience' && index !== undefined) {
              handleExperienceChange(index, 'description', improvedText);
          }
      } catch (error) {
          console.error("Failed to improve section with AI", error);
      } finally {
          setImprovingSection(null);
      }
  };

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.find(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
        setFormData(prev => prev ? { ...prev, skills: [...prev.skills, trimmedSkill] } : null);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => prev ? { ...prev, skills: prev.skills.filter((_, i) => i !== index) } : null);
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSkill(skillInput);
    }
  };

  const handleSaveChanges = () => {
    if (formData) {
        onUpdateProfile(formData);
        alert("Profile changes have been saved!");
    }
  };

  const inputStyles = "mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-secondary-focus dark:border-secondary-focus/50 dark:text-secondary-content";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-base-content";


  return (
    <div className="bg-white dark:bg-secondary p-8 rounded-lg shadow-lg max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <DocumentTextIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900 dark:text-white">AI Resume Builder</h2>
      </div>
      <p className="text-gray-600 dark:text-base-content mb-8">Edit your profile details below. The resume preview on the right will update in real-time. Use the AI assistant to improve your content.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Column */}
        <div className="space-y-6 h-[70vh] overflow-y-auto pr-4">
          <div>
            <label className={labelStyles}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputStyles} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className={labelStyles}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyles} />
             </div>
             <div>
                <label className={labelStyles}>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyles} />
             </div>
          </div>
          <div>
              <div className="flex justify-between items-center mb-1">
                  <label className={labelStyles}>Summary</label>
                  <button onClick={() => handleImproveWithAI('summary')} disabled={improvingSection === 'summary'} className="text-xs inline-flex items-center font-semibold text-primary disabled:opacity-50 disabled:cursor-wait">
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      {improvingSection === 'summary' ? 'Improving...' : 'Improve with AI'}
                  </button>
              </div>
              <textarea name="summary" value={formData.summary} onChange={handleInputChange} rows={5} className={inputStyles} />
          </div>
           <div>
            <label className={labelStyles}>Skills</label>
            <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-secondary-focus rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
                        <span>{skill}</span>
                        <button onClick={() => handleRemoveSkill(index)} className="ml-2 p-0.5 rounded-full hover:bg-primary/20" aria-label={`Remove ${skill}`}>
                            <XIcon className="w-3 h-3"/>
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder={formData.skills.length === 0 ? "Add a skill and press Enter" : "+ Add skill"}
                    className="flex-grow bg-transparent border-none focus:ring-0 p-1 text-sm dark:text-secondary-content"
                />
            </div>
          </div>
          <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-secondary-focus pb-2 mb-4">Experience</h3>
              {formData.experience.map((exp, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-secondary-focus rounded-md mb-4 bg-gray-50 dark:bg-secondary-focus/50 space-y-2">
                      <input value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} placeholder="Role" className={`${inputStyles} font-semibold`}/>
                      <input value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} placeholder="Company" className={inputStyles}/>
                      <div className="flex gap-2">
                        <input value={exp.startDate} onChange={e => handleExperienceChange(index, 'startDate', e.target.value)} placeholder="Start Date" className={inputStyles}/>
                        <input value={exp.endDate} onChange={e => handleExperienceChange(index, 'endDate', e.target.value)} placeholder="End Date" className={inputStyles}/>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <label className="text-sm font-medium text-gray-600 dark:text-base-content">Description</label>
                         <button onClick={() => handleImproveWithAI('experience', index)} disabled={improvingSection === `experience-${index}`} className="text-xs inline-flex items-center font-semibold text-primary disabled:opacity-50 disabled:cursor-wait">
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            {improvingSection === `experience-${index}` ? 'Improving...' : 'Improve'}
                         </button>
                      </div>
                      <textarea value={exp.description} onChange={e => handleExperienceChange(index, 'description', e.target.value)} rows={4} className={inputStyles}/>
                  </div>
              ))}
          </div>

          <button onClick={handleSaveChanges} className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus sticky bottom-0">
              Save Profile Changes
          </button>
        </div>

        {/* Preview Column */}
        <div className="border border-gray-200 dark:border-secondary-focus rounded-lg p-6 bg-gray-50 dark:bg-base-100/50 h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-secondary-content border-b dark:border-secondary-focus pb-3 mb-4 sticky top-0 bg-gray-50/80 dark:bg-base-100/80 backdrop-blur-sm -mx-6 -mt-6 px-6 pt-6">Resume Preview</h3>
            {isGenerating && improvingSection === null ? (
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinner text="Generating preview..." />
                </div>
            ) : (
                <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer text={resumePreview} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;