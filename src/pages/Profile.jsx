import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch'; // Assuming you have a Switch component
import { useToast } from "@/components/ui/use-toast";
import {
  User, Shield, Bell, Settings, Lock, Mail, Phone, Calendar, MapPin, Globe,
  Eye, EyeOff, Loader2, Download, Trash2,
} from 'lucide-react'; // Added icons

// Firebase imports
import { auth, db } from '../pages/firebase-config'; // Adjust path as necessary
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth'; // For password change and reauthentication

// Import activity logger
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

const Profile = () => {
  const { toast } = useToast();

  // State for active tab
  const [activeTab, setActiveTab] = useState('profile');

  // State for user profile data
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
    city: '',
    country: '',
    photoURL: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State for security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState(null);
  const [securitySuccess, setSecuritySuccess] = useState(null);

  const [smsAuthEnabled, setSmsAuthEnabled] = useState(true); // Example for switch
  const [dataSharingEnabled, setDataSharingEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // State for notification preferences
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [blogUpdates, setBlogUpdates] = useState(true);
  const [aiInsightsNotifications, setAiInsightsNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  // State for app preferences
  const [appLanguage, setAppLanguage] = useState('English'); // Default language
  const [appTheme, setAppTheme] = useState('System Default'); // Default theme

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setLoadingProfile(true);
        setProfileError(null);
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || currentUser.email, // Fallback to auth email
              phone: data.phone || '',
              address: data.address || '',
              age: data.age || '',
              gender: data.gender || '',
              city: data.city || '',
              country: data.country || '',
              photoURL: currentUser.photoURL || `https://placehold.co/40x40/E0F2F7/0288D1?text=${data.firstName ? data.firstName[0].toUpperCase() : 'U'}`,
            });
            // Also set notification/preference states from fetched data if they exist
            setHealthAlerts(data.notificationPreferences?.healthAlerts ?? true);
            setAppointmentReminders(data.notificationPreferences?.appointmentReminders ?? true);
            setBlogUpdates(data.notificationPreferences?.blogUpdates ?? true);
            setAiInsightsNotifications(data.notificationPreferences?.aiInsightsNotifications ?? true);
            setMarketingNotifications(data.notificationPreferences?.marketingNotifications ?? false);

            setSmsAuthEnabled(data.securitySettings?.smsAuthEnabled ?? true);
            setDataSharingEnabled(data.securitySettings?.dataSharingEnabled ?? true);
            setAnalyticsEnabled(data.securitySettings?.analyticsEnabled ?? true);

            setAppLanguage(data.appPreferences?.language ?? 'English');
            setAppTheme(data.appPreferences?.theme ?? 'System Default');

          } else {
            setProfileError("User data not found in Firestore. Please ensure you signed up correctly.");
            // Optionally, populate with auth data if Firestore data is missing
            setUserData(prev => ({
              ...prev,
              email: currentUser.email,
              photoURL: currentUser.photoURL || `https://placehold.co/40x40/E0F2F7/0288D1?text=${currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}`,
            }));
          }
          setLoadingProfile(false);
        }, (err) => {
          console.error("Error fetching user data:", err);
          setProfileError(`Failed to load user data: ${err.message}`);
          setLoadingProfile(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } else {
        setLoadingProfile(false);
        setProfileError("No authenticated user found. Please log in.");
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run once on mount


  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };

  // Save updated profile information to Firestore
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          age: parseInt(userData.age) || null,
          gender: userData.gender,
          city: userData.city,
          country: userData.country,
          // Do not update email here, as it requires Firebase Auth specific methods
        });
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
          duration: 3000,
        });
        setIsEditingProfile(false); // Exit edit mode

        // Log the activity after successful profile save
        // Corrected logActivity call: type, description, details
        logActivity('profile_update', `Updated profile information for ${userData.firstName} ${userData.lastName}`, { userId: currentUser.uid, firstName: userData.firstName, lastName: userData.lastName });

      } else {
        setProfileError("No authenticated user to save profile.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileError(`Failed to save profile: ${err.message}`);
      toast({
        title: "Profile Update Failed",
        description: "There was an error saving your profile.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword !== confirmNewPassword) {
      setSecurityError("New password and confirm password do not match.");
      setSecurityLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError("New password must be at least 6 characters long.");
      setSecurityLoading(false);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setSecurityError("No authenticated user found or email is missing.");
      setSecurityLoading(false);
      return;
    }

    try {
      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updatePassword(currentUser, newPassword);
      setSecuritySuccess("Password updated successfully!");
      toast({
        title: "Password Updated",
        description: "Your password has been changed.",
        duration: 3000,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.code === 'auth/wrong-password') {
        setSecurityError("Incorrect current password. Please try again.");
      } else if (err.code === 'auth/user-not-found') {
        setSecurityError("User not found. Please log in again.");
      } else if (err.code === 'auth/too-many-requests') {
        setSecurityError("Too many failed attempts. Please try again later.");
      } else {
        setSecurityError(`Failed to change password: ${err.message}`);
      }
      toast({
        title: "Password Change Failed",
        description: "There was an error changing your password.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle notification preference changes and save to Firestore
  const handleNotificationToggle = async (key, value) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Error", description: "Please log in to update preferences.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [`notificationPreferences.${key}`]: value
      });
      toast({ title: "Preferences Saved", description: "Notification preferences updated.", duration: 2000 });
    } catch (err) {
      console.error("Error updating notification preference:", err);
      toast({ title: "Error", description: "Failed to update notification preference.", variant: "destructive" });
    }
  };

  // Handle security setting changes and save to Firestore
  const handleSecurityToggle = async (key, value) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Error", description: "Please log in to update settings.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [`securitySettings.${key}`]: value
      });
      toast({ title: "Settings Saved", description: "Security settings updated.", duration: 2000 });
    } catch (err) {
      console.error("Error updating security setting:", err);
      toast({ title: "Error", description: "Failed to update security setting.", variant: "destructive" });
    }
  };

  // Handle app preference changes and save to Firestore
  const handleAppPreferenceChange = async (key, value) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Error", description: "Please log in to update preferences.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [`appPreferences.${key}`]: value
      });
      toast({ title: "Preferences Saved", description: "App preferences updated.", duration: 2000 });
    } catch (err) {
      console.error("Error updating app preference:", err);
      toast({ title: "Error", description: "Failed to update app preference.", variant: "destructive" });
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      profile: userData,
      notificationPreferences: {
        healthAlerts, appointmentReminders, blogUpdates, aiInsightsNotifications, marketingNotifications
      },
      securitySettings: {
        smsAuthEnabled, dataSharingEnabled, analyticsEnabled
      },
      appPreferences: {
        language: appLanguage, theme: appTheme
      }
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthplat_user_data_${auth.currentUser?.uid || 'guest'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your user data has been successfully exported.",
      duration: 3000,
    });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }

    try {
      // Reauthentication is often required for sensitive operations like account deletion
      // For simplicity, we'll skip reauthentication here, but in a real app,
      // you'd typically ask for the user's password again.
      // const credential = EmailAuthProvider.credential(currentUser.email, prompt("Please enter your password to confirm:"));
      // await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore first
      await deleteDoc(doc(db, 'users', currentUser.uid));
      console.log("User data deleted from Firestore.");

      // Then delete the user from Firebase Authentication
      await currentUser.delete();
      console.log("User account deleted from Firebase Auth.");

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        duration: 5000,
      });
      signOut(auth); // Log out the user after deletion
      // Redirect to login or home page
      // navigate('/'); // Assuming you have navigate from react-router-dom
    } catch (err) {
      console.error("Error deleting account:", err);
      let errorMessage = "Failed to delete account.";
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = "Please log in again to delete your account. (Security requirement)";
        // You might want to force a re-login here
      } else {
        errorMessage += ` ${err.message}`;
      }
      toast({
        title: "Account Deletion Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };


  return (
    <>
      <Helmet>
        <title>Profile & Settings - HealthPlat</title>
        <meta name="description" content="Manage your profile, security, and preferences on HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security settings</p>

        {/* Tabs for navigation */}
        <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <User className="h-5 w-5 mr-2" /> Profile
          </Button>
          <Button
            variant={activeTab === 'security' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Shield className="h-5 w-5 mr-2" /> Security
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Bell className="h-5 w-5 mr-2" /> Notifications
          </Button>
          <Button
            variant={activeTab === 'preferences' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'preferences' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Settings className="h-5 w-5 mr-2" /> Preferences
          </Button>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400 ml-3">Loading profile data...</p>
                </div>
              ) : profileError ? (
                <div className="text-center text-red-600 dark:text-red-400 py-10">
                  <p>{profileError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        value={userData.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Last Name */}
                    <div>
                      <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userData.lastName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Email Address */}
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        disabled // Email is typically not editable directly here
                        className="mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Address */}
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
                      <Input
                        id="address"
                        value={userData.address}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Age */}
                    <div>
                      <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={userData.age}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Gender */}
                    <div>
                      <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                      <select
                        id="gender"
                        value={userData.gender}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* City */}
                    <div>
                      <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City</Label>
                      <Input
                        id="city"
                        value={userData.city}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    {/* Country */}
                    <div>
                      <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country</Label>
                      <Input
                        id="country"
                        value={userData.country}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile || isSavingProfile}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    {!isEditingProfile ? (
                      <Button onClick={() => setIsEditingProfile(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => { setIsEditingProfile(false); /* Optionally reset changes */ }} disabled={isSavingProfile} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-green-600 hover:bg-green-700 text-white">
                          {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password & Authentication */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 flex items-center"><Lock className="w-5 h-5 mr-2" /> Password & Authentication</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={securityLoading}
                        className="pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={securityLoading}
                        className="pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmNewPassword"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        disabled={securityLoading}
                        className="pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                      >
                        {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {securityError && <p className="text-red-500 text-sm">{securityError}</p>}
                  {securitySuccess && <p className="text-green-500 text-sm">{securitySuccess}</p>}
                  <Button type="submit" disabled={securityLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {securityLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Change Password
                  </Button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 flex items-center"><Shield className="w-5 h-5 mr-2" /> Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">SMS Authentication</p>
                    <p className="text-sm text-gray-500">Receive codes via text message</p>
                  </div>
                  <Switch
                    checked={smsAuthEnabled}
                    onCheckedChange={(checked) => { setSmsAuthEnabled(checked); handleSecurityToggle('smsAuthEnabled', checked); }}
                  />
                </div>
                {/* Biometric Login (Placeholder) */}
                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Enable Biometric Login</p>
                    <p className="text-sm text-gray-500">Use fingerprint or face ID (coming soon)</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 flex items-center"><Lock className="w-5 h-5 mr-2" /> Privacy Controls</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Data Sharing</p>
                    <p className="text-sm text-gray-500">Share anonymized data for improvements</p>
                  </div>
                  <Switch
                    checked={dataSharingEnabled}
                    onCheckedChange={(checked) => { setDataSharingEnabled(checked); handleSecurityToggle('dataSharingEnabled', checked); }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Analytics</p>
                    <p className="text-sm text-gray-500">Help improve our services</p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={(checked) => { setAnalyticsEnabled(checked); handleSecurityToggle('analyticsEnabled', checked); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Health Alerts</p>
                  <p className="text-sm text-gray-500">Get important health updates and advisories</p>
                </div>
                <Switch
                  checked={healthAlerts}
                  onCheckedChange={(checked) => { setHealthAlerts(checked); handleNotificationToggle('healthAlerts', checked); }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Appointment Reminders</p>
                  <p className="text-sm text-gray-500">Reminders for your upcoming doctor appointments</p>
                </div>
                <Switch
                  checked={appointmentReminders}
                  onCheckedChange={(checked) => { setAppointmentReminders(checked); handleNotificationToggle('appointmentReminders', checked); }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Blog Updates</p>
                  <p className="text-sm text-gray-500">New articles and health insights from our blog</p>
                </div>
                <Switch
                  checked={blogUpdates}
                  onCheckedChange={(checked) => { setBlogUpdates(checked); handleNotificationToggle('blogUpdates', checked); }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">AI Insights Notifications</p>
                  <p className="text-sm text-gray-500">Personalized health recommendations from AI tools</p>
                </div>
                <Switch
                  checked={aiInsightsNotifications}
                  onCheckedChange={(checked) => { setAiInsightsNotifications(checked); handleNotificationToggle('aiInsightsNotifications', checked); }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Marketing & Offers</p>
                  <p className="text-sm text-gray-500">Product updates and special offers</p>
                </div>
                <Switch
                  checked={marketingNotifications}
                  onCheckedChange={(checked) => { setMarketingNotifications(checked); handleNotificationToggle('marketingNotifications', checked); }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">Language</Label>
                  <select
                    id="language"
                    value={appLanguage}
                    onChange={(e) => { setAppLanguage(e.target.value); handleAppPreferenceChange('language', e.target.value); }}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    {/* Add more languages if needed */}
                  </select>
                </div>
                {/* Theme */}
                <div>
                  <Label htmlFor="theme" className="text-gray-700 dark:text-gray-300">Theme</Label>
                  <select
                    id="theme"
                    value={appTheme}
                    onChange={(e) => { setAppTheme(e.target.value); handleAppPreferenceChange('theme', e.target.value); }}
                    className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="System Default">System Default</option>
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Data Management</h3>
                <Button onClick={handleExportData} className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="h-5 w-5 mr-2" /> Export My Data
                </Button>
                <Button onClick={handleDeleteAccount} className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="h-5 w-5 mr-2" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </>
  );
};

export default Profile;
