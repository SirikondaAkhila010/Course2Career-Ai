
import React, { useState } from 'react';
import type { Page, JobAlert } from '../../types';
import { BellAlertIcon } from '../icons/BellAlertIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface JobAlertsPageProps {
  onNavigate: (page: Page) => void;
  jobAlerts: JobAlert[];
  onAddAlert: (alert: Omit<JobAlert, 'id'>) => void;
  onDeleteAlert: (id: number) => void;
}

const JobAlertsPage: React.FC<JobAlertsPageProps> = ({ onNavigate, jobAlerts, onAddAlert, onDeleteAlert }) => {
    const [keywords, setKeywords] = useState('');
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('All');
    const [error, setError] = useState('');

    const handleAddAlert = () => {
        if (!keywords && !skills && !location && jobType === 'All') {
            setError('Please fill at least one field to create an alert.');
            return;
        }
        setError('');
        onAddAlert({ keywords, skills, location, jobType });
        // Reset form
        setKeywords('');
        setSkills('');
        setLocation('');
        setJobType('All');
    };

    const inputStyles = "block w-full px-3 py-2 border border-secondary-focus rounded-md bg-base-100 text-secondary-content placeholder-base-content focus:ring-primary focus:border-primary";

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="bg-secondary p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-6">
                    <BellAlertIcon className="h-10 w-10 text-primary" />
                    <div className="ml-4">
                        <h2 className="text-3xl font-bold text-secondary-content">Manage Job Alerts</h2>
                        <p className="text-base-content">Get notified about new jobs that match your criteria.</p>
                    </div>
                </div>

                <div className="bg-base-100 p-6 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold text-secondary-content">Create a New Alert</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">Keywords</label>
                            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g., Software Engineer, Marketing" className={inputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">Skills</label>
                            <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., React, TypeScript" className={inputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">Location</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., San Francisco, Remote" className={inputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base-content mb-1">Job Type</label>
                            <select value={jobType} onChange={e => setJobType(e.target.value)} className={inputStyles}>
                                <option>All</option>
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button onClick={handleAddAlert} className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Alert
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-secondary-content mb-4">Your Active Alerts</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {jobAlerts.length > 0 ? (
                            jobAlerts.map(alert => (
                                <div key={alert.id} className="bg-base-100 p-4 rounded-md flex justify-between items-center animate-fade-in">
                                    <div className="text-sm text-secondary-content">
                                        <p>
                                            <span className="font-semibold">Keywords:</span> {alert.keywords || 'Any'}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Skills:</span> {alert.skills || 'Any'}
                                        </p>
                                         <p>
                                            <span className="font-semibold">Location:</span> {alert.location || 'Any'}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Type:</span> {alert.jobType}
                                        </p>
                                    </div>
                                    <button onClick={() => onDeleteAlert(alert.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-base-content py-4">You have no active job alerts.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobAlertsPage;
