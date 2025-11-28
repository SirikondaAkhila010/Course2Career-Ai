
import React, { useState, useMemo } from 'react';
import type { Job, UserProfile, ApplicationStatus, Review } from '../types';
import JobDetailModal from './JobDetailModal';
import { SearchIcon } from './icons/SearchIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { getJobRecommendationsWithAI } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface JobSearchProps {
  jobs: Job[];
  userProfile: UserProfile | null;
  applicationStatuses: Record<number, ApplicationStatus>;
  setApplicationStatuses: React.Dispatch<React.SetStateAction<Record<number, ApplicationStatus>>>;
  currentUser: { email: string };
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'date'>) => void;
  onRecordApplication: (jobId: number) => void;
}

const JobCard: React.FC<{ job: Job; onSelect: (job: Job) => void; isApplied: boolean }> = ({ job, onSelect, isApplied }) => (
    <div 
        onClick={() => onSelect(job)}
        className="bg-secondary p-6 rounded-lg shadow-md hover:shadow-xl dark:shadow-black/20 dark:hover:shadow-primary/20 transition-all duration-300 flex flex-col hover:-translate-y-1 border-2 border-transparent hover:border-primary cursor-pointer"
    >
        <div className="flex items-start justify-between">
            <div className="flex items-center">
                {job.companyLogo ? <img src={job.companyLogo} alt={`${job.company} logo`} className="h-12 w-12 mr-4"/> : <div className="h-12 w-12 mr-4 bg-base-100 rounded-md flex items-center justify-center"><BriefcaseIcon className="w-6 h-6 text-base-content"/></div>}
                <div>
                    <h3 className="text-lg font-bold text-secondary-content">{job.title}</h3>
                    <p className="text-base-content">{job.company}</p>
                </div>
            </div>
            {isApplied && <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-800">Applied</span>}
        </div>
        <p className="mt-2 text-sm text-base-content">{job.location}</p>
        <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map(skill => (
                <span key={skill} className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">{skill}</span>
            ))}
        </div>
    </div>
);

const JobSearch: React.FC<JobSearchProps> = ({
  jobs,
  userProfile,
  applicationStatuses,
  setApplicationStatuses,
  currentUser,
  reviews,
  onAddReview,
  onRecordApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

  const handleGetRecommendations = async () => {
    if (!userProfile) return;
    setIsRecommending(true);
    try {
        const recommended = await getJobRecommendationsWithAI(userProfile, jobs);
        setRecommendedJobs(recommended);
    } catch (error) {
        console.error("Failed to get AI recommendations:", error);
    } finally {
        setIsRecommending(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let listToFilter = recommendedJobs.length > 0 ? recommendedJobs : jobs;

    return listToFilter.filter(job => {
      const term = searchTerm.toLowerCase();
      const loc = locationFilter.toLowerCase();

      const matchesSearch = term === '' ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.skills.some(s => s.toLowerCase().includes(term));

      const matchesLocation = loc === '' || job.location.toLowerCase().includes(loc);

      const matchesType = jobTypeFilter === 'All' || job.type === jobTypeFilter;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [searchTerm, locationFilter, jobTypeFilter, recommendedJobs, jobs]);

  const handleApply = (jobId: number) => {
    const newStatuses = { ...applicationStatuses, [jobId]: 'Applied' as ApplicationStatus };
    setApplicationStatuses(newStatuses);
    localStorage.setItem(`applications_${currentUser.email}`, JSON.stringify(newStatuses));
    onRecordApplication(jobId);
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-secondary p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-secondary-content">Find Your Next Opportunity</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
             <input type="text" placeholder="Search by title, company, or skill..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-secondary-focus rounded-md bg-base-100 text-secondary-content placeholder-base-content focus:ring-primary focus:border-primary"/>
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-5 h-5"/></div>
          </div>
          <input type="text" placeholder="Location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full px-4 py-3 border border-secondary-focus rounded-md bg-base-100 text-secondary-content placeholder-base-content focus:ring-primary focus:border-primary"/>
          <select value={jobTypeFilter} onChange={e => setJobTypeFilter(e.target.value)} className="w-full px-4 py-3 border border-secondary-focus rounded-md bg-base-100 text-secondary-content focus:ring-primary focus:border-primary">
            <option>All</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
         {userProfile && (
            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={handleGetRecommendations}
                    disabled={isRecommending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isRecommending ? 'Getting Recommendations...' : 'Get AI Recommendations'}
                </button>
                {recommendedJobs.length > 0 && (
                    <button onClick={() => setRecommendedJobs([])} className="text-sm font-medium text-primary hover:underline">
                        Clear Recommendations & Show All
                    </button>
                )}
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onSelect={setSelectedJob} isApplied={!!applicationStatuses[job.id]} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-secondary rounded-lg">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-base-content" />
            <h3 className="mt-2 text-lg font-medium text-secondary-content">No Jobs Found</h3>
            <p className="mt-1 text-sm text-base-content">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailModal 
            job={selectedJob} 
            userProfile={userProfile} 
            onClose={() => setSelectedJob(null)}
            onApply={handleApply}
            applicationStatus={applicationStatuses[selectedJob.id]}
            reviews={reviews}
            onAddReview={onAddReview}
        />
      )}
    </div>
  );
};

export default JobSearch;
