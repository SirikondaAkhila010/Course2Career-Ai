
import React from 'react';
import type { Job, Application, Page, EmployerProfile } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';

interface FindTalentPageProps {
  employerProfile: EmployerProfile | null;
  postedJobs: Job[];
  applications: Application[];
  onViewApplicants: (job: Job) => void;
  onNavigate: (page: Page) => void;
}

const FindTalentPage: React.FC<FindTalentPageProps> = ({ employerProfile, postedJobs, applications, onViewApplicants, onNavigate }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-up max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <BriefcaseIcon className="h-10 w-10 text-primary" />
                <h2 className="ml-4 text-3xl font-bold text-gray-900">My Job Postings</h2>
            </div>
            <button
                onClick={() => onNavigate('employer-post-job')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
                Post a New Job
            </button>
        </div>
        
        {postedJobs.length > 0 ? (
            <div className="space-y-4">
                {postedJobs.map(job => {
                    const applicantCount = applications.filter(app => app.jobId === job.id).length;
                    return (
                        <div key={job.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50 hover:shadow-sm transition-shadow">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-gray-800">{job.title}</p>
                                    {employerProfile?.isVerified && <BadgeCheckIcon className="w-5 h-5 text-primary" title="Verified Company"/>}
                                    {job.status === 'Urgent' && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800">Urgent</span>}
                                    {job.status === 'Featured' && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">Featured</span>}
                                </div>
                                <p className="text-sm text-gray-600">{job.location} &middot; <span className="font-semibold">{job.type}</span></p>
                                <div className="flex items-center mt-2 text-sm text-primary font-semibold">
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    <span>{applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onViewApplicants(job)}
                                className="text-sm font-semibold text-white bg-primary rounded-md px-4 py-2 hover:bg-primary-focus transition-colors"
                            >
                                View Applicants
                            </button>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">You haven't posted any jobs yet.</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by posting your first job opening.</p>
                <button
                    onClick={() => onNavigate('employer-post-job')}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Post First Job
                </button>
            </div>
        )}
    </div>
  );
};

export default FindTalentPage;
