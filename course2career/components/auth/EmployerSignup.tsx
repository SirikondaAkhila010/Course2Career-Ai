import React, { useState } from 'react';
import type { User, AuthPage } from '../../types';
import { registerUser } from '../../services/authService';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import AuthLayout from './AuthLayout';

interface EmployerSignupProps {
  onSignupSuccess: (user: User) => void;
  onNavigate: (page: AuthPage) => void;
}

const EmployerSignup: React.FC<EmployerSignupProps> = ({ onSignupSuccess, onNavigate }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
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
      const user = registerUser(email, password, 'employer', { companyName, companyWebsite, employeeCount });
      onSignupSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-base-100 dark:border-slate-400 dark:text-secondary-content dark:placeholder-slate-500";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-base-content";
  const selectStyles = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-base-100 dark:border-slate-400 dark:text-secondary-content";

  return (
    <AuthLayout
        title="Create an Employer Account"
        subtitle="Already have an account?"
        linkText="Sign in"
        onLinkClick={() => onNavigate('employer-login')}
    >
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="company-name" className={labelStyles}>Company Name</label>
                <input id="company-name" name="companyName" type="text" autoComplete="organization" required
                    className={inputStyles}
                    value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div>
                <label htmlFor="email-address-employer-signup" className={labelStyles}>Company Email</label>
                <input id="email-address-employer-signup" name="email" type="email" autoComplete="email" required
                    className={inputStyles}
                    value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="company-website" className={labelStyles}>Company Website</label>
                    <input id="company-website" name="companyWebsite" type="url" autoComplete="url" required
                        className={inputStyles}
                        value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                </div>
                 <div>
                    <label htmlFor="employee-count" className={labelStyles}>Number of Employees</label>
                    <select id="employee-count" name="employeeCount" required
                        className={selectStyles}
                        value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)}>
                        <option value="" disabled>Select a range</option>
                        <option>1-10</option>
                        <option>11-50</option>
                        <option>51-200</option>
                        <option>201-1000</option>
                        <option>1000+</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="password-employer-signup" className={labelStyles}>Password</label>
                <input id="password-employer-signup" name="password" type="password" autoComplete="new-password" required
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

export default EmployerSignup;