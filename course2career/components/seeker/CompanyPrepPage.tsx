
import React, { useState } from 'react';
import type { Page, CompanyPrepInfo } from '../../types';
import { MOCK_JOBS } from '../../constants';
import { getCompanyPrepInfoWithAI } from '../../services/geminiService';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import MarkdownRenderer from '../MarkdownRenderer';

interface CompanyPrepPageProps {
  onNavigate: (page: Page) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-2 py-10">
        <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
        <span className="text-base-content text-sm">AI is generating your prep guide...</span>
    </div>
);

const CompanyPrepPage: React.FC<CompanyPrepPageProps> = ({ onNavigate }) => {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [prepInfo, setPrepInfo] = useState<CompanyPrepInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const uniqueCompanies = [...new Set(MOCK_JOBS.map(job => job.company))];

  const handleGeneratePrep = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Please select a company and enter a job title.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setPrepInfo(null);
    try {
      const info = await getCompanyPrepInfoWithAI(companyName, jobTitle);
      setPrepInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-secondary p-8 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center mb-6">
        <BuildingOfficeIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-secondary-content">AI Company Prep</h2>
      </div>
      <p className="text-base-content mb-8">
        Get the inside edge. Select a company and enter a job title to get AI-powered insights, interview questions, and talking points.
      </p>

      <div className="bg-base-100 p-6 rounded-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company-select" className="block text-sm font-medium text-base-content mb-1">Company</label>
            <select
              id="company-select"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="block w-full py-2 px-3 border border-secondary-focus bg-secondary rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Select a company</option>
              {uniqueCompanies.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="job-title-input" className="block text-sm font-medium text-base-content mb-1">Job Title</label>
            <input
              id="job-title-input"
              type="text"
              placeholder="e.g., Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-focus rounded-md bg-secondary shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
         <button
            onClick={handleGeneratePrep}
            disabled={isLoading || !companyName.trim() || !jobTitle.trim()}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Prep Guide'}
        </button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
      
      {isLoading && <LoadingSpinner />}

      {prepInfo && !isLoading && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="p-6 bg-base-100 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Company Overview</h3>
            <MarkdownRenderer text={prepInfo.overview} />
          </div>
          <div className="p-6 bg-base-100 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Potential Interview Questions</h3>
            <ul className="space-y-3 list-disc list-inside">
                {prepInfo.interviewQuestions.map((q, i) => <li key={i} className="text-base-content">{q}</li>)}
            </ul>
          </div>
          <div className="p-6 bg-base-100 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Latest News & Talking Points</h3>
            <MarkdownRenderer text={prepInfo.latestNews} />
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyPrepPage;
