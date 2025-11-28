import React, { useState, useEffect } from 'react';
import { generateAuthPoster } from '../../services/geminiService';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  linkText: string;
  onLinkClick: () => void;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, linkText, onLinkClick, children }) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(() => localStorage.getItem('authPosterUrl'));
  const [isLoading, setIsLoading] = useState(!posterUrl);

  useEffect(() => {
    const fetchPoster = async () => {
      if (!posterUrl) {
        setIsLoading(true);
        const generatedPoster = await generateAuthPoster();
        if (generatedPoster) {
          const url = `data:image/png;base64,${generatedPoster}`;
          setPosterUrl(url);
          localStorage.setItem('authPosterUrl', url);
        }
        setIsLoading(false);
      }
    };
    fetchPoster();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-150px)] flex bg-base-100 animate-fade-in">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-primary-content">{title}</h2>
            <p className="mt-2 text-sm text-base-content">
              {subtitle}{' '}
              <button onClick={onLinkClick} className="font-medium text-primary hover:text-primary-focus">
                {linkText}
              </button>
            </p>
          </div>
          <div className="mt-8">
            <div className="bg-white dark:bg-secondary py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full object-cover">
            {isLoading && <div className="w-full h-full bg-base-100 animate-pulse"></div>}
            {posterUrl && (
                <img
                    className="h-full w-full object-cover animate-fade-in"
                    src={posterUrl}
                    alt="Abstract technology background"
                />
            )}
            <div className="absolute inset-0 bg-gray-900 opacity-30"></div>
            <div className="absolute top-10 left-10">
                 <div className="flex items-center text-4xl font-bold text-white">
                    Course<span className="text-white/80">2</span>Career
                 </div>
                 <p className="mt-4 text-2xl font-semibold text-white max-w-sm">Connecting Talent with Opportunity.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;