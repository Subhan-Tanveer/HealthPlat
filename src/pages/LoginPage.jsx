import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
// Removed: import { FcGoogle } from "react-icons/fc";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from 'react-helmet';

// Import Firebase authentication functions and auth instance
import { signInWithEmailAndPassword } from 'firebase/auth'; // Removed: GoogleAuthProvider, signInWithPopup
import { auth } from '../pages/firebase-config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Firebase Login Error:", err.code, err.message);
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Removed: Function for "Login with Google"
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     await signInWithPopup(auth, provider);
      
  //     toast({
  //       title: "Login Successful",
  //       description: "Welcome back!",
  //       duration: 3000,
  //     });
  //     navigate('/dashboard');
  //   } catch (err) {
  //     console.error("Firebase Google Login Error:", err.code, err.message);
  //     if (err.code === 'auth/popup-closed-by-user') {
  //       setError('Google login window was closed.');
  //     } else if (err.code === 'auth/cancelled-popup-request') {
  //       setError('Another login request is already in progress.');
  //     } else {
  //       setError('Google login failed. Please try again.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <Helmet>
          <title>Login - HealthPlat</title>
          <meta name="description" content="Login to your HealthPlat account to access our healthcare services." />
      </Helmet>
      {/* Main container with two columns on medium screens and up */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Left Column: Image and Tagline (hidden on small screens) */}
          <div 
            className="hidden md:flex md:w-1/2 bg-cover bg-center p-8 flex-col justify-between"
            style={{ 
              backgroundImage: `url('https://placehold.co/600x800/2A628F/FFFFFF?text=Empowering+Healthcare')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="flex items-center">
              {/* Replace with your actual logo */}
              <img src="https://placehold.co/40x40/FFFFFF/2A628F?text=H" alt="Medigraph Logo" className="h-10 w-auto mr-2" />
              <span className="text-white text-2xl font-bold">HealthPlat</span>
            </div>
            <div className="text-white text-left mb-8">
              <h2 className="text-3xl font-bold mb-2">Empowering Healthcare, One Click at a Time.</h2>
              <p className="text-lg">Your Health. Your Records. Your Control.</p>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center items-center">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                {/* Logo at the top of the form */}
                <img src="https://cdn-icons-png.flaticon.com/512/4320/4320350.png" alt="Medigraph Logo" className="h-12 w-auto mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Login</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-10 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end text-sm">
                  <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Forgot Password?</a>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center" 
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" /> Login
                    </>
                  )}
                </Button>
              </form>

              {/* Removed: Google Sign-in section */}
              {/*
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleLogin} 
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 font-semibold py-2.5 rounded-md transition-colors duration-200 shadow-sm flex items-center justify-center"
                disabled={loading}
              >
                <FcGoogle  className="h-5 w-5 mr-2" /> Login with Google
              </Button>
              */}

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
