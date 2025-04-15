import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Star, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  User,
  ChevronRight
} from 'lucide-react';

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/recipes', icon: BookOpen, label: 'Recipes' },
    { href: '/dashboard/favorites', icon: Star, label: 'Favorites' },
    { href: '/dashboard/reviews', icon: MessageSquare, label: 'My Reviews' },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-amber-50 transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-amber-700" />
          ) : (
            <Menu className="h-6 w-6 text-amber-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-amber-100">
            <h1 className="text-2xl font-bold text-amber-600">Recipe Dashboard</h1>
            <div className="flex items-center mt-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <p className="ml-2 text-sm font-medium text-gray-700">{user?.name}</p>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 text-amber-500" />}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-amber-100">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-amber-100">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 