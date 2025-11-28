import React, { useState } from 'react';
import type { User, AuthPage } from '../../types';
import { loginUser } from '../../services/authService';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import AuthLayout from './AuthLayout';

interface EmployerLoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: AuthPage) => void;
}

const EmployerLogin: React.FC<EmployerLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = loginUser(email, password, 'employer');
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-base-100 dark:border-slate-400 dark:text-secondary-content dark:placeholder-slate-500";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-base-content";

  return (
    <AuthLayout
        title="Employer Sign In"
        subtitle="or"
        linkText="create a new company account"
        onLinkClick={() => onNavigate('employer-signup')}
    >
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email-address-employer" className={labelStyles}>Company Email address</label>
                <div className="mt-1">
                    <input
                        id="email-address-employer"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={inputStyles}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password-employer" className={labelStyles}>Password</label>
                <div className="mt-1">
                    <input
                        id="password-employer"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={inputStyles}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start text-sm">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-gray-400"
                >
                {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>
             <div className="text-center">
                <button type="button" onClick={() => onNavigate('seeker-login')} className="text-sm font-medium text-gray-600 dark:text-base-content hover:text-primary">
                    Are you a job seeker?
                </button>
            </div>
        </form>
    </AuthLayout>
  );
};

export default EmployerLogin;