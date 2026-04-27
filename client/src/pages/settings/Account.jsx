import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z oe$resolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../../../../shared/schemas.js';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../lib/api';
import { Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountSettings() {
  const logout = useAuthStore((s) => s.logout);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data) => {
    try { await userApi.changePassword(data); toast.success('Password changed'); reset(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try { await userApi.deleteAccount(); logout(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className='space-y-6'>
      <div className='card p-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-md'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Current Password</label>
            <input type='password' {...register('currentPassword')} className='input' />
            {errors.currentPassword && <p>errors.currentPassword.message</p>}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb'>New Password</label>
            <input type='password' {...register('newPassword')} className='input' />
            {errors.newPassword && <p>errors.newPassword.message</p>}
          </div>
          <button type='submit' className='btn-primary' disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Change Password'}
          </button>
        </form>
      </div>
      <div className='card p-6 border-red-200 dark:border-red-900'>
        <h2 className='text-lg font-semibold text-red-700 dark:text-red-400 mb-4'> Danger Zone</h2>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className='flex items-center gap-2 text-red-600 font-medium text-sm'>
            <Trash2 className='w-4 h-4' />
            Delete Account
          </button>
        ) : (
          <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-lg'>
            <p className='text-sm text-red-800 dark:text-red-300 font-medium mb-3'>Are you sure? This cannot be undone.</p>
            <div className='flex gap-3'>
              <button onClick={() => setConfirmDelete(false)} className='btn-secondary text-sm'>Cancel</button>
              <button onClick={handleDelete} className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium'>Yes, Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
