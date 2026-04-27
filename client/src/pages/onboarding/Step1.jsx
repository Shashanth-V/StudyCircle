import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileStep1Schema } from '../../../../shared/schemas.js';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../lib/api';
import { Camera, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [previewPhoto, setPreviewPhoto] = useState(user?.profilePhoto || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const res = await userApi.uploadPhoto(file);
      setValue('profilePhoto', res.data.url);
      updateProfile({ profilePhoto: res.data.url });
      toast.success('Photo uploaded');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await userApi.updateMe(data);
      updateProfile(data);
      navigate('/onboarding/step2');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-primary-600 dark:text-primary-400">Step 1 of 3</span>
            <span className="text-gray-500 dark:text-gray-400">Profile info</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary-600 rounded-full transition-all" />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Let's set up your profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us a bit about yourself</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Photo upload */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors"
              >
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to upload photo</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                {...register('name')}
                className="input"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio <span className="text-gray-400 font-normal">(optional, max 200 chars)</span>
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="input resize-none"
                placeholder="Tell others about your study interests..."
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.bio.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

