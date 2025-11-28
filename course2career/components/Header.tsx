
import React, { useState } from 'react';
import type { User, UserProfile, EmployerProfile, Page, AuthPage, Notification } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UserIcon } from './icons/UserIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BellIcon } from './icons/BellIcon';
import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './icons/SearchIcon';
import { BellAlertIcon } from './icons/BellAlertIcon';
import { timeAgo } from '../utils';

interface HeaderProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  employerProfile: EmployerProfile | null;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onNavigateAuth: (page: AuthPage) => void;
}

const NotificationsDropdown: React.FC<{ notifications: Notification[]; onMarkRead: () => void; }> = ({ notifications, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    onMarkRead();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-base-content hover:text-primary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-primary"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-base-100"></span>}
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-secondary ring-1 ring-secondary-focus focus:outline-none z-20 animate-fade-in"
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 border-b border-secondary-focus flex justify-between items-center">
              <p className="text-sm font-semibold text-secondary-content">Notifications</p>
              {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary hover:underline">Mark all as read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? notifications.map(notif => (
                <div key={notif.id} className={`block px-4 py-3 text-sm text-base-content hover:bg-secondary-focus ${!notif.read ? 'bg-primary/10' : ''}`} role="menuitem">
                  <p className="font-medium">{notif.text}</p>
                  <p className="text-xs text-gray-400">{timeAgo(notif.time)}</p>
                </div>
              )) : (
                <div className="text-center py-4 px-2 text-sm text-base-content">
                    You have no notifications.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ currentUser, userProfile, employerProfile, notifications, onMarkNotificationsRead, onLogout, onNavigate, onNavigateAuth }) => {

  const seekerNavLinks = [
    { name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, page: 'dashboard' as Page },
    { name: 'Job Search', icon: <BriefcaseIcon className="w-5 h-5" />, page: 'job-search' as Page },
    { name: 'Job Alerts', icon: <BellAlertIcon className="w-5 h-5" />, page: 'job-alerts' as Page },
    { name: 'Messages', icon: <ChatIcon className="w-5 h-5" />, page: 'messages' as Page },
    { name: 'AI Coach', icon: <SparklesIcon className="w-5 h-5" />, page: 'ai-chatbot' as Page },
    { name: 'My Profile', icon: <UserIcon className="w-5 h-5" />, page: 'user-profile' as Page },
  ];

  const employerNavLinks = [
    { name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, page: 'employer-dashboard' as Page },
    { name: 'My Postings', icon: <BriefcaseIcon className="w-5 h-5" />, page: 'employer-find-talent' as Page },
    { name: 'Talent Discovery', icon: <SearchIcon className="w-5 h-5" />, page: 'talent-discovery' as Page },
    { name: 'Company Profile', icon: <UserIcon className="w-5 h-5" />, page: 'employer-company-profile' as Page },
  ];

  const navLinks = currentUser?.userType === 'seeker' ? seekerNavLinks : employerNavLinks;

  return (
    <header className="bg-base-100/80 backdrop-blur-md shadow-md shadow-black/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
             <div 
                className="flex items-center text-2xl font-bold text-primary-content cursor-pointer" 
                onClick={() => currentUser ? onNavigate(currentUser.userType === 'seeker' ? 'dashboard' : 'employer-dashboard') : onNavigateAuth('landing')}
             >
                Course<span className="text-primary">2</span>Career
             </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentUser && (
                <>
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => onNavigate(link.page)}
                                className="flex items-center space-x-2 rounded-md px-3 py-2 text-base-content hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <NotificationsDropdown notifications={notifications} onMarkRead={onMarkNotificationsRead} />
                        <div className="hidden sm:flex items-center gap-4 pl-2">
                            <span className="text-base-content">
                                Welcome, {currentUser.userType === 'seeker' ? userProfile?.fullName?.split(' ')[0] : employerProfile?.companyName}
                            </span>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-focus transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;