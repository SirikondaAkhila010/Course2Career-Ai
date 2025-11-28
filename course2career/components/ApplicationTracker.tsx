
import React from 'react';
import type { Job, ApplicationStatus, Page } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface ApplicationTrackerProps {
  trackedJobs: Job[];
  applicationStatuses: Record<number, ApplicationStatus>;
  onNavigate: (page: Page) => void;
}

const statusStyles: Record<ApplicationStatus, { bg: string, text: string, ring: string }> = {
    'Applied': { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-200' },
    'Viewed': { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-200' },
    'Shortlisted': { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-200' },
    'Interviewing': { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-200' },
    'Offered': { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-200' },
    'Rejected': { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-200' }
};

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ trackedJobs, applicationStatuses, onNavigate }) => {
  return (
    <div className="bg-secondary shadow rounded-lg p-8 border border-secondary-focus h-full">
        <div className="flex items-center mb-4">
            <BriefcaseIcon className="h-8 w-8 text-primary" />
            <h2 className="ml-4 text-2xl font-bold text-secondary-content">My Applications</h2>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {trackedJobs.map(job => (
                <div key={job.id} className="p-4 border border-secondary-focus rounded-md flex justify-between items-center bg-base-100/50 animate-fade-in">
                    <div>
                        <p className="font-bold text-secondary-content">{job.title}</p>
                        <p className="text-sm text-base-content">{job.company}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ring-2 ring-opacity-50 ${statusStyles[applicationStatuses[job.id]].bg} ${statusStyles[applicationStatuses[job.id]].text} ${statusStyles[applicationStatuses[job.id]].ring}`}>
                        {applicationStatuses[job.id]}
                    </span>
                </div>
            ))}
        </div>
         <div className="mt-4 text-center">
            <button
                onClick={() => onNavigate('job-search')}
                className="text-sm font-semibold text-primary hover:underline"
            >
                View all jobs &rarr;
            </button>
        </div>
    </div>
  );
};

export default ApplicationTracker;
