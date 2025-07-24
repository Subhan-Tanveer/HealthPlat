// src/pages/HealthForum.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { Mail, Send, User, MessageSquare, Loader2, Stethoscope, Phone } from 'lucide-react'; // Icons

// Firebase imports for user data (to pre-fill 'From' email)
import { auth, db } from '../pages/firebase-config'; // Corrected path for firebase-config
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import EmailJS
import emailjs from '@emailjs/browser';

// Import activity logger
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

const HealthForum = () => {
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Email form states
  const [toDoctorEmail, setToDoctorEmail] = useState(''); // This would ideally come from a doctor selection
  const [fromUserEmail, setFromUserEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [patientName, setPatientName] = useState(''); // Optional for doctor's reference
  const [patientContact, setPatientContact] = useState(''); // Optional for doctor's reference

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);

  // Initialize EmailJS with your Public Key
  useEffect(() => {
    emailjs.init("k2JYEO2qaTfhG6Rwr"); // YOUR PUBLIC KEY
  }, []);

  // Fetch current user's email and name to pre-fill 'From' field and patient name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setFromUserEmail(user.email || ''); // Set user's email
        
        // Optionally fetch user's first/last name and phone from Firestore if available
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPatientName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim());
            setPatientContact(userData.phone || '');
          }
        } catch (error) {
          console.error("Error fetching user data for pre-fill:", error);
        }

      } else {
        setCurrentUser(null);
        setFromUserEmail('');
        setPatientName('');
        setPatientContact('');
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    // Basic client-side validation
    if (!toDoctorEmail || !fromUserEmail || !subject || !message) {
      setSendError("Please fill in all required fields (To, From, Subject, Message).");
      setIsSending(false);
      return;
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_doctor_email: toDoctorEmail,
      from_user_email: fromUserEmail,
      patient_name: patientName,
      patient_contact: patientContact,
      subject: subject,
      message: message,
    };

    try {
      // Send email using EmailJS
      // Using your provided Service ID and Template ID
      await emailjs.send("HealthPlat", "template_nggpnal", templateParams);

      setSendSuccess("Your email has been sent successfully! The doctor will get back to you soon.");
      toast({
        title: "Email Sent",
        description: "Your message has been delivered to the doctor.",
        
        duration: 4000,
      });
      // Log activity after successful email send
      // Changed activity type to 'forum_post' for consistency with Dashboard.jsx
      logActivity('forum_post', `Sent email to ${toDoctorEmail} with subject: "${subject}"`, { doctorEmail: templateParams.to_doctor_email, subject: subject });

      // Clear form fields after successful send
      // setToDoctorEmail(''); // You might want to keep this if user emails same doctor
      setSubject('');
      setMessage('');
      // setPatientName(''); // Keep if user is always the same
      // setPatientContact(''); // Keep if user is always the same
    } catch (err) {
      console.error("Email send error:", err);
      setSendError(`Failed to send email: ${err.text || err.message}. Please check your EmailJS setup.`);
      toast({
        title: "Email Failed",
        description: `There was an issue sending your message: ${err.text || err.message}.`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const showNotImplementedToast = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! �",
    });
  };

  return (
    <>
      <Helmet>
        <title>Health Forum - HealthPlat</title>
        <meta name="description" content="Ask health questions and get answers from doctors on the HealthPlat forum." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">Health Forum & Direct Messaging</h1>

        {/* Ask a Public Question Section (Existing) */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" /> Ask a Public Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">This is where you can publicly ask health questions and get threaded replies from doctors and the community. (Feature to be implemented)</p>
            <Button onClick={showNotImplementedToast} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Post a Question
            </Button>
          </CardContent>
        </Card>

        {/* Direct Email to Doctor Section (New) */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Mail className="w-6 h-6 mr-2 text-green-600" /> Direct Email to a Doctor
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Send a private message to a specific doctor for a consultation or inquiry.
              <br/>
              <span className="text-red-500 font-semibold">NOTE:</span> This feature requires EmailJS setup. Please see instructions below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUser ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-green-500 mr-3" />
                <p className="text-green-600 dark:text-green-400">Loading user data...</p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                {/* To: Doctor's Email */}
                <div>
                  <Label htmlFor="toDoctorEmail" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" /> To Doctor's Email
                  </Label>
                  <Input
                    id="toDoctorEmail"
                    type="email"
                    placeholder="e.g., doctor.name@example.com (This would ideally be pre-filled from a doctor's profile)"
                    value={toDoctorEmail}
                    onChange={(e) => setToDoctorEmail(e.target.value)}
                    required
                    disabled={isSending}
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* From: Your Email */}
                <div>
                  <Label htmlFor="fromUserEmail" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2" /> From Your Email
                  </Label>
                  <Input
                    id="fromUserEmail"
                    type="email"
                    value={fromUserEmail}
                    disabled // This field is pre-filled and not editable by the user
                    className="mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Patient Name (Optional but good for context) */}
                <div>
                  <Label htmlFor="patientName" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Your Name (for Doctor's reference)
                  </Label>
                  <Input
                    id="patientName"
                    type="text"
                    placeholder="Your Full Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    disabled={isSending}
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Patient Contact (Optional) */}
                <div>
                  <Label htmlFor="patientContact" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <Phone className="w-4 h-4 mr-2" /> Your Contact Number (Optional)
                  </Label>
                  <Input
                    id="patientContact"
                    type="tel"
                    placeholder="e.g., +923001234567"
                    value={patientContact}
                    onChange={(e) => setPatientContact(e.target.value)}
                    disabled={isSending}
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Subject
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief subject of your inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={isSending}
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Type your detailed message or question here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSending}
                    rows={6}
                    className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white resize-y"
                  />
                </div>

                {sendError && <p className="text-red-500 text-sm text-center">{sendError}</p>}
                {sendSuccess && <p className="text-green-500 text-sm text-center">{sendSuccess}</p>}

                <Button
                  type="submit"
                  disabled={isSending || !currentUser}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {isSending ? 'Sending Email...' : 'Send Email to Doctor'}
                </Button>
                {!currentUser && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Please log in to send an email to a doctor.
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default HealthForum;