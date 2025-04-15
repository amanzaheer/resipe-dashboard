import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Book, 
  Heart, 
  LogIn, 
  UserPlus, 
  Menu,
  X,
  Search,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MainLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Recipes', href: '/recipes', icon: Book },
    { name: 'Favorites', href: '/favorites', icon: Heart },
  ];

  const authLinks = [
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Sign Up', href: '/signup', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  RecipeDash
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                      {item.name}
                      {isActive && <ChevronRight className="ml-1 h-3 w-3 text-amber-500" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 hidden sm:flex items-center">
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search recipes..."
                  className="w-full pl-10 bg-amber-50 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Desktop Auth Links */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
              {authLinks.map((item) => {
                const Icon = item.icon;
                const isLogin = item.name === 'Login';
                return (
                  <Button
                    key={item.name}
                    variant={isLogin ? 'outline' : 'default'}
                    className={`flex items-center ${
                      isLogin 
                        ? 'border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                    asChild
                  >
                    <Link href={item.href} className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-md p-2 hover:bg-amber-50 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-amber-700" />
                ) : (
                  <Menu className="h-6 w-6 text-amber-700" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-amber-100">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                      isActive
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-amber-500" />}
                  </Link>
                );
              })}
              
              <div className="pt-4 pb-2 border-t border-amber-100">
                <div className="px-3 py-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Account
                </div>
                {authLinks.map((item) => {
                  const Icon = item.icon;
                  const isLogin = item.name === 'Login';
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                        isLogin
                          ? 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                          : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${isLogin ? 'text-gray-500' : 'text-amber-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="pt-4 pb-2 border-t border-amber-100">
                <div className="px-3 py-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Search
                </div>
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search recipes..."
                      className="w-full pl-10 bg-amber-50 border-amber-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-amber-100">
          {children}
        </div>
      </main>
    </div>
  );
} 