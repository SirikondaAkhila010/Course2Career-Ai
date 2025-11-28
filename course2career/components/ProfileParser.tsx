import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { parseResumeWithAI } from '../services/geminiService';
import { UserIcon } from './icons/UserIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ProfileParserProps {
  onProfileParsed: (profile: UserProfile) => void;
  onManualEntry: () => void;
}

const ProfileParser: React.FC<ProfileParserProps> = ({ onProfileParsed, onManualEntry }) => {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'auto' | 'manual'>('auto');

  const handleParse = async () => {
    if (!resumeText.trim()) {
      setError('Please paste or upload your resume text.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const profile = await parseResumeWithAI(resumeText);
      onProfileParsed(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
    } else if (e.type === 'dragleave') {
        setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };


  return (
    <div className="bg-white dark:bg-secondary p-8 rounded-lg shadow-lg animate-fade-in-up max-w-4xl mx-auto space-y-6">
      <div className="flex items-center">
        <UserIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900 dark:text-white">Profile Setup</h2>
      </div>
      <p className="text-lg text-gray-600 dark:text-base-content">
        Choose how you want to build your profile. Upload a resume for instant autofill or take full control with manual entry.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedOption('auto')}
          className={`rounded-2xl border p-5 text-left transition-all ${selectedOption === 'auto' ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-secondary-focus'}`}
        >
          <div className="flex items-center gap-3">
            <UploadIcon className={`h-10 w-10 ${selectedOption === 'auto' ? 'text-primary' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">Autofill</p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Resume</h3>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-secondary-content/80">
            Let AI parse your resume and build your profile automatically in seconds.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedOption('manual')}
          className={`rounded-2xl border p-5 text-left transition-all ${selectedOption === 'manual' ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-secondary-focus'}`}
        >
          <div className="flex items-center gap-3">
            <UserIcon className={`h-10 w-10 ${selectedOption === 'manual' ? 'text-primary' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">Manual</p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Fill It Yourself</h3>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-secondary-content/80">
            Prefer to craft your profile section by section? Jump into the editor.
          </p>
        </button>
      </div>

      {selectedOption === 'auto' ? (
        <div className="space-y-4">
          <div 
            onDrop={handleDrop}
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
            className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-secondary-focus'}`}
          >
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full h-64 p-3 border-none rounded-md focus:ring-0 focus:outline-none bg-transparent resize-none text-gray-800 dark:text-secondary-content placeholder-gray-500 dark:placeholder-gray-500"
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4">
              <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-secondary-focus text-sm font-medium rounded-md text-gray-700 dark:text-secondary-content bg-white dark:bg-secondary-focus hover:bg-gray-50 dark:hover:bg-opacity-80">
                <UploadIcon className="w-5 h-5 mr-2" />
                Upload File
              </label>
              <input id="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.pdf,.doc,.docx" />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <button
            onClick={handleParse}
            disabled={isLoading || !resumeText.trim()}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-gray-400 dark:disabled:bg-secondary-focus disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Parsing Profile...
              </>
            ) : (
               <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Autofill from Resume
               </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-secondary-focus p-6 text-center space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Manual Profile Builder</h3>
          <p className="text-gray-600 dark:text-secondary-content/80">
            We&apos;ll take you to the profile editor where you can add your experience, education, and skills at your own pace.
          </p>
          <ul className="text-sm text-gray-600 dark:text-secondary-content/80 space-y-1">
            <li>• Edit sections step-by-step</li>
            <li>• Save progress anytime</li>
            <li>• Preview changes instantly</li>
          </ul>
          <button
            onClick={onManualEntry}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus"
          >
            Start Manual Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileParser;