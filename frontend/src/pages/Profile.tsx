import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApiPut } from '../hooks/useApi';
import { User } from '../types';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateProfile = useApiPut<User>(`/users/${user?.id}`);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile.mutateAsync(formData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-400">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 text-gray-800 capitalize">{user?.role}</span>
              </div>
              <div>
                <span className="text-gray-500">Tenant:</span>
                <span className="ml-2 text-gray-800">{user?.tenantId}</span>
              </div>
              <div>
                <span className="text-gray-500">Member since:</span>
                <span className="ml-2 text-gray-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-primary-400 transition-colors"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}