
import React, { useState, useEffect, useMemo } from 'react';
import type { Job, Application, UserProfile, Page, ApplicantRanking, ApplicantStatus } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { UserIcon } from '../icons/UserIcon';
import ApplicantDetailModal from './ApplicantDetailModal';
import { rankApplicantsWithAI } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { calculateSkillMatch } from '../../utils';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';

interface ViewApplicantsPageProps {
  job: Job;
  applications: Application[];
  onNavigate: (page: Page) => void;
  onUpdateStatus: (jobId: number, userEmail: string, status: ApplicantStatus) => void;
}

const applicantStatusStyles: Record<ApplicantStatus, string> = {
    'Pending': 'bg-gray-100 text-gray-800',
    'Shortlisted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Withdrawn': 'bg-yellow-100 text-yellow-800',
};

const applicantStatusFilters: (ApplicantStatus | 'All')[] = ['All', 'Pending', 'Shortlisted', 'Rejected', 'Withdrawn'];

const ViewApplicantsPage: React.FC<ViewApplicantsPageProps> = ({ job, applications, onNavigate, onUpdateStatus }) => {
  const [applicants, setApplicants] = useState<UserProfile[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<UserProfile | null>(null);
  const [rankings, setRankings] = useState<ApplicantRanking[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApplicantStatus | 'All'>('All');

  useEffect(() => {
    const jobApplicationDetails = applications.filter(app => app.jobId === job.id);
    const jobApplicants = jobApplicationDetails
      .map(app => {
        try {
          const profileData = localStorage.getItem(`userProfile_${app.userEmail}`);
          return profileData ? JSON.parse(profileData) : null;
        } catch {
          return null;
        }
      })
      .filter((p): p is UserProfile => p !== null);
    
    setApplicants(jobApplicants);
    setRankings([]); // Reset rankings when job changes
  }, [job, applications]);

  const handleRankApplicants = async () => {
    if (applicants.length < 2) return;
    setIsRanking(true);
    try {
        const rankedData = await rankApplicantsWithAI(job, applicants);
        setRankings(rankedData);
    } catch (error) {
        console.error("Failed to rank applicants:", error);
    } finally {
        setIsRanking(false);
    }
  };

  const sortedApplicants = useMemo(() => {
    const applicantStatuses = new Map(
      applications
        .filter(a => a.jobId === job.id)
        .map(a => [a.userEmail, a.status])
    );

    const filtered = applicants.filter(app => {
      if (filterStatus === 'All') return true;
      return applicantStatuses.get(app.email) === filterStatus;
    });

    if (rankings.length === 0) return filtered;

    const rankMap = new Map(rankings.map(r => [r.email, r.rank]));
    return [...filtered].sort((a, b) => {
      // FIX: The rank from the service might be a string, so explicitly convert to a number for sorting.
      const rankA = Number(rankMap.get(a.email) ?? 999);
      const rankB = Number(rankMap.get(b.email) ?? 999);
      return rankA - rankB;
    });
  }, [applicants, rankings, filterStatus, applications, job.id]);
  
  const getApplicantStatus = (email: string) => {
    return applications.find(a => a.jobId === job.id && a.userEmail === email)?.status || 'Pending';
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-up max-w-5xl mx-auto">
      <button onClick={() => onNavigate('employer-find-talent')} className="text-sm font-semibold text-primary hover:underline mb-4">
        &larr; Back to My Postings
      </button>

      <div className="border-t pt-4">
        <h2 className="text-3xl font-bold text-gray-900">{job.title}</h2>
        <p className="text-gray-600">Applicants for this position</p>
      </div>

      <div className="my-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 bg-secondary p-1 rounded-full">
            {applicantStatusFilters.map(status => (
                 <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filterStatus === status ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {status}
                 </button>
            ))}
        </div>
        <button
            onClick={handleRankApplicants}
            disabled={isRanking || applicants.length < 2}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400"
        >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {isRanking ? 'Ranking...' : 'Rank Applicants with AI'}
        </button>
      </div>
      
      <div className="space-y-4">
        {sortedApplicants.length > 0 ? (
          sortedApplicants.map(applicant => {
            const rankInfo = rankings.find(r => r.email === applicant.email);
            const skillMatch = calculateSkillMatch(applicant.skills, job.skills);
            const appStatus = getApplicantStatus(applicant.email);
            return (
              <div key={applicant.email} className="p-4 border rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50 hover:shadow-sm transition-shadow">
                <div className="flex items-center">
                   {applicant.profilePhoto ? <img src={applicant.profilePhoto} alt={applicant.fullName} className="w-12 h-12 rounded-full mr-4 object-cover"/> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4"><UserIcon className="w-8 h-8 text-gray-500" /></div>}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{applicant.fullName}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${applicantStatusStyles[appStatus]}`}>{appStatus}</span>
                        {rankInfo && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">Rank #{rankInfo.rank}</span>}
                    </div>
                    <p className="text-sm text-gray-600">Skill Match: <span className="font-semibold">{skillMatch.percentage}%</span></p>
                    {rankInfo && <p className="text-xs text-gray-500 italic mt-1">AI: "{rankInfo.justification}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                        onClick={() => onUpdateStatus(job.id, applicant.email, 'Shortlisted')}
                        disabled={appStatus === 'Shortlisted' || appStatus === 'Withdrawn'}
                        className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Shortlist"
                    >
                       <CheckIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(job.id, applicant.email, 'Rejected')}
                        disabled={appStatus === 'Rejected' || appStatus === 'Withdrawn'}
                        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Reject"
                    >
                       <XIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => setSelectedApplicant(applicant)}
                        className="text-sm font-semibold text-white bg-primary rounded-md px-4 py-2 hover:bg-primary-focus transition-colors"
                    >
                        View Profile
                    </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No applicants found for this filter.</h3>
            <p className="mt-1 text-sm text-gray-500">Try selecting a different status or check back later.</p>
          </div>
        )}
      </div>

      {selectedApplicant && (
        <ApplicantDetailModal 
          applicant={selectedApplicant}
          job={job}
          applicationStatus={getApplicantStatus(selectedApplicant.email)}
          onUpdateStatus={onUpdateStatus}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
};

export default ViewApplicantsPage;
