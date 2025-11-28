import React, { useState } from 'react';
import type { Page } from '../../types';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface SeekerVerificationPageProps {
  onVerified: () => void;
  onNavigate: (page: Page) => void;
}

const SeekerVerificationPage: React.FC<SeekerVerificationPageProps> = ({ onVerified, onNavigate }) => {
  const [abcId, setAbcId] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (aadhar.length !== 12 || !/^\d+$/.test(aadhar)) {
        setError('Please enter a valid 12-digit Aadhar number.');
        return;
    }
    setError('');
    setIsLoading(true);
    setCountdown(5); // Simulate a 5 second delay for OTP
    const interval = setInterval(() => {
        setCountdown(prev => prev - 1);
    }, 1000);
    setTimeout(() => {
        clearInterval(interval);
        setIsLoading(false);
        setIsOtpSent(true);
    }, 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (abcId.length !== 12 || !/^\d+$/.test(abcId)) {
        setError('Please enter a valid 12-digit ABC ID.');
        return;
    }

    if (!aadhar || !otp) {
        setError('Please fill in all fields and verify your Aadhar.');
        return;
    }
    // Simulate OTP check
    if (otp !== '123456') {
        setError('The OTP entered is incorrect. Please try again.');
        return;
    }

    // On success
    setIsVerified(true);
  };
  
  const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-focus dark:border-secondary-focus/50 dark:text-secondary-content";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-base-content";


  return (
    <div className="bg-white dark:bg-secondary p-8 rounded-lg shadow-lg animate-fade-in-up max-w-2xl mx-auto">
      <button onClick={() => onNavigate('user-profile')} className="text-sm font-semibold text-primary hover:underline mb-4">
        &larr; Back to Profile
      </button>
      <div className="flex items-center mb-6 border-t border-gray-200 dark:border-secondary-focus pt-4">
        <BadgeCheckIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900 dark:text-white">Verify Your Profile</h2>
      </div>
      
      {isVerified ? (
        <div className="text-center py-10 animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Verification Successful!</h3>
            <p className="mt-2 text-gray-600 dark:text-base-content">Your profile now has a verified badge, increasing trust with employers.</p>
            <button
                onClick={onVerified}
                className="mt-6 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
                Go to My Profile
            </button>
        </div>
      ) : (
        <>
            <p className="text-gray-600 dark:text-base-content mb-6">
                Complete the steps below to verify your identity. A verified badge on your profile increases trust with employers and can lead to more opportunities.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="abc-id" className={labelStyles}>ABC ID (Academic Bank of Credits)</label>
                <input type="text" id="abc-id" value={abcId} onChange={e => setAbcId(e.target.value)} required placeholder="Enter 12-digit ABC ID" maxLength={12} className={inputStyles} />
                </div>

                <div>
                    <label htmlFor="aadhar" className={labelStyles}>Aadhar Number</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            id="aadhar"
                            value={aadhar}
                            onChange={e => setAadhar(e.target.value)}
                            required
                            maxLength={12}
                            placeholder="Enter 12-digit Aadhar number"
                            className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-gray-300 focus:ring-primary focus:border-primary dark:bg-secondary-focus dark:border-secondary-focus/50 dark:text-secondary-content"
                            disabled={isOtpSent}
                        />
                        <button
                            onClick={handleSendOtp}
                            disabled={isLoading || isOtpSent}
                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed dark:border-secondary-focus dark:bg-secondary-focus dark:text-secondary-content dark:hover:bg-secondary dark:disabled:bg-slate-700"
                        >
                            {isLoading ? `Sending... (${countdown})` : (isOtpSent ? 'OTP Sent' : 'Send OTP')}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-base-content">We will send a one-time password to the mobile number linked with your Aadhar.</p>
                </div>

                {isOtpSent && (
                    <div className="animate-fade-in">
                        <label htmlFor="otp" className={labelStyles}>Enter OTP</label>
                        <input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} placeholder="Enter 6-digit OTP" className={inputStyles} />
                        <p className="mt-1 text-xs text-gray-500 dark:text-base-content">For this demo, the OTP is <span className="font-mono font-bold">123456</span>.</p>
                    </div>
                )}
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start text-sm">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="text-right">
                <button
                    type="submit"
                    disabled={!isOtpSent}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Verify and Submit
                </button>
                </div>
            </form>
        </>
      )}
    </div>
  );
};

export default SeekerVerificationPage;