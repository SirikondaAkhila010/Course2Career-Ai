
import React, { useState, useEffect } from 'react';
import type { EmployerProfile, Page } from '../../types';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { XIcon } from '../icons/XIcon';
import { BadgeCheckIcon } from '../icons/BadgeCheckIcon';

interface CompanyProfilePageProps {
  employerProfile: EmployerProfile | null;
  onUpdateProfile: (profile: EmployerProfile) => void;
  onNavigate: (page: Page) => void;
}

const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ employerProfile, onUpdateProfile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployerProfile | null>(employerProfile);

  useEffect(() => {
    if (!isEditing) {
      setFormData(employerProfile);
    }
  }, [employerProfile, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleBenefitChange = (index: number, value: string) => {
    setFormData(prev => {
        if (!prev) return null;
        const newBenefits = [...(prev.benefits || [])];
        newBenefits[index] = value;
        return { ...prev, benefits: newBenefits };
    });
  };

  const addBenefit = () => {
    setFormData(prev => {
        if (!prev) return null;
        return { ...prev, benefits: [...(prev.benefits || []), ''] };
    });
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => {
        if (!prev) return null;
        const newBenefits = (prev.benefits || []).filter((_, i) => i !== index);
        return { ...prev, benefits: newBenefits };
    });
  };

  // FIX: The FileList object is not an array, so we use a standard for loop to iterate it.
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => {
              if (!prev) return null;
              const newPhotos = [...(prev.galleryPhotos || []), reader.result as string];
              return { ...prev, galleryPhotos: newPhotos };
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removePhoto = (index: number) => {
     setFormData(prev => {
        if (!prev) return null;
        const newPhotos = (prev.galleryPhotos || []).filter((_, i) => i !== index);
        return { ...prev, galleryPhotos: newPhotos };
    });
  };

  const handleSave = () => {
    if (formData) {
      onUpdateProfile(formData);
      setIsEditing(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        let videoId = urlObj.searchParams.get('v');
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
        return null;
    }
  };

  if (!employerProfile) {
    return <div>Loading...</div>;
  }
  
  const youtubeEmbedUrl = getYoutubeEmbedUrl(formData?.cultureVideoUrl || '');

  const renderViewMode = () => (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          {formData?.companyName}
          {formData?.isVerified && <BadgeCheckIcon className="w-7 h-7 text-primary" title="Verified Company"/>}
        </h1>
        <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 mt-4 sm:mt-0 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus">
          <PencilIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>
      
      {formData?.companyWebsite && (
        <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline mt-4">
          <LinkIcon className="w-5 h-5 mr-2" />
          {formData.companyWebsite}
        </a>
      )}

      <div className="py-6 border-b"><h2 className="text-xl font-bold text-gray-800 mb-3">About Us</h2><p className="text-gray-700 leading-relaxed">{formData?.companyDescription || 'No description provided.'}</p></div>
      <div className="py-6 border-b"><h2 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h2><p className="text-gray-700 leading-relaxed">{formData?.missionStatement || 'No mission statement provided.'}</p></div>
      
      {youtubeEmbedUrl && (
        <div className="py-6 border-b"><h2 className="text-xl font-bold text-gray-800 mb-4">Company Culture</h2><div className="aspect-w-16 aspect-h-9"><iframe src={youtubeEmbedUrl} title="Company Culture Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg"></iframe></div></div>
      )}

      <div className="py-6 border-b"><h2 className="text-xl font-bold text-gray-800 mb-4">Benefits</h2>{(formData?.benefits && formData.benefits.length > 0) ? (<ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside">{formData.benefits.map((b, i) => <li key={i} className="text-gray-700">{b}</li>)}</ul>) : <p className="text-gray-500">No benefits listed.</p>}</div>
      
      <div className="pt-6"><h2 className="text-xl font-bold text-gray-800 mb-4">Gallery</h2>{(formData?.galleryPhotos && formData.galleryPhotos.length > 0) ? (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{formData.galleryPhotos.map((p, i) => <img key={i} src={p} alt={`Gallery image ${i+1}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />)}</div>) : <p className="text-gray-500">No photos uploaded.</p>}</div>
    </>
  );
  
  const renderEditMode = () => (
    <>
      <h1 className="text-3xl font-bold text-gray-900 pb-6 border-b">Editing Company Profile</h1>
      
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Website</label>
                <input type="url" name="companyWebsite" value={formData?.companyWebsite || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Number of Employees</label>
                <select 
                    name="employeeCount" 
                    value={formData?.employeeCount || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select a range</option>
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>201-1000</option>
                    <option>1000+</option>
                </select>
            </div>
        </div>

        <div><label className="block text-sm font-medium text-gray-700">About Us (Description)</label><textarea name="companyDescription" value={formData?.companyDescription || ''} onChange={handleInputChange} rows={5} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Mission Statement</label><textarea name="missionStatement" value={formData?.missionStatement || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        <div><label className="block text-sm font-medium text-gray-700">YouTube Culture Video URL</label><input type="url" name="cultureVideoUrl" value={formData?.cultureVideoUrl || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Benefits</label>
            <div className="space-y-2 mt-1">
                {(formData?.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" value={benefit} onChange={(e) => handleBenefitChange(index, e.target.value)} className="flex-grow border-gray-300 rounded-md" />
                        <button onClick={() => removeBenefit(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                ))}
            </div>
            <button onClick={addBenefit} className="mt-2 text-sm font-semibold text-primary">Add Benefit</button>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Gallery Photos</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                {(formData?.galleryPhotos || []).map((photo, index) => (
                    <div key={index} className="relative group">
                        <img src={photo} alt="" className="w-full h-24 object-cover rounded-md" />
                        <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100"><XIcon className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
        </div>

        <div className="mt-8 flex justify-end gap-4">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Save Changes</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-up max-w-4xl mx-auto">
      <button onClick={() => onNavigate('employer-dashboard')} className="text-sm font-semibold text-primary hover:underline mb-4">
        &larr; Back to Dashboard
      </button>
      <div className="flex items-center mb-6 border-t pt-4">
        <BuildingOfficeIcon className="h-10 w-10 text-primary" />
        <h2 className="ml-4 text-3xl font-bold text-gray-900">Company Profile</h2>
      </div>
      
      {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

export default CompanyProfilePage;
