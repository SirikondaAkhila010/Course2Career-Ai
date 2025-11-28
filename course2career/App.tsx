
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import JobSeekerLogin from './components/auth/JobSeekerLogin';
import JobSeekerSignup from './components/auth/JobSeekerSignup';
import EmployerLogin from './components/auth/EmployerLogin';
import EmployerSignup from './components/auth/EmployerSignup';
import Dashboard from './components/Dashboard';
import JobSearch from './components/JobSearch';
import UserProfilePage from './components/UserProfilePage';
import ProfileParser from './components/ProfileParser';
import MessagesPage from './components/seeker/MessagesPage';
import ResumeBuilderPage from './components/ResumeBuilderPage';
import CompanyPrepPage from './components/seeker/CompanyPrepPage';
import JobAlertsPage from './components/seeker/JobAlertsPage';
import SeekerVerificationPage from './components/seeker/SeekerVerificationPage';
import EmployerDashboard from './components/employer/EmployerDashboard';
import PostJobPage from './components/employer/PostJobPage';
import FindTalentPage from './components/employer/FindTalentPage';
import ViewApplicantsPage from './components/employer/ViewApplicantsPage';
import TalentDiscoveryPage from './components/employer/TalentDiscoveryPage';
import CompanyProfilePage from './components/employer/CompanyProfilePage';
import EmployerVerificationPage from './components/employer/EmployerVerificationPage';
import Footer from './components/Footer';
import ChatPage from './components/ChatPage';

import { getCurrentUser, logoutUser, getAllSeekerProfiles, getAllPostedJobs } from './services/authService';
import type { User, UserProfile, EmployerProfile, Page, AuthPage, ApplicationStatus, Task, Job, Application, ApplicantStatus, Review, JobAlert, Notification } from './types';
import { MOCK_JOBS } from './constants';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('landing');
    
    // Seeker-specific state
    const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>({});
    const [tasks, setTasks] = useState<Task[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Job[]>(MOCK_JOBS);
    
    // Employer-specific state
    const [postedJobs, setPostedJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<Job | null>(null);
    const [allSeekerProfiles, setAllSeekerProfiles] = useState<UserProfile[]>([]);


    useEffect(() => {
        // Load all available jobs from mocks and recruiter portals
        const recruiterJobs = getAllPostedJobs();
        const allJobs = [...MOCK_JOBS, ...recruiterJobs];
        setAvailableJobs(allJobs);
        
        const user = getCurrentUser();
        if (user) {
            handleLoginSuccess(user, allJobs);
        } else {
            setCurrentPage(null);
        }
        setAllSeekerProfiles(getAllSeekerProfiles());
        const savedReviews = localStorage.getItem('company_reviews');
        if (savedReviews) setReviews(JSON.parse(savedReviews));
    }, []);

    const checkForNewJobMatches = (alerts: JobAlert[], userEmail: string, jobsToCheck: Job[]) => {
        const savedNotifications = localStorage.getItem(`notifications_${userEmail}`);
        const currentNotifications: Notification[] = savedNotifications ? JSON.parse(savedNotifications) : [];
        const newNotifications: Notification[] = [];

        alerts.forEach(alert => {
            const matchingJobs = jobsToCheck.filter(job => {
                const keywordLower = alert.keywords.toLowerCase();
                const skillsLower = alert.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
                const locationLower = alert.location.toLowerCase();

                const matchesKeywords = !keywordLower || job.title.toLowerCase().includes(keywordLower) || job.company.toLowerCase().includes(keywordLower);
                const matchesSkills = skillsLower.length === 0 || skillsLower.every(s => job.skills.some(js => js.toLowerCase().includes(s)));
                const matchesLocation = !locationLower || job.location.toLowerCase().includes(locationLower);
                const matchesType = alert.jobType === 'All' || job.type === alert.jobType;

                return matchesKeywords && matchesSkills && matchesLocation && matchesType;
            });

            matchingJobs.forEach(job => {
                const alreadyNotified = currentNotifications.some(n => n.type === 'job_alert' && n.relatedJobId === job.id);
                if (!alreadyNotified) {
                    newNotifications.push({
                        id: Date.now() + Math.random(),
                        text: `New job matched your alert: "${job.title}" at ${job.company}`,
                        time: new Date().toISOString(),
                        read: false,
                        type: 'job_alert',
                        relatedJobId: job.id
                    });
                }
            });
        });
        
        if (newNotifications.length > 0) {
            const updatedNotifications = [...newNotifications, ...currentNotifications];
            setNotifications(updatedNotifications);
            localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(updatedNotifications));
        } else {
            setNotifications(currentNotifications);
        }
    };

    const loadDataForUser = (user: User, currentAvailableJobs: Job[]) => {
        if (user.userType === 'seeker') {
            const profileData = localStorage.getItem(`userProfile_${user.email}`);
            if (profileData) setUserProfile(JSON.parse(profileData));
            
            const savedTasks = localStorage.getItem(`tasks_${user.email}`);
            if(savedTasks) setTasks(JSON.parse(savedTasks));

            const savedApps = localStorage.getItem(`applications_${user.email}`);
            if (savedApps) setApplicationStatuses(JSON.parse(savedApps));
            
            const savedAlerts = localStorage.getItem(`jobAlerts_${user.email}`);
            const alerts: JobAlert[] = savedAlerts ? JSON.parse(savedAlerts) : [];
            setJobAlerts(alerts);
            
            // Check for notifications after loading alerts
            checkForNewJobMatches(alerts, user.email, currentAvailableJobs);

        } else if (user.userType === 'employer') {
            const profileData = localStorage.getItem(`employerProfile_${user.email}`);
            if (profileData) setEmployerProfile(JSON.parse(profileData));

            const savedJobs = localStorage.getItem(`postedJobs_${user.email}`);
            if(savedJobs) setPostedJobs(JSON.parse(savedJobs));

            const allApps = localStorage.getItem(`all_applications`);
            if(allApps) setApplications(JSON.parse(allApps));
        }
    };
    
    const handleLoginSuccess = (user: User, jobsOverride?: Job[]) => {
        setCurrentUser(user);
        // If handleLoginSuccess is called from login component, we might need to refresh job list
        const jobs = jobsOverride || availableJobs; 
        loadDataForUser(user, jobs);
        setCurrentPage(user.userType === 'seeker' ? 'dashboard' : 'employer-dashboard');
    };

    const handleLogout = () => {
        logoutUser();
        setCurrentUser(null);
        setUserProfile(null);
        setEmployerProfile(null);
        setCurrentPage(null);
        setCurrentAuthPage('landing');
    };

    const handleNavigate = (page: Page) => {
        if (page === 'employer-view-applicants' && selectedJobForApplicants) {
          setCurrentPage(page);
        } else if (page !== 'employer-view-applicants') {
          setSelectedJobForApplicants(null);
          setCurrentPage(page);
        }
    };

    const handleNavigateAuth = (page: AuthPage) => {
        setCurrentAuthPage(page);
    };

    const handleProfileParsed = (profile: UserProfile) => {
        handleUpdateProfile(profile);
        setCurrentPage('user-profile');
    };
    
    const handleStartManualProfile = () => {
        setCurrentPage('user-profile');
    };
    
    const handleUpdateProfile = (profile: UserProfile) => {
        setUserProfile(profile);
        localStorage.setItem(`userProfile_${profile.email}`, JSON.stringify(profile));
    };
    
    const handleClearProfile = () => {
        if (currentUser) {
            localStorage.removeItem(`userProfile_${currentUser.email}`);
            setUserProfile(null);
            setCurrentPage('profile-parser');
        }
    };

    const handlePhotoUpdate = (photoData: string) => {
        if(userProfile) {
            const updatedProfile = { ...userProfile, profilePhoto: photoData };
            handleUpdateProfile(updatedProfile);
        }
    };

    const handleAddTask = (text: string) => {
        if (currentUser) {
            const newTasks = [...tasks, { id: Date.now(), text, completed: false }];
            setTasks(newTasks);
            localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(newTasks));
        }
    };
    
    const handleToggleTask = (id: number) => {
        if(currentUser) {
            const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
            setTasks(newTasks);
            localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(newTasks));
        }
    };
    
    const handleDeleteTask = (id: number) => {
       if(currentUser) {
            const newTasks = tasks.filter(t => t.id !== id);
            setTasks(newTasks);
            localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(newTasks));
       }
    };
    
    const handleReorderTasks = (reorderedTasks: Task[]) => {
        if (currentUser) {
            setTasks(reorderedTasks);
            localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(reorderedTasks));
        }
    };

     const handleAddReview = (review: Omit<Review, 'date'>) => {
      const newReview: Review = {
        ...review,
        date: new Date().toISOString(),
      };
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      localStorage.setItem('company_reviews', JSON.stringify(updatedReviews));
    };

    const handleAddJobAlert = (alert: Omit<JobAlert, 'id'>) => {
        if (currentUser) {
            const newAlert = { ...alert, id: Date.now() };
            const updatedAlerts = [...jobAlerts, newAlert];
            setJobAlerts(updatedAlerts);
            localStorage.setItem(`jobAlerts_${currentUser.email}`, JSON.stringify(updatedAlerts));
        }
    };
    
    const handleDeleteJobAlert = (id: number) => {
        if (currentUser) {
            const updatedAlerts = jobAlerts.filter(alert => alert.id !== id);
            setJobAlerts(updatedAlerts);
            localStorage.setItem(`jobAlerts_${currentUser.email}`, JSON.stringify(updatedAlerts));
        }
    };
    
    const handleMarkNotificationsRead = () => {
        if (currentUser) {
            const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
            setNotifications(updatedNotifications);
            localStorage.setItem(`notifications_${currentUser.email}`, JSON.stringify(updatedNotifications));
        }
    };


    const handleUpdateEmployerProfile = (profile: EmployerProfile) => {
      setEmployerProfile(profile);
      localStorage.setItem(`employerProfile_${profile.email}`, JSON.stringify(profile));
    };
    
    const handlePostJob = (jobData: Omit<Job, 'id'|'company'|'companyLogo'>) => {
      if(employerProfile) {
        const newJob: Job = {
          ...jobData,
          id: Date.now(),
          company: employerProfile.companyName,
          companyLogo: employerProfile.galleryPhotos?.[0]
        };
        const updatedJobs = [...postedJobs, newJob];
        setPostedJobs(updatedJobs);
        localStorage.setItem(`postedJobs_${employerProfile.email}`, JSON.stringify(updatedJobs));
        
        // Refresh available jobs immediately
        const recruiterJobs = getAllPostedJobs();
        setAvailableJobs([...MOCK_JOBS, ...recruiterJobs]);

        handleNavigate('employer-find-talent');
      }
    };

    const handleViewApplicants = (job: Job) => {
      setSelectedJobForApplicants(job);
      handleNavigate('employer-view-applicants');
    };

    const handleRecordApplication = (jobId: number) => {
      if (!currentUser || currentUser.userType !== 'seeker') return;

      const alreadyExists = applications.some(
        (app) => app.jobId === jobId && app.userEmail === currentUser.email
      );
      if (alreadyExists) return;

      const newApplication: Application = {
        jobId,
        userEmail: currentUser.email,
        status: 'Pending',
        appliedDate: new Date().toISOString(),
      };
      const updatedApplications = [...applications, newApplication];
      setApplications(updatedApplications);
      localStorage.setItem('all_applications', JSON.stringify(updatedApplications));
    };

    const handleUpdateStatus = (jobId: number, userEmail: string, status: ApplicantStatus) => {
      const updatedApplications = applications.map(app => 
        (app.jobId === jobId && app.userEmail === userEmail) ? { ...app, status } : app
      );
      setApplications(updatedApplications);
      localStorage.setItem('all_applications', JSON.stringify(updatedApplications));
    };

    const renderPage = () => {
        if (!currentUser) {
            switch (currentAuthPage) {
                case 'seeker-login': return <JobSeekerLogin onLoginSuccess={(u) => {
                    const recruiterJobs = getAllPostedJobs();
                    const all = [...MOCK_JOBS, ...recruiterJobs];
                    setAvailableJobs(all);
                    handleLoginSuccess(u, all);
                }} onNavigate={handleNavigateAuth} />;
                case 'seeker-signup': return <JobSeekerSignup onSignupSuccess={(u) => handleLoginSuccess(u, availableJobs)} onNavigate={handleNavigateAuth} />;
                case 'employer-login': return <EmployerLogin onLoginSuccess={(u) => handleLoginSuccess(u, availableJobs)} onNavigate={handleNavigateAuth} />;
                case 'employer-signup': return <EmployerSignup onSignupSuccess={(u) => handleLoginSuccess(u, availableJobs)} onNavigate={handleNavigateAuth} />;
                default: return <LandingPage onNavigate={handleNavigateAuth} />;
            }
        }

        switch (currentPage) {
            // Seeker pages
            case 'dashboard': return <Dashboard onNavigate={handleNavigate} applicationStatuses={applicationStatuses} tasks={tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onReorderTasks={handleReorderTasks}/>;
            case 'job-search': return (
              <JobSearch
                jobs={availableJobs}
                userProfile={userProfile}
                applicationStatuses={applicationStatuses}
                setApplicationStatuses={setApplicationStatuses}
                currentUser={currentUser}
                reviews={reviews}
                onAddReview={handleAddReview}
                onRecordApplication={handleRecordApplication}
              />
            );
            case 'user-profile': return <UserProfilePage userProfile={userProfile} onPhotoUpdate={handlePhotoUpdate} onClearProfile={handleClearProfile} onUpdateProfile={handleUpdateProfile} onNavigate={handleNavigate} />;
            case 'profile-parser': return <ProfileParser onProfileParsed={handleProfileParsed} onManualEntry={handleStartManualProfile} />;
            case 'ai-chatbot': return <ChatPage />;
            case 'messages': return <MessagesPage />;
            case 'resume-builder': return <ResumeBuilderPage userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onNavigate={handleNavigate} />;
            case 'company-prep': return <CompanyPrepPage onNavigate={handleNavigate}/>;
            case 'job-alerts': return <JobAlertsPage onNavigate={handleNavigate} jobAlerts={jobAlerts} onAddAlert={handleAddJobAlert} onDeleteAlert={handleDeleteJobAlert} />;
            case 'seeker-verification': return <SeekerVerificationPage onVerified={() => { if(userProfile) handleUpdateProfile({...userProfile, isVerified: true}); handleNavigate('user-profile'); }} onNavigate={handleNavigate} />;

            // Employer pages
            case 'employer-dashboard': return <EmployerDashboard employerProfile={employerProfile} onNavigate={handleNavigate} postedJobs={postedJobs} applications={applications}/>;
            case 'employer-post-job': return <PostJobPage employerProfile={employerProfile} onPostJob={handlePostJob} onNavigate={handleNavigate} />;
            case 'employer-find-talent': return <FindTalentPage employerProfile={employerProfile} postedJobs={postedJobs} applications={applications} onViewApplicants={handleViewApplicants} onNavigate={handleNavigate} />;
            case 'employer-view-applicants': return selectedJobForApplicants && <ViewApplicantsPage job={selectedJobForApplicants} applications={applications} onNavigate={handleNavigate} onUpdateStatus={handleUpdateStatus} />;
            case 'talent-discovery': return <TalentDiscoveryPage allSeekerProfiles={allSeekerProfiles}/>;
            case 'employer-company-profile': return <CompanyProfilePage employerProfile={employerProfile} onUpdateProfile={handleUpdateEmployerProfile} onNavigate={handleNavigate} />;
            case 'employer-verification': return <EmployerVerificationPage employerProfile={employerProfile} onVerified={() => { if(employerProfile) handleUpdateEmployerProfile({...employerProfile, isVerified: true}); handleNavigate('employer-dashboard'); }} onNavigate={handleNavigate} />;

            default: return currentUser.userType === 'seeker' ? <Dashboard onNavigate={handleNavigate} applicationStatuses={applicationStatuses} tasks={tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onReorderTasks={handleReorderTasks} /> : <EmployerDashboard employerProfile={employerProfile} onNavigate={handleNavigate} postedJobs={postedJobs} applications={applications}/>;
        }
    };
    
    return (
        <div className="min-h-screen bg-base-100 dark:bg-slate-900 flex flex-col">
          <Header
            currentUser={currentUser}
            userProfile={userProfile}
            employerProfile={employerProfile}
            notifications={notifications}
            onMarkNotificationsRead={handleMarkNotificationsRead}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onNavigateAuth={handleNavigateAuth}
          />
          <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
            {renderPage()}
          </main>
          {!currentUser && <Footer />}
        </div>
      );
};

export default App;
