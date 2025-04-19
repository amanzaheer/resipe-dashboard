import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, User, Mail, FileText, Camera, Save } from 'lucide-react';

export default function ProfileDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-gradient-to-r from-orange-50 via-amber-100/50 to-orange-50 border-b border-orange-100">
          <DialogTitle className="text-2xl font-semibold text-orange-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            Edit Profile
          </DialogTitle>
          <p className="text-orange-600/80 mt-1">Update your personal information</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-5">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 bg-orange-50 flex items-center justify-center shadow-lg">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-orange-300" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Bio
              </Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30 p-3"
                placeholder="Tell us about yourself"
              />
            </div>

            {/* Avatar URL Field */}
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Camera className="h-4 w-4 text-orange-500" />
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30"
                placeholder="Enter avatar URL"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4 border-t border-orange-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-orange-200 hover:bg-orange-50 text-orange-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-100/50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 