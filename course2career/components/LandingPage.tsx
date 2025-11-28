import React from 'react';
import type { AuthPage } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { ProfileCreationIcon } from './icons/ProfileCreationIcon';
import { ShortlistIcon } from './icons/ShortlistIcon';
import { GetHiredIcon } from './icons/GetHiredIcon';
import { InnovateIncLogo } from './icons/logos/InnovateIncLogo';
import { TechSolutionsLogo } from './icons/logos/TechSolutionsLogo';
import { DataDrivenCoLogo } from './icons/logos/DataDrivenCoLogo';
import { CloudScaleLogo } from './icons/logos/CloudScaleLogo';
import { CreativeMindsLogo } from './icons/logos/CreativeMindsLogo';
import { NextGenSystemsLogo } from './icons/logos/NextGenSystemsLogo';

// Section components to keep the main component clean
const HeroSection: React.FC<{ onNavigate: (page: AuthPage) => void }> = ({ onNavigate }) => (
  <section className="relative text-center py-20 md:py-32 bg-base-100 overflow-hidden isolate">
    <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-0 w-1/2 h-full bg-gradient-to-br from-primary/20 to-purple-400/10 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 right-0 w-1/2 h-full bg-gradient-to-tl from-teal-400/20 to-primary/10 rounded-full blur-3xl opacity-50 animate-pulse-slow animation-delay-2000"></div>
    </div>
    <div className="container mx-auto px-4 relative z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold text-primary-content leading-tight animate-fade-in-up">
        Find Your Dream <span className="text-primary">Tech</span> Job
      </h1>
      <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-base-content animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        Our AI-powered platform connects talented students and recent graduates with top companies for internships and full-time roles.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <button
          onClick={() => onNavigate('seeker-login')}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-focus transition-transform transform hover:scale-105 shadow-lg"
        >
          I'm Looking for a Job
        </button>
        <button
          onClick={() => onNavigate('employer-login')}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-secondary-content bg-secondary hover:bg-secondary-focus transition-transform transform hover:scale-105 shadow-lg"
        >
          I'm Hiring
        </button>
      </div>
    </div>
  </section>
);

const AiPoweredSection: React.FC = () => {
  const features = [
    {
      icon: <ClipboardDocumentCheckIcon className="h-10 w-10 text-primary" />,
      title: 'AI Profile Builder',
      description: 'Instantly parse your resume into a complete, professional profile optimized to catch recruiters\' attention.',
    },
    {
      icon: <CpuChipIcon className="h-10 w-10 text-primary" />,
      title: 'Intelligent Job Matching',
      description: 'Our machine learning models analyze your skills and aspirations to recommend jobs with the highest chance of success.',
    },
    {
      icon: <CodeBracketIcon className="h-10 w-10 text-primary" />,
      title: 'AI Career Coach',
      description: 'Get AI-driven insights into potential career paths, skill gaps, and recommended learning resources to achieve your goals.',
    },
  ];

  return (
    <section className="py-20 bg-base-100 relative">
        <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-content">Powered By Next-Gen AI</h2>
            <p className="mt-4 text-lg text-base-content">The ultimate toolkit for your career launch.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <div key={index} className="text-center p-8 bg-secondary/50 border border-secondary-focus rounded-lg hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 hover:border-primary/50">
                <div className="flex items-center justify-center h-20 w-20 mx-auto bg-base-100 rounded-full">
                    {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-secondary-content">{feature.title}</h3>
                <p className="mt-2 text-base-content">{feature.description}</p>
                </div>
            ))}
            </div>
      </div>
    </section>
  );
};

const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            icon: <ProfileCreationIcon className="w-10 h-10 text-primary"/>,
            title: "Create Your Profile",
            description: "Sign up and let our AI build a comprehensive, professional profile from your resume in minutes."
        },
        {
            icon: <ShortlistIcon className="w-10 h-10 text-primary"/>,
            title: "Get Shortlisted",
            description: "Our intelligent matching algorithm connects your profile with the most relevant job opportunities from top companies."
        },
        {
            icon: <GetHiredIcon className="w-10 h-10 text-primary"/>,
            title: "Get Hired",
            description: "Apply with a single click, prepare with our AI coach, and land your dream internship or fresher job."
        },
    ];

    return (
        <section className="py-20 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-content">How It Works</h2>
                    <p className="mt-4 text-lg text-base-content">Three simple steps to your dream job.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                    {steps.map((item, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center">
                            <div className="flex items-center justify-center w-20 h-20 bg-base-100 rounded-full shadow-lg z-10">
                                {item.icon}
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-secondary-content">{item.title}</h3>
                            <p className="mt-2 text-base-content">{item.description}</p>
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 border-t-2 border-dashed border-secondary-focus"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const TrustedBySection: React.FC = () => {
    const trustedCompanies = [
        { name: 'Innovate Inc.', component: <InnovateIncLogo /> },
        { name: 'Tech Solutions', component: <TechSolutionsLogo /> },
        { name: 'DataDriven Co.', component: <DataDrivenCoLogo /> },
        { name: 'CloudScale', component: <CloudScaleLogo /> },
        { name: 'Creative Minds', component: <CreativeMindsLogo /> },
        { name: 'NextGen Systems', component: <NextGenSystemsLogo /> },
    ];

    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-2xl font-semibold text-base-content mb-12">
                    Trusted By Top Companies & Startups
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-8 items-center">
                    {trustedCompanies.map((company) => (
                        <div key={company.name} className="flex justify-center h-12" title={company.name}>
                            {React.cloneElement(company.component, { 
                                className: "h-full w-auto text-gray-500 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300" 
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            quote: "Course2Career's AI resume builder was a game-changer. I had a professional profile in minutes and got interview calls within a week!",
            name: "Priya Sharma",
            role: "Software Engineer at Innovate Inc.",
        },
        {
            quote: "The job matching is incredibly accurate. I found an internship that perfectly matched my skills and career goals. Highly recommended for all students.",
            name: "Rohan Verma",
            role: "Data Science Intern at Tech Solutions LLC",
        },
    ];
    
    return (
        <section className="py-20 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-content">Success Stories</h2>
                    <p className="mt-4 text-lg text-base-content">Hear from students who launched their careers with us.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-base-100 p-8 rounded-lg shadow-lg">
                            <p className="text-base-content italic">"{testimonial.quote}"</p>
                            <div className="flex items-center mt-6">
                                <img
                                    src={`https://i.pravatar.cc/150?u=${testimonial.name.replace(/\s/g, '')}`}
                                    alt={`Headshot of ${testimonial.name}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="ml-4">
                                    <p className="font-semibold text-secondary-content">{testimonial.name}</p>
                                    <p className="text-base-content text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FinalCTASection: React.FC<{ onNavigate: (page: AuthPage) => void }> = ({ onNavigate }) => (
    <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-content">Ready to Launch Your Career?</h2>
            <p className="mt-4 text-lg text-base-content max-w-2xl mx-auto">
                Join thousands of students and freshers on the #1 platform for career success.
            </p>
            <button
                onClick={() => onNavigate('seeker-signup')}
                className="mt-8 inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-primary hover:bg-primary-focus transition-transform transform hover:scale-105 shadow-lg"
            >
                Get Started for Free
            </button>
        </div>
    </section>
);


interface LandingPageProps {
  onNavigate: (page: AuthPage) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in bg-base-100">
        <HeroSection onNavigate={onNavigate} />
        <TrustedBySection />
        <AiPoweredSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;