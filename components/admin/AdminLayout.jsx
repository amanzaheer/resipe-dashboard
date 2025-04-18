import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  ChefHat,
  Settings,
  Bell,
  Search,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const menuItems = [
    { 
      href: '/admin/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      description: 'Overview and statistics'
    },
    { 
      href: '/admin/recipes', 
      icon: BookOpen, 
      label: 'Recipes',
      description: 'Manage all recipes'
    },
    { 
      href: '/admin/users', 
      icon: Users, 
      label: 'Users',
      description: 'User management'
    },
    { 
      href: '/admin/reviews', 
      icon: MessageSquare, 
      label: 'Reviews',
      description: 'Review management'
    },
    
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="flex flex-col items-center gap-4">
          <ChefHat className="h-12 w-12 text-amber-600 animate-bounce" />
          <div className="text-amber-600">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-amber-100 z-40">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-amber-50 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-amber-600" />
              ) : (
                <Menu className="h-6 w-6 text-amber-600" />
              )}
            </button>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-amber-900 hidden md:block">
                Recipe Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-9 w-64 border-slate-200"
              />
            </div>
            
            <button className="relative p-2 hover:bg-amber-50 rounded-lg">
              <Bell className="h-5 w-5 text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-amber-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-900'
                        : 'text-slate-600 hover:bg-amber-50/50 hover:text-amber-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-amber-100">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 lg:pl-64 min-h-screen transition-all duration-200 ${
        isMobileMenuOpen ? 'pl-64' : 'pl-0'
      }`}>
        {children}
      </main>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 