
import React from 'react';
import type { UserProfile, Job, ApplicantStatus } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UserIcon } from '../icons/UserIcon';
import { GraduationCapIcon } from '../icons/GraduationCapIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';

interface ApplicantDetailModalProps {
  applicant: UserProfile;
  job: Job;
  onClose: () => void;
  applicationStatus: ApplicantStatus;
  onUpdateStatus: (jobId: number, userEmail: string, status: ApplicantStatus) => void;
}

// FIX: Added 'Withdrawn' to satisfy the Record<ApplicantStatus, string> type.
const applicantStatusStyles: Record<ApplicantStatus, string> = {
    'Pending': 'bg-gray-100 text-gray-800',
    'Shortlisted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Withdrawn': 'bg-yellow-100 text-yellow-800',
};

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicant, job, onClose, applicationStatus, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            {applicant.profilePhoto ? (
                <img className="h-16 w-16 rounded-full object-cover ring-4 ring-white" src={applicant.profilePhoto} alt="User avatar" />
            ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white">
                <UserIcon className="h-10 w-10 text-gray-500" />
                </div>
            )}
            <div className="ml-4">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-gray-900">{applicant.fullName}</h2>
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${applicantStatusStyles[applicationStatus]}`}>{applicationStatus}</span>
              </div>
              <p className="text-md text-gray-600">{applicant.email} &middot; {applicant.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label="Close">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center"><UserIcon className="w-5 h-5 mr-2 text-primary"/> Summary</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{applicant.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {applicant.skills.map(skill => (
                <span key={skill} className={`text-xs font-medium px-2.5 py-1 rounded-full ${job.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-content'}`}>{skill}</span>
              ))}
            </div>
          </div>
           <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2 text-primary"/> Experience</h3>
            <div className="mt-2 space-y-4">
              {applicant.experience.map((exp, i) => (
                <div key={i}>
                    <p className="font-bold">{exp.role} at {exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
           <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center"><GraduationCapIcon className="w-5 h-5 mr-2 text-primary"/> Education</h3>
            <div className="mt-2">
                <p className="font-bold">{applicant.education.undergraduate.degree} in {applicant.education.undergraduate.fieldOfStudy}</p>
                <p className="text-sm text-gray-600">{applicant.education.undergraduate.institution}</p>
                <p className="text-sm text-gray-500">{applicant.education.undergraduate.startYear} - {applicant.education.undergraduate.endYear}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 flex items-center"><LinkIcon className="w-5 h-5 mr-2 text-primary"/> Links</h3>
            <div className="mt-2 flex gap-4">
              {applicant.links?.linkedIn && <a href={applicant.links.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
              {applicant.links?.github && <a href={applicant.links.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>}
              {applicant.links?.portfolio && <a href={applicant.links.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portfolio</a>}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
           <div className="flex items-center gap-2">
                <button
                    onClick={() => onUpdateStatus(job.id, applicant.email, 'Rejected')}
                    disabled={applicationStatus === 'Rejected'}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                    Reject
                </button>
                 <button 
                    onClick={() => onUpdateStatus(job.id, applicant.email, 'Shortlisted')}
                    disabled={applicationStatus === 'Shortlisted'}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-green-300 text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                >
                    Shortlist
                </button>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Close</button>
              <button className="px-6 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-focus">Contact Candidate</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailModal;
