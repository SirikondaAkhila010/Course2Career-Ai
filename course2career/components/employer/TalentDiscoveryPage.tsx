
import React, { useState, useMemo } from 'react';
import type { UserProfile } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';

interface TalentDiscoveryPageProps {
  allSeekerProfiles: UserProfile[];
}

const ProfileCard: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="bg-secondary border border-secondary-focus rounded-lg p-6 flex flex-col text-center items-center hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 hover:-translate-y-1 transform">
    {profile.profilePhoto ? (
      <img src={profile.profilePhoto} alt={profile.fullName} className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary-focus" />
    ) : (
      <div className="w-24 h-24 rounded-full bg-base-100 flex items-center justify-center ring-4 ring-secondary-focus">
        <UserIcon className="w-12 h-12 text-base-content" />
      </div>
    )}
    <h3 className="mt-4 text-lg font-bold text-secondary-content flex items-center gap-2">
        {profile.fullName}
        {profile.isVerified && <BadgeCheckIcon className="w-5 h-5 text-primary" title="Verified Profile" />}
    </h3>
    <p className="text-sm text-base-content">{profile.education?.undergraduate?.degree || 'Student'}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {(profile.skills || []).slice(0, 4).map(skill => (
        <span key={skill} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/20 text-primary">
          {skill}
        </span>
      ))}
    </div>
    <button className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-primary-focus transition-colors">
      View Profile
    </button>
  </div>
);


const TalentDiscoveryPage: React.FC<TalentDiscoveryPageProps> = ({ allSeekerProfiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const filteredProfiles = useMemo(() => {
    return allSeekerProfiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      const skillLower = skillFilter.toLowerCase();

      const matchesSearch = searchLower === '' ||
        profile.fullName.toLowerCase().includes(searchLower) ||
        profile.education?.undergraduate?.degree?.toLowerCase().includes(searchLower);

      const matchesSkill = skillLower === '' ||
        (profile.skills || []).some(s => s.toLowerCase().includes(skillLower));

      return matchesSearch && matchesSkill;
    });
  }, [allSeekerProfiles, searchTerm, skillFilter]);

  return (
    <div className="animate-fade-in-up">
      <div className="bg-secondary border border-secondary-focus p-8 rounded-lg shadow-lg mb-8">
        <div className="flex items-center">
          <SearchIcon className="h-10 w-10 text-primary" />
          <div className="ml-4">
            <h2 className="text-3xl font-bold text-secondary-content">Talent Discovery</h2>
            <p className="mt-1 text-lg text-base-content">
              Proactively find the best candidates for your company.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Search by name, degree..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-base-100 border border-secondary-focus rounded-md text-secondary-content placeholder-base-content focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Filter by skill (e.g., React)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full px-4 py-3 bg-base-100 border border-secondary-focus rounded-md text-secondary-content placeholder-base-content focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map(profile => (
            <ProfileCard key={profile.email} profile={profile} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-secondary rounded-lg">
            <UserIcon className="mx-auto h-12 w-12 text-base-content" />
            <h3 className="mt-2 text-lg font-medium text-secondary-content">No Profiles Found</h3>
            <p className="mt-1 text-sm text-base-content">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDiscoveryPage;
