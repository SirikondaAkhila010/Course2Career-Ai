
import React, { useState } from 'react';
import type { Page, EmployerProfile } from '../../types';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { UploadIcon } from '../icons/UploadIcon';

interface EmployerVerificationPageProps {
  employerProfile: EmployerProfile | null;
  onVerified: () => void;
  onNavigate: (page: Page) => void;
}

const EmployerVerificationPage: React.FC<EmployerVerificationPageProps> = ({ employerProfile, onVerified, onNavigate }) => {
  const [otp, setOtp] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setCountdown(5); // Simulate a 5 second delay
    const interval = setInterval(() => {
        setCountdown(prev => prev - 1);
    }, 1000);
    setTimeout(() => {
        clearInterval(interval);
        setIsLoading(false);
        setIsOtpSent(true);
    }, 5000);
  };
  
  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setIdPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError('');
    } else if (file) {
        setError('Please upload a valid image file (PNG, JPG, etc.).');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
    } else if (e.type === 'dragleave') {
        setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  
  const handleRemovePhoto = () => {
    setIdPhoto(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || !idPhoto) {
      setError('Please enter the OTP and upload your employee ID photo.');
      return;
    }
    // Simulate OTP check
    if (otp !== '654321') {
      setError('The OTP entered is incorrect. Please try again.');
      return;
    }

    // On success
    onVerified();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-up max-w-2xl mx-auto">
      <button onClick={() => onNavigate('employer-dashboard')} className="text-sm font-semibold text-primary hover:underline mb-4">
        &larr; Back to Dashboard
      </button>
      <div className="flex items-center mb-6 border-t pt-4">
        <BadgeCheckIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900">Verify Your Company</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Complete the steps below to get a verified badge for your company. This helps build trust with potential candidates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">Company Email</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="email"
              id="company-email"
              value={employerProfile?.email || ''}
              readOnly
              className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-gray-300 bg-gray-100 cursor-not-allowed"
            />
            <button
              onClick={handleSendOtp}
              disabled={isLoading || isOtpSent}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {isLoading ? `Sending... (${countdown})` : (isOtpSent ? 'OTP Sent' : 'Send OTP')}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">We'll send a verification code to your registered company email.</p>
        </div>

        {isOtpSent && (
          <div className="animate-fade-in">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} placeholder="Enter 6-digit OTP" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
             <p className="mt-1 text-xs text-gray-500">For this demo, the OTP is <span className="font-mono font-bold">654321</span>.</p>
          </div>
        )}

        <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID Photo or Company Document</label>
             <div 
                onDrop={handleDrop}
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'}`}
            >
                <div className="space-y-1 text-center">
                    {idPhoto ? (
                        <div>
                            <img src={idPhoto} alt="ID Preview" className="mx-auto h-32 rounded-md object-contain" />
                            <div className="mt-4 text-center">
                                <button type="button" onClick={handleRemovePhoto} className="text-sm font-medium text-red-600 hover:text-red-800">
                                    Remove Photo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                </div>
            </div>
        </div>
        
        {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}

        <div className="text-right">
          <button
            type="submit"
            disabled={!isOtpSent || !idPhoto}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Verify and Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerVerificationPage;
