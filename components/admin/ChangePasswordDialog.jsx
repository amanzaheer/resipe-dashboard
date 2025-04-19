import { useState } from 'react';
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
import { Loader2, Lock, KeyRound, Shield } from 'lucide-react';

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      onOpenChange(false);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
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
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            Change Password
          </DialogTitle>
          <p className="text-orange-600/80 mt-1">Update your account security</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label 
                htmlFor="currentPassword" 
                className="text-sm font-medium text-orange-900 flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4 text-orange-500" />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30 pr-10"
                  placeholder="Enter current password"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="newPassword" 
                className="text-sm font-medium text-orange-900 flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4 text-orange-500" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30 pr-10"
                  placeholder="Enter new password"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="confirmPassword" 
                className="text-sm font-medium text-orange-900 flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4 text-orange-500" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30 pr-10"
                  placeholder="Confirm new password"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              </div>
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
                  Changing Password...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 