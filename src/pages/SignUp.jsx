import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Removed: signInWithPopup, GoogleAuthProvider
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Import getDoc and updateDoc for Google sign-in
import { auth, db } from '../pages/firebase-config'; // Import auth and db instances
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Mail, Lock, UserPlus, User, MapPin, Calendar, Globe, Building } from 'lucide-react'; // Added more icons
// Removed: import { FcGoogle } from "react-icons/fc"; // Import FcGoogle for Google icon
import { Helmet } from 'react-helmet';

const SignUp = () => {
  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State for additional user details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // State for UI feedback
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to save user data to Firestore
  const saveUserDataToFirestore = async (uid, userData) => {
    try {
      // Create a document in 'users' collection with the user's UID as the document ID
      await setDoc(doc(db, 'users', uid), userData);
      console.log('User data saved to Firestore successfully!');
    } catch (firestoreError) {
      console.error('Error saving user data to Firestore:', firestoreError);
      setError('Failed to save user details. Please try again.');
      throw firestoreError; // Re-throw to be caught by the main signup/login handler
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // 1. Create user with email and password using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      // 2. Prepare additional user data
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: user.email, // Use email from Firebase auth
        address: address,
        age: parseInt(age), // Convert age to number
        gender: gender,
        city: city,
        country: country,
        createdAt: new Date(), // Timestamp for when the account was created
        // You can add more fields here like photoURL, displayName if needed
      };

      // 3. Save additional user data to Firestore
      await saveUserDataToFirestore(user.uid, userData);
      
      setSuccess(true);
      toast({
        title: "Sign Up Successful",
        description: "Your account has been created! Please log in.",
        duration: 4000,
      });
      // Clear form fields
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setAddress('');
      setAge('');
      setGender('');
      setCity('');
      setCountry('');

      navigate('/login'); // Redirect to login page after successful sign-up
    } catch (err) {
      console.error('Sign-up error:', err.code, err.message);
      // Firebase provides specific error codes you can handle
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please try logging in or use a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Sign up failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Removed: handleGoogleLogin function
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setSuccess(false);

  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;

  //     console.log('Google Sign-up successful:', user);

  //     // Check if user data already exists in Firestore
  //     const userDocRef = doc(db, 'users', user.uid);
  //     const userDocSnap = await getDoc(userDocRef); // Use getDoc to check existence

  //     if (!userDocSnap.exists()) {
  //       // If user is new or data doesn't exist, save basic info from Google
  //       // You might want to prompt the user for missing fields (address, age, gender, city, country)
  //       // or set them to empty/default values for now.
  //       const userData = {
  //         firstName: user.displayName ? user.displayName.split(' ')[0] : '',
  //         lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
  //         email: user.email,
  //         photoURL: user.photoURL,
  //         // For now, set these to empty strings or prompt the user later
  //         address: '', 
  //         age: null, 
  //         gender: '', 
  //         city: '', 
  //         country: '',
  //         createdAt: new Date(),
  //         lastLogin: new Date(),
  //       };
  //       await saveUserDataToFirestore(user.uid, userData);
  //     } else {
  //       // If user already exists, you can update their last login time or other fields
  //       await updateDoc(userDocRef, { lastLogin: new Date() });
  //     }

  //     setSuccess(true);
  //     toast({
  //       title: "Google Login Successful",
  //       description: "Welcome! You've successfully signed up with Google.",
  //       duration: 3000,
  //     });
  //     navigate('/dashboard'); // Redirect to dashboard after successful Google sign-up/login
  //   } catch (err) {
  //     console.error('Google sign-up error:', err.code, err.message);
  //     if (err.code === 'auth/popup-closed-by-user') {
  //       setError('Google sign-up cancelled.');
  //     } else if (err.code === 'auth/cancelled-popup-request') {
  //       setError('Another sign-up pop-up was already open.');
  //     } else if (err.code === 'auth/account-exists-with-different-credential') {
  //       setError('An account with this email already exists. Please log in with your email and password.');
  //     } else {
  //       setError('Google sign-up failed: ' + err.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <Helmet>
          <title>Sign Up - HealthPlat</title>
          <meta name="description" content="Create your HealthPlat account to access our healthcare services." />
      </Helmet>
      {/* Main container with two columns on medium screens and up */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex w-full max-w-9xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden" // Increased max-w from 5xl to 6xl
        >
          {/* Left Column: Image and Tagline (hidden on small screens) */}
          <div 
            className="hidden md:flex md:w-3/5 bg-cover bg-center p-8 flex-col justify-between" // Changed md:w-1/2 to md:w-3/5
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
              <span className="text-white text-2xl font-bold">MEDIGRAPH</span>
            </div>
            <div className="text-white text-left mb-8">
              <h2 className="text-3xl font-bold mb-2">Empowering Healthcare, One Click at a Time.</h2>
              <p className="text-lg">Your Health. Your Records. Your Control.</p>
            </div>
          </div>

          {/* Right Column: Sign Up Form */}
          <div className="w-full md:w-2/5 p-8 sm:p-12 flex flex-col justify-center items-center"> {/* Changed md:w-1/2 to md:w-2/5 */}
            <div className="w-full max-w-md"> {/* Increased max-w-sm to max-w-md for the form itself */}
              <div className="text-center mb-8">
                {/* Logo at the top of the form */}
                <img src="https://cdn-icons-png.flaticon.com/512/4320/4320350.png" alt="Medigraph Logo" className="h-12 w-auto mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Create Your Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign up to get started with HealthPlat.</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4"> {/* Adjusted spacing */}
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
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

                {/* Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Age and Gender (side-by-side on larger screens) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        min="0"
                        max="120"
                        disabled={loading}
                        className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 appearance-none" // appearance-none to allow custom arrow
                      >
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {/* Custom arrow for select */}
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter your city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="country"
                      type="text"
                      placeholder="Enter your country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-3 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="text-sm text-green-500 text-center">Account created successfully!</p>}
                
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
                      <UserPlus className="h-5 w-5 mr-2" /> Sign Up
                    </>
                  )}
                </Button>
              </form>

              {/* Removed: Google Sign-up section */}
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
              >
                <FcGoogle  className="h-5 w-5 mr-2" /> Sign Up with Google
              </Button>
              */}

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Login
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignUp;
