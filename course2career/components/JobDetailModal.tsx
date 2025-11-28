import React, { useState } from 'react';
import type { Job, UserProfile, ApplicationStatus, Review } from '../types';
import { calculateSkillMatch } from '../utils';
import { XIcon } from './icons/XIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { StarIcon } from './icons/StarIcon';
import { UserIcon } from './icons/UserIcon';

interface JobDetailModalProps {
  job: Job;
  userProfile: UserProfile | null;
  onClose: () => void;
  onApply: (jobId: number) => void;
  applicationStatus?: ApplicationStatus;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'date'>) => void;
}

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        filled
      />
    ))}
  </div>
);

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void; }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none"
                        aria-label={`Rate ${starValue} stars`}
                    >
                        <StarIcon
                            className={`w-7 h-7 transition-colors ${starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'}`}
                            filled
                        />
                    </button>
                );
            })}
        </div>
    );
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, userProfile, onClose, onApply, applicationStatus, reviews, onAddReview }) => {
  const { percentage: skillMatchPercentage, matchedSkills } = calculateSkillMatch(userProfile?.skills || [], job.skills);
  const companyReviews = reviews.filter(r => r.companyName === job.company);
  
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating > 0 && newComment.trim() && userProfile) {
      onAddReview({
        companyName: job.company,
        userName: userProfile.fullName,
        rating: newRating,
        comment: newComment.trim(),
      });
      setNewRating(0);
      setNewComment('');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-secondary-focus">
          <div className="flex items-center">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={`${job.company} logo`} className="h-16 w-16 mr-4" />
            ) : (
                <div className="h-16 w-16 mr-4 bg-gray-100 dark:bg-secondary-focus rounded-md flex items-center justify-center">
                    <BriefcaseIcon className="w-8 h-8 text-gray-500 dark:text-base-content" />
                </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
              <p className="text-lg text-gray-700 dark:text-secondary-content">{job.company}</p>
              <p className="text-sm text-gray-500 dark:text-base-content">{job.location} &middot; {job.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 dark:text-base-content hover:bg-gray-100 dark:hover:bg-secondary-focus transition-colors" aria-label="Close">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {userProfile && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-bold text-primary">Your Skill Match</h3>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 dark:bg-secondary-focus rounded-full h-4">
                  <div className="bg-primary h-4 rounded-full" style={{ width: `${skillMatchPercentage}%` }}></div>
                </div>
                <span className="ml-4 text-lg font-bold text-primary">{skillMatchPercentage}%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-base-content mt-2">
                This is based on the skills in your profile. You match <span className="font-semibold">{matchedSkills.size}</span> of the <span className="font-semibold">{job.skills.length}</span> required skills.
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Required Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <span 
                  key={skill} 
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${userProfile && matchedSkills.has(skill.toLowerCase()) ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-secondary-focus text-gray-800 dark:text-secondary-content'}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Full Job Description</h3>
            <div className="mt-2 text-gray-700 dark:text-secondary-content prose prose-sm max-w-none">
                <MarkdownRenderer text={job.description}/>
            </div>
          </div>

          {/* Company Reviews Section */}
            <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Company Reviews</h3>
                <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-2">
                    {companyReviews.length > 0 ? (
                        companyReviews.map((review, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-secondary-focus/50 rounded-md border border-gray-200 dark:border-secondary-focus">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-base-100 flex items-center justify-center mr-3">
                                            <UserIcon className="w-5 h-5 text-gray-500 dark:text-base-content" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-800 dark:text-secondary-content">{review.userName}</p>
                                          <StarRatingDisplay rating={review.rating} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-base-content flex-shrink-0">{new Date(review.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 dark:text-base-content mt-2 pl-11">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-base-content py-4 text-center">No reviews yet. Be the first to leave one after you apply!</p>
                    )}
                </div>

                {applicationStatus && userProfile && (
                    <div className="mt-6 border-t border-gray-200 dark:border-secondary-focus pt-6">
                        <h4 className="font-semibold text-gray-800 dark:text-white">Leave a Review</h4>
                        <p className="text-sm text-gray-500 dark:text-base-content mb-3">You've applied to this job. Share your experience with the community.</p>
                        <form onSubmit={handleSubmitReview} className="space-y-4 p-4 bg-gray-50 dark:bg-secondary-focus/50 rounded-md border border-gray-200 dark:border-secondary-focus">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-content mb-1">Your Rating</label>
                                <StarRatingInput rating={newRating} setRating={setNewRating} />
                            </div>
                            <div>
                                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-secondary-content mb-1">Your Comment</label>
                                <textarea
                                    id="review-comment"
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="How was the application process? Any thoughts on the company?"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-base-100 dark:border-secondary-focus dark:text-secondary-content"
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={newRating === 0 || !newComment.trim()}
                                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400 dark:disabled:bg-secondary-focus"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-secondary-focus bg-gray-50 dark:bg-secondary/50 rounded-b-lg">
          <div>
            {applicationStatus ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 text-green-800 text-sm font-semibold">
                <InformationCircleIcon className="w-5 h-5"/>
                You have already applied for this position. Status: {applicationStatus}
              </div>
            ) : (
              <button
                onClick={() => onApply(job.id)}
                className="px-6 py-3 text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
          <button onClick={onClose} className="px-6 py-3 text-base font-medium rounded-md border border-gray-300 dark:border-secondary-focus text-gray-700 dark:text-secondary-content bg-white dark:bg-secondary hover:bg-gray-50 dark:hover:bg-opacity-80 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;