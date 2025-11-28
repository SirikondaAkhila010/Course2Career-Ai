import React, { useMemo } from 'react';
import type { EmployerProfile, Page, Job, Application, UserProfile } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { UserIcon } from '../icons/UserIcon';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { TagIcon } from '../icons/TagIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface EmployerDashboardProps {
  employerProfile: EmployerProfile | null;
  onNavigate: (page: Page) => void;
  postedJobs: Job[];
  applications: Application[];
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
}> = ({ icon, value, label }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { name: string; value: number }[]; title: string; }> = ({ data, title }) => {
  const maxValue = useMemo(() => Math.max(...data.map(item => item.value), 1), [data]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2 text-primary" />
        {title}
      </h3>
      <div className="space-y-4">
        {data.length > 0 ? data.map(item => (
          <div key={item.name} className="flex items-center group">
            <p className="w-1/4 text-sm font-medium text-gray-600 truncate pr-2">{item.name}</p>
            <div className="w-3/4 bg-secondary rounded-full h-6">
              <div 
                className="bg-primary h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out" 
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-xs font-bold text-white">{item.value}</span>
              </div>
            </div>
          </div>
        )) : <p className="text-sm text-gray-500">Not enough data to display.</p>}
      </div>
    </div>
  );
};

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ employerProfile, onNavigate, postedJobs, applications }) => {
  const activePostingsCount = postedJobs.length;
  const totalApplicantsCount = applications.filter(app => postedJobs.some(job => job.id === app.jobId)).length;
  const shortlistedCount = applications.filter(app => app.status === 'Shortlisted').length;
  const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
    
  const analyticsData = useMemo(() => {
    // Get all applicant profiles for this employer's jobs
    const employerJobIds = new Set(postedJobs.map(j => j.id));
    const applicantEmails = new Set(
        applications
            .filter(app => employerJobIds.has(app.jobId))
            .map(app => app.userEmail)
    );

    const applicantProfiles: UserProfile[] = [];
    applicantEmails.forEach(email => {
        try {
            const profileData = localStorage.getItem(`userProfile_${email}`);
            if (profileData) {
                applicantProfiles.push(JSON.parse(profileData));
            }
        } catch (e) { console.error("Failed to parse user profile for analytics", e); }
    });

    // Calculate applicants per job
    const applicantsPerJob = new Map<number, number>();
    applications.forEach(app => {
        if (employerJobIds.has(app.jobId)) {
            applicantsPerJob.set(app.jobId, (applicantsPerJob.get(app.jobId) || 0) + 1);
        }
    });

    const sortedJobsByApplicants = [...applicantsPerJob.entries()]
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);
        
    const barChartData = sortedJobsByApplicants.map(([jobId, count]) => {
        const job = postedJobs.find(j => j.id === jobId);
        return { name: job ? job.title : `Job ID ${jobId}`, value: count };
    });

    // Calculate common skills
    const skillCounts = new Map<string, number>();
    applicantProfiles.forEach(profile => {
        if (profile.skills && Array.isArray(profile.skills)) {
            profile.skills.forEach(skill => {
                skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
            });
        }
    });
    
    const commonSkills = [...skillCounts.entries()]
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));

    return { barChartData, commonSkills };
  }, [postedJobs, applications]);


  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome,{' '}
          <span className="inline-flex items-center gap-2">
            {employerProfile?.companyName || 'Employer'}
            {employerProfile?.isVerified && <BadgeCheckIcon className="w-7 h-7 text-primary" title="Verified Company"/>}
          </span>
          !
        </h1>
        <p className="mt-2 text-lg text-gray-600">This is your dashboard to manage job postings and find the best talent.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<BriefcaseIcon className="h-7 w-7" />} 
            value={activePostingsCount} 
            label="Active Job Postings" 
        />
        <StatCard 
            icon={<UserIcon className="h-7 w-7" />} 
            value={totalApplicantsCount} 
            label="Total Applicants" 
        />
        <StatCard 
            icon={<CheckCircleIcon className="h-7 w-7" />} 
            value={shortlistedCount} 
            label="Shortlisted Candidates" 
        />
        <StatCard 
            icon={<XCircleIcon className="h-7 w-7" />} 
            value={rejectedCount} 
            label="Rejected Candidates" 
        />
      </div>

      {/* Analytics Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BarChart data={analyticsData.barChartData} title="Top 5 Jobs by Applicant Count" />
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TagIcon className="w-6 h-6 mr-2 text-primary" />
              Most Common Applicant Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analyticsData.commonSkills.length > 0 ? analyticsData.commonSkills.map(({ skill, count }) => (
                <div key={skill} className="bg-secondary text-secondary-content text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  {skill}
                  <span className="ml-2 text-xs bg-primary/20 text-primary font-bold rounded-full h-5 w-5 flex items-center justify-center">{count}</span>
                </div>
              )) : <p className="text-sm text-gray-500">Not enough applicant data to show common skills.</p>}
            </div>
          </div>
        </div>
      </div>


      {/* Main Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col hover:shadow-xl transition-shadow duration-300">
            <BriefcaseIcon className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Post a New Job</h3>
            <p className="mt-2 text-base text-gray-500 flex-grow">Create a new job listing to attract candidates. Our tools make it easy to describe the role and required skills.</p>
            <button onClick={() => onNavigate('employer-post-job')} className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-focus">Post Job</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col hover:shadow-xl transition-shadow duration-300">
            <UserIcon className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">My Postings</h3>
            <p className="mt-2 text-base text-gray-500 flex-grow">View and manage all your posted jobs. See which roles are active and who has applied.</p>
            <button onClick={() => onNavigate('employer-find-talent')} className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-focus">View My Postings</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col hover:shadow-xl transition-shadow duration-300">
            <BuildingOfficeIcon className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Company Profile</h3>
            <p className="mt-2 text-base text-gray-500 flex-grow">Showcase your company's culture, values, and benefits to attract the right talent.</p>
            <button onClick={() => onNavigate('employer-company-profile')} className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-focus">Manage Profile</button>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;