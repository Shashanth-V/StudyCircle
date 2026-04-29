import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { profileStep1Schema } from '../../../../shared/schemas.js';
import { updateMe, uploadProfilePhoto } from '../../api/users';
import { useAuthStore } from '../../stores/authStore';

export default function Step1() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(user?.profilePhoto || '');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' }
  });

  const bio = watch('bio') || '';

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await uploadProfilePhoto(formData);
      setPhoto(res.data.profilePhoto);
      setUser({ ...user, profilePhoto: res.data.profilePhoto });
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await updateMe(data);
      setUser(res.data);
      navigate('/onboarding/step2');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 1: Basic Info</h2>
        <p className="text-gray-500 dark:text-gray-400">Let's set up your profile picture and bio.</p>
      </div>

      <div className="flex flex-col items-center">
        <img
          src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=6366f1&color=fff`}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
        />
        <label className="mt-4 cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Upload Photo
          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Tell us about yourself..."
          />
          <div className="flex justify-between mt-1">
            <span className="text-red-500 text-xs">{errors.bio?.message}</span>
            <span className="text-xs text-gray-500">{bio.length}/200</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
}
