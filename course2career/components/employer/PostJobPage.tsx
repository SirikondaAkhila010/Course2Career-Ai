import React, { useState } from 'react';
import type { EmployerProfile, Job, JobStatus, Page } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { generateJobDescriptionWithAI } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';

type JobPostData = Omit<Job, 'id' | 'company' | 'companyLogo'>;

interface PostJobPageProps {
  employerProfile: EmployerProfile | null;
  onPostJob: (jobData: JobPostData) => void;
  onNavigate: (page: Page) => void;
}

const PostJobPage: React.FC<PostJobPageProps> = ({ employerProfile, onPostJob, onNavigate }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [salary, setSalary] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!title || !skills) {
      setError("Please provide a Job Title and Required Skills to generate a description.");
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const generatedDesc = await generateJobDescriptionWithAI(
        title,
        skills.split(',').map(s => s.trim()),
        employerProfile?.companyName || 'our company',
        employerProfile?.companyDescription
      );
      setDescription(generatedDesc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed to generate a description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !skills || !description || !applyUrl) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');

    const newJobData: JobPostData = {
      title,
      location,
      type: jobType,
      salary,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      description,
      applyUrl,
      status,
    };
    onPostJob(newJobData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-up max-w-4xl mx-auto">
      <button onClick={() => onNavigate('employer-find-talent')} className="text-sm font-semibold text-primary hover:underline mb-4">
        &larr; Back to My Postings
      </button>
      <div className="flex items-center mb-8 border-t pt-4">
        <BriefcaseIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900">Post a New Job</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">Job Title</label>
            <input type="text" id="job-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" id="company-name" value={employerProfile?.companyName || ''} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="job-type" className="block text-sm font-medium text-gray-700">Job Type</label>
            <select id="job-type" value={jobType} onChange={e => setJobType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary Range (Optional)</label>
            <input type="text" id="salary" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g., $80,000 - $100,000 per year" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
           <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Posting Status</label>
              <div className="mt-2 flex items-center space-x-6">
                <div className="flex items-center">
                  <input id="status-none" name="status" type="radio" checked={status === null} onChange={() => setStatus(null)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                  <label htmlFor="status-none" className="ml-3 block text-sm font-medium text-gray-700">Standard</label>
                </div>
                <div className="flex items-center">
                  <input id="status-urgent" name="status" type="radio" checked={status === 'Urgent'} onChange={() => setStatus('Urgent')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                  <label htmlFor="status-urgent" className="ml-3 block text-sm font-medium text-gray-700">Urgent</label>
                </div>
                <div className="flex items-center">
                  <input id="status-featured" name="status" type="radio" checked={status === 'Featured'} onChange={() => setStatus('Featured')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                  <label htmlFor="status-featured" className="ml-3 block text-sm font-medium text-gray-700">Featured</label>
                </div>
              </div>
            </div>
          <div className="md:col-span-2">
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills</label>
            <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} required placeholder="e.g., React, Node.js, TypeScript" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            <p className="mt-1 text-xs text-gray-500">Provide a comma-separated list of skills to power the AI description generator.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !title.trim() || !skills.trim()}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={12} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100" disabled={isGenerating}/>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="apply-url" className="block text-sm font-medium text-gray-700">Application URL</label>
            <input type="url" id="apply-url" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} required placeholder="https://yourcompany.com/apply" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="text-right mt-8">
          <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus">
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJobPage;