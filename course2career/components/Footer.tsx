import React from 'react';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { InstagramIcon } from './icons/InstagramIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-base-100 border-t border-gray-200 dark:border-secondary">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              Course<span className="text-primary">2</span>Career
            </div>
            <p className="text-sm text-gray-500 dark:text-base-content mt-1">&copy; {new Date().getFullYear()} Course2Career. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 dark:text-base-content hover:text-primary" aria-label="LinkedIn">
              <LinkedinIcon className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-500 dark:text-base-content hover:text-primary" aria-label="Twitter">
              <TwitterIcon className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-500 dark:text-base-content hover:text-primary" aria-label="Instagram">
              <InstagramIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;