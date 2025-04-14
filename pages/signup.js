import MainLayout from '@/components/layout/MainLayout';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignUpForm />
      </div>
    </MainLayout>
  );
} 