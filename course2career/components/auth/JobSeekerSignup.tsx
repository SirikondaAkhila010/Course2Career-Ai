import React, { useState } from 'react';
import type { User, AuthPage } from '../../types';
import { registerUser } from '../../services/authService';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import AuthLayout from './AuthLayout';

interface JobSeekerSignupProps {
  onSignupSuccess: (user: User) => void;
  onNavigate: (page: AuthPage) => void;
}

const JobSeekerSignup: React.FC<JobSeekerSignupProps> = ({ onSignupSuccess, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const user = registerUser(email, password, 'seeker', { fullName, phone, dateOfBirth });
      onSignupSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-base-100 dark:border-slate-400 dark:text-secondary-content dark:placeholder-slate-500";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-base-content";


  return (
    <AuthLayout
      title="Create a Seeker Account"
      subtitle="Already have an account?"
      linkText="Sign in"
      onLinkClick={() => onNavigate('seeker-login')}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="full-name" className={labelStyles}>Full Name</label>
            <input id="full-name" name="fullName" type="text" autoComplete="name" required
                className={inputStyles}
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="email-address-signup" className={labelStyles}>Email address</label>
                <input id="email-address-signup" name="email" type="email" autoComplete="email" required
                    className={inputStyles}
                    value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label htmlFor="phone" className={labelStyles}>Phone Number</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" required
                    className={inputStyles}
                    value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
        </div>

        <div>
            <label htmlFor="dateOfBirth" className={labelStyles}>Date of Birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" required
                className={inputStyles}
                value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>

        <div>
            <label htmlFor="password-signup" className={labelStyles}>Password</label>
            <input id="password-signup" name="password" type="password" autoComplete="new-password" required
                placeholder="min. 6 characters"
                className={inputStyles}
                value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}

        <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-gray-400"
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default JobSeekerSignup;