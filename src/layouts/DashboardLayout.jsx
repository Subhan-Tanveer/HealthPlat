import React, { useState, useEffect, useRef } from 'react'; // Import useRef for dropdown
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // Removed Outlet as children prop is used
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LayoutGrid,
  Stethoscope,
  Video,
  Beaker,
  Truck,
  PhoneCall,
  MessageSquare,
  Newspaper,
  BookOpen,
  Ticket,
  Bot,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Loader2, // Import Loader2 for loading state
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

// Import Firebase authentication functions and auth instance
import { signOut } from 'firebase/auth'; // Removed onAuthStateChanged as it's handled in App.jsx
import { auth } from '../pages/firebase-config'; // FIX: Adjust path to go up one level

// FIX: Modified SidebarLink to conditionally render text based on isCollapsed
const SidebarLink = ({ to, icon: Icon, children, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        } ${isCollapsed ? 'justify-center' : ''}` // Adjusted alignment for collapsed state
      }
      end={to === '/dashboard'} // 'end' prop ensures exact match for parent routes like /dashboard
    >
      <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-4' : ''}`} />
      {/* FIX: Conditionally render the span. It will only exist in the DOM when not collapsed. */}
      {!isCollapsed && (
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {children}
        </span>
      )}
    </NavLink>
  );
};

// DashboardLayout now accepts currentUser as a prop from App.jsx
const DashboardLayout = ({ children, currentUser }) => { // Receive currentUser prop
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Removed currentUser and loadingAuth states from here, App.jsx manages them
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // New state for dropdown
  const dropdownRef = useRef(null); // Ref for dropdown element
  const navigate = useNavigate(); // Still needed for internal navigation (e.g., to profile)
  const location = useLocation(); // Still needed for location.pathname in motion.div key
  const { toast } = useToast();

  // Removed useEffect for onAuthStateChanged from here. App.jsx handles it.

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        duration: 3000,
      });
      setIsDropdownOpen(false); // Close dropdown on logout
      // No explicit navigate('/login') here; App.jsx's onAuthStateChanged will handle it
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const showNotImplementedToast = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  // FIX: Updated 'to' paths to be top-level for consistency with App.jsx routing
  const menuItems = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/book-doctor', icon: Stethoscope, label: 'Book Doctor' },
    // { to: '/online-consultations', icon: Video, label: 'Online Consultations' },
    { to: '/lab-tests', icon: Beaker, label: 'Lab Tests' },
    // { to: '/medicine-delivery', icon: Truck, label: 'Medicine Delivery' },
    // { to: '/call-doctor-now', icon: PhoneCall, label: 'Call Doctor Now' },
    { to: '/health-forum', icon: MessageSquare, label: 'Health Forum' },
    { to: '/blog', icon: Newspaper, label: 'Blog' },
    { to: '/directory', icon: BookOpen, label: 'Hospitals' },
    // { to: '/offers', icon: Ticket, label: 'Offers & Discounts' },
    { to: '/ai-tools', icon: Bot, label: 'AI Tools' },
    { to: '/profile', icon: User, label: 'Profile & Settings' },
  ];

  // Removed loadingAuth and !currentUser checks from here. App.jsx handles them.

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className={`flex items-center p-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {/* FIX: Conditionally render HealthPlat name based on isSidebarCollapsed */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img  className="h-8 w-auto" alt="Logo" src="https://cdn-icons-png.flaticon.com/512/4320/4320350.png" />
          {!isSidebarCollapsed && ( // Only render text if not collapsed
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">&nbsp;&nbsp;&nbsp;HealthPlat</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          <ChevronLeft className={`h-6 w-6 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarLink key={item.to} to={item.to} icon={item.icon} isCollapsed={isSidebarCollapsed}>
            {item.label} {/* Pass the label as children */}
          </SidebarLink>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center p-3 w-full rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800 ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-4' : ''}`} />
          {/* FIX: Conditionally render the Logout span */}
          {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden shadow-lg"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`hidden lg:block transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Welcome Back!</h1>
          <div className="relative flex items-center gap-4" ref={dropdownRef}> {/* Add ref to the container */}
            <Button variant="ghost" size="icon" onClick={showNotImplementedToast} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img  className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="User Avatar" 
                    src={currentUser?.photoURL || `https://placehold.co/40x40/E0F2F7/0288D1?text=${currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}`} />
              <div className="hidden sm:block">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700"
                >
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                  >
                    <User className="h-4 w-4 mr-2" /> Profile & Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* This is where the content of the specific page will be rendered */}
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
