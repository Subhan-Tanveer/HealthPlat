import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Stethoscope, Video, Beaker, Truck, Heart, TrendingUp, Moon, CalendarDays,
  Bell, Award, MapPin, MessageSquare, Plus, X, Loader2, User, Clock, CheckCircle,
  AlertCircle, ChevronRight, ChevronLeft, Send, BookOpen, // Added BookOpen for Blog icon
  Brain, // For AI tools
  Pill, // For Drug Interaction
  Activity, // For Wellness Coach
  FileText, // For Medical Term Simplifier
  Image, // For Image Analyzer
  TestTube, // For Lab Tests specifically
  Settings, // Added Settings icon for Profile Updates
  Droplet, // Icon for Blood Glucose
  Gauge, // Icon for Blood Pressure
  Flame,// Icon for Smoking
  GlassWater, // Icon for Alcohol
  Cloud, // Icon for Air Pollution
  HeartCrack, // Icon for Heart Disease
  Biohazard, // Icon for Cancer (using a generic icon if specific one not available)
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, BarChart, Bar } from 'recharts';
import { useToast } from "@/components/ui/use-toast"; // Import useToast

// Import Firestore functions
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'; // Added getDoc
import { db, auth } from '../pages/firebase-config'; // Import your Firebase db and auth instances
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth'; // Import for initial auth

// Import activity logger
import { logActivity } from '../utils/activityLogger'; // Import logActivity

// Define global variables for app_id and auth_token
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// API Key for Gemini (no longer used for Wellness Score calculation)
const GEMINI_API_KEY = ""; // Your provided API Key, set to empty as per instruction

// --- Mock Data for Dashboard Sections (MOVED OUTSIDE THE COMPONENT) ---
const mockAppointments = [
  { id: 1, date: '2024-07-22', time: '10:00 AM', title: 'Dental Check-up', type: 'appointment', color: '#3498db' },
  { id: 2, date: '2024-07-25', time: '02:30 PM', title: 'Take Medication (Daily)', type: 'medication', color: '#e74c3c' },
  { id: 3, date: '2024-07-28', time: '11:00 AM', title: 'Cardiologist Consult', type: 'appointment', color: '#3498db' },
  { id: 4, date: '2024-07-25', time: '08:00 PM', title: 'Take Medication (Night)', type: 'medication', color: '#e74c3c' },
];

const mockNotifications = [
  { id: 1, title: 'New Consultation Available', description: 'Dr. Fatima has new slots open for online consultation.', unread: true, icon: <Video className="w-4 h-4 text-green-500" /> },
  { id: 2, title: 'Medication Reminder', description: 'It\'s time to take your daily vitamins.', unread: true, icon: <Bell className="w-4 h-4 text-yellow-500" /> },
  { id: 3, title: 'Blog Update', description: 'Read our new article on "Understanding Diabetes".', unread: false, icon: <Stethoscope className="w-4 h-4 text-blue-500" /> },
  { id: 4, title: 'Lab Test Results Ready', description: 'Your recent blood test results are available.', unread: true, icon: <Beaker className="w-4 h-4 text-purple-500" /> },
];

const mockBadges = [
  { id: 1, name: 'First Booking', description: 'You made your first appointment!', icon: '⭐', achieved: true },
  { id: 2, name: 'Wellness Streak', description: 'Completed 7 consecutive daily health checks.', icon: '🔥', achieved: false },
  { id: 3, name: 'Community Contributor', description: 'Posted 5 questions in the Health Forum.', icon: '💬', achieved: false },
];

// Months array for BMI input dropdown
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// NEW: Special Healthcare Days
const SPECIAL_HEALTHCARE_DAYS = [
  { month: 0, day: 4, title: 'World Braille Day', type: 'awareness', color: '#4CAF50' }, // January is month 0
  { month: 0, dayType: 'lastSunday', title: 'World Leprosy Day', type: 'awareness', color: '#4CAF50' },
  { month: 1, day: 4, title: 'World Cancer Day', type: 'awareness', color: '#4CAF50' }, // February is month 1
  { month: 1, day: 11, title: 'Int. Day of Women and Girls in Science', type: 'awareness', color: '#4CAF50' },
  { month: 1, day: 15, title: 'International Childhood Cancer Day', type: 'awareness', color: '#4CAF50' },
  { month: 1, dayType: 'lastDay', title: 'Rare Disease Day', type: 'awareness', color: '#4CAF50' },
  { month: 2, day: 8, title: 'International Women’s Day', type: 'awareness', color: '#4CAF50' }, // March is month 2
  { month: 2, day: 20, title: 'World Oral Health Day', type: 'awareness', color: '#4CAF50' },
  { month: 2, day: 21, title: 'World Down Syndrome Day', type: 'awareness', color: '#4CAF50' },
  { month: 2, day: 24, title: 'World Tuberculosis (TB) Day', type: 'awareness', color: '#4CAF50' },
  { month: 3, day: 2, title: 'World Autism Awareness Day', type: 'awareness', color: '#4CAF50' }, // April is month 3
  { month: 3, day: 7, title: 'World Health Day', type: 'awareness', color: '#4CAF50' },
  { month: 3, day: 17, title: 'World Hemophilia Day', type: 'awareness', color: '#4CAF50' },
  { month: 3, day: 25, title: 'World Malaria Day', type: 'awareness', color: '#4CAF50' },
  { month: 4, day: 5, title: 'International Day of the Midwife', type: 'awareness', color: '#4CAF50' }, // May is month 4
  { month: 4, day: 12, title: 'International Nurses Day', type: 'awareness', color: '#4CAF50' },
  { month: 4, day: 15, title: 'International Kangaroo Care Awareness Day', type: 'awareness', color: '#4CAF50' },
  { month: 4, day: 19, title: 'World Family Doctor Day', type: 'awareness', color: '#4CAF50' },
  { month: 4, day: 31, title: 'World No Tobacco Day', type: 'awareness', color: '#4CAF50' },
  { month: 5, day: 14, title: 'World Blood Donor Day', type: 'awareness', color: '#4CAF50' }, // June is month 5
  { month: 5, day: 21, title: 'International Day of Yoga', type: 'awareness', color: '#4CAF50' },
  { month: 5, day: 26, title: 'Int. Day Against Drug Abuse and Illicit Trafficking', type: 'awareness', color: '#4CAF50' },
  { month: 6, day: 11, title: 'World Population Day', type: 'awareness', color: '#4CAF50' }, // July is month 6
  { month: 6, day: 28, title: 'World Hepatitis Day', type: 'awareness', color: '#4CAF50' },
  { month: 7, day: 1, title: 'World Breastfeeding Week (Start)', type: 'awareness', color: '#4CAF50' }, // August is month 7
  { month: 7, day: 7, title: 'World Breastfeeding Week (End)', type: 'awareness', color: '#4CAF50' },
  { month: 7, day: 19, title: 'World Humanitarian Day', type: 'awareness', color: '#4CAF50' },
  { month: 8, day: 10, title: 'World Suicide Prevention Day', type: 'awareness', color: '#4CAF50' }, // September is month 8
  { month: 8, day: 21, title: 'World Alzheimer’s Day', type: 'awareness', color: '#4CAF50' },
  { month: 8, day: 28, title: 'World Rabies Day', type: 'awareness', color: '#4CAF50' },
  { month: 8, dayType: 'lastWeek', title: 'International Week of the Deaf', type: 'awareness', color: '#4CAF50' }, // Placeholder for last week of September
  { month: 9, day: 1, title: 'International Day of Older Persons', type: 'awareness', color: '#4CAF50' }, // October is month 9
  { month: 9, day: 10, title: 'World Mental Health Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 12, title: 'World Arthritis Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 15, title: 'Global Handwashing Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 16, title: 'World Spine Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 17, title: 'Int. Day for the Eradication of Poverty', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 20, title: 'World Osteoporosis Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, day: 29, title: 'World Stroke Day', type: 'awareness', color: '#4CAF50' },
  { month: 9, dayType: 'monthLong', title: 'Pinktober (Breast Cancer Awareness Month)', type: 'awareness', color: '#FF69B4' }, // October
  { month: 10, day: 12, title: 'World Pneumonia Day', type: 'awareness', color: '#4CAF50' }, // November is month 10
  { month: 10, day: 14, title: 'World Diabetes Day', type: 'awareness', color: '#4CAF50' },
  { month: 10, day: 17, title: 'World Prematurity Day', type: 'awareness', color: '#4CAF50' },
  { month: 10, day: 19, title: 'World Toilet Day', type: 'awareness', color: '#4CAF50' },
  { month: 10, day: 20, title: 'Universal Children’s Day', type: 'awareness', color: '#4CAF50' },
  { month: 10, day: 25, title: 'Int. Day for the Elimination of Violence Against Women', type: 'awareness', color: '#4CAF50' },
  { month: 11, day: 1, title: 'World AIDS Day', type: 'awareness', color: '#4CAF50' }, // December is month 11
  { month: 11, day: 3, title: 'International Day of Persons with Disabilities', type: 'awareness', color: '#4CAF50' },
  { month: 11, day: 12, title: 'Universal Health Coverage Day', type: 'awareness', color: '#4CAF50' },
];

// NEW: Death Statistics for Counters
const DEATH_STATS = [
  {
    id: 'smoking',
    title: 'Smoking-Related Deaths',
    annualDeaths: 8000000,
    icon: Flame,
    color: 'text-red-500',
  },
  {
    id: 'alcohol',
    title: 'Alcohol-Related Deaths',
    annualDeaths: 3000000,
    icon: GlassWater,
    color: 'text-yellow-500',
  },
  {
    id: 'air_pollution',
    title: 'Air Pollution Deaths',
    annualDeaths: 7000000,
    icon: Cloud,
    color: 'text-gray-500',
  },
  {
    id: 'heart_disease',
    title: 'Heart Disease Deaths',
    annualDeaths: 18000000,
    icon: HeartCrack,
    color: 'text-rose-500',
  },
  {
    id: 'cancer',
    title: 'Cancer Deaths',
    annualDeaths: 10000000,
    icon: Biohazard,
    color: 'text-purple-500',
  },
];


// StatCard Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="h-full">
    <Card className="overflow-hidden h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">continuously updating</p>
      </CardContent>
    </Card>
  </motion.div>
);

// AI Assistant Chatbot Component
const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newUserMessage = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages((prev) => [...prev, newUserMessage]);
      setInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: `Hello! I'm your HealthPlat AI assistant. How can I help you with "${input}" today? I can assist with booking appointments, finding doctors, or answering general health questions.`,
          sender: 'ai',
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-300 z-50"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-20 right-6 w-80 h-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-xl">
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Type a message to start the conversation!</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Notification Panel Component
const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={toggleDropdown} className="relative text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden"
          >
            <CardHeader className="py-3 px-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No new notifications.</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      className={`flex items-start p-4 transition-colors duration-200 ${notification.unread ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${notification.unread ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{notification.description}</p>
                      </div>
                      {notification.unread && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="ml-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700">
                          Mark Read
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// NEW: SpecialDayDetailModal Component
const SpecialDayDetailModal = ({ specialDay, onClose }) => {
  if (!specialDay) return null;

  const date = new Date(specialDay.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-purple-600" /> {specialDay.title}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{formattedDate}</p>
        <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md">
          Close
        </Button>
      </motion.div>
    </motion.div>
  );
};


const Dashboard = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [recentActivities, setRecentActivities] = useState([]); // State for recent activities
  const [isAuthReady, setIsAuthReady] = useState(false); // State to track auth readiness
  const [showAllActivitiesDialog, setShowAllActivitiesDialog] = useState(false); // State for dialog visibility

  // BMI Calculation States
  const [showBmiInputModal, setShowBmiInputModal] = useState(false);
  const [inputHeight, setInputHeight] = useState(''); // in cm
  const [inputWeight, setInputWeight] = useState(''); // in kg
  const [inputMonth, setInputMonth] = useState('');
  const [bmiHistoryData, setBmiHistoryData] = useState([]); // Stores { month: 'Jan', bmi: 24.5 }
  const [bmiInputError, setBmiInputError] = useState(null);
  const [isSavingBmi, setIsSavingBmi] = useState(false);

  // Blood Pressure States
  const [showBloodPressureInputModal, setShowBloodPressureInputModal] = useState(false);
  const [inputSystolic, setInputSystolic, ] = useState('');
  const [inputDiastolic, setInputDiastolic] = useState('');
  const [inputBpMonth, setInputBpMonth] = useState('');
  const [bpHistoryData, setBpHistoryData] = useState([]); // Stores { month: 'Jan', systolic: 120, diastolic: 80 }
  const [bpInputError, setBpInputError] = useState(null);
  const [isSavingBp, setIsSavingBp] = useState(false);

  // Blood Glucose States
  const [showBloodGlucoseInputModal, setShowBloodGlucoseInputModal] = useState(false);
  const [inputGlucose, setInputGlucose] = useState('');
  const [inputGlucoseMonth, setInputGlucoseMonth] = useState('');
  const [glucoseHistoryData, setGlucoseHistoryData] = useState([]); // Stores { month: 'Jan', glucose: 100 }
  const [glucoseInputError, setGlucoseInputError] = useState(null);
  const [isSavingGlucose, setIsSavingGlucose] = useState(false);

  // Wellness Score State
  const [wellnessScore, setWellnessScore] = useState(0);
  const [isWellnessLoading, setIsWellnessLoading] = useState(false);

  // NEW: State for special day dialog
  const [showSpecialDayDialog, setShowSpecialDayDialog] = useState(false);
  const [selectedSpecialDay, setSelectedSpecialDay] = useState(null);

  // NEW: State for death counters and their start time
  const [deathCounters, setDeathCounters] = useState(
    DEATH_STATS.reduce((acc, stat) => ({ ...acc, [stat.id]: 0 }), {})
  );
  const [deathCounterStartTime, setDeathCounterStartTime] = useState(null); // Stores the timestamp from Firestore


  // Effect for Firebase Authentication and Activity Listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Sign in anonymously if no user is logged in
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (error) {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous if custom token fails
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      }
      setIsAuthReady(true); // Mark authentication as ready
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // NEW: Effect to fetch or set the death counter start time from Firestore
  useEffect(() => {
    const fetchOrCreateStartTime = async () => {
      if (!isAuthReady) return;

      const userId = auth.currentUser?.uid || 'anonymous';
      const startTimeDocRef = doc(db, `artifacts/${appId}/users/${userId}/dashboardPreferences/deathCounterStartTime`);

      try {
        const docSnap = await getDoc(startTimeDocRef);
        if (docSnap.exists()) {
          setDeathCounterStartTime(docSnap.data().value);
        } else {
          const currentTime = Date.now();
          await setDoc(startTimeDocRef, { value: currentTime });
          setDeathCounterStartTime(currentTime);
          logActivity('death_counter_initialized', 'Death counter started for the first time or after reset.');
        }
      } catch (error) {
        console.error("Error fetching or setting death counter start time:", error);
        toast({
          title: "Error",
          description: "Failed to load death counter data.",
          variant: "destructive",
        });
      }
    };

    fetchOrCreateStartTime();
  }, [isAuthReady]); // Depend on auth readiness


  // Effect to update death counters every second, now dependent on deathCounterStartTime
  useEffect(() => {
    let intervals = {};

    if (deathCounterStartTime !== null) {
      DEATH_STATS.forEach(stat => {
        const deathsPerSecond = stat.annualDeaths / (365 * 24 * 60 * 60);
        intervals[stat.id] = setInterval(() => {
          setDeathCounters(prevCounters => {
            const elapsedTimeSeconds = (Date.now() - deathCounterStartTime) / 1000;
            const newCount = Math.floor(deathsPerSecond * elapsedTimeSeconds);
            return {
              ...prevCounters,
              [stat.id]: newCount,
            };
          });
        }, 1000); // Update every second
      });
    }

    return () => {
      // Clear all intervals on component unmount or when deathCounterStartTime changes
      Object.values(intervals).forEach(clearInterval);
    };
  }, [deathCounterStartTime]); // Run when deathCounterStartTime is available


  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null); // Placeholder for days before the 1st
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dayString = day.toISOString().split('T')[0];
    const events = [];

    // Add mock appointments
    mockAppointments.forEach(app => {
      if (app.date === dayString) {
        events.push(app);
      }
    });

    // Add special healthcare days
    const currentYear = day.getFullYear();
    const currentMonthIndex = day.getMonth(); // 0-indexed month
    const currentDate = day.getDate();

    SPECIAL_HEALTHCARE_DAYS.forEach(specialDay => {
      if (specialDay.month === currentMonthIndex) {
        if (specialDay.day) {
          if (specialDay.day === currentDate) {
            events.push({
              id: `special-${specialDay.month}-${specialDay.day}-${currentYear}`,
              date: dayString,
              time: 'All Day',
              title: specialDay.title,
              type: specialDay.type,
              color: specialDay.color,
            });
          }
        } else if (specialDay.dayType === 'lastSunday') {
          const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
          const lastSunday = new Date(lastDayOfMonth);
          lastSunday.setDate(lastDayOfMonth.getDate() - (lastDayOfMonth.getDay() || 7)); // Adjust to last Sunday (Sunday is 0, so 0-7 = -7, effectively 0)

          if (day.toDateString() === lastSunday.toDateString()) {
            events.push({
              id: `special-${specialDay.month}-lastSunday-${currentYear}`,
              date: dayString,
              time: 'All Day',
              title: specialDay.title,
              type: specialDay.type,
              color: specialDay.color,
            });
          }
        } else if (specialDay.dayType === 'lastDay') {
          const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
          if (day.toDateString() === lastDayOfMonth.toDateString()) {
            events.push({
              id: `special-${specialDay.month}-lastDay-${currentYear}`,
              date: dayString,
              time: 'All Day',
              title: specialDay.title,
              type: specialDay.type,
              color: specialDay.color,
            });
          }
        } else if (specialDay.dayType === 'lastWeek' && specialDay.month === currentMonthIndex) {
          // For "Last week of September", we'll just mark the last 7 days of September
          if (currentMonthIndex === 8) { // September is month 8
            const lastDayOfSeptember = new Date(currentYear, 9, 0); // Last day of September
            const startOfLastWeek = new Date(lastDayOfSeptember);
            startOfLastWeek.setDate(lastDayOfSeptember.getDate() - 6); // 7 days including the last day

            if (day >= startOfLastWeek && day <= lastDayOfSeptember) {
              events.push({
                id: `special-${specialDay.month}-lastWeek-${currentYear}`,
                date: dayString,
                time: 'All Week',
                title: specialDay.title,
                type: specialDay.type,
                color: specialDay.color,
              });
            }
          }
        } else if (specialDay.dayType === 'monthLong' && specialDay.month === currentMonthIndex) {
          // For month-long events like Pinktober
          events.push({
            id: `special-${specialDay.month}-monthLong-${currentYear}`,
            date: dayString,
            time: 'All Month',
            title: specialDay.title,
            type: specialDay.type,
            color: specialDay.color,
          });
        }
      }
    });

    return events;
  };

  // NEW: Handle click on a calendar day
  const handleDayClick = (day) => {
    if (!day) return;

    const events = getEventsForDay(day);
    const specialEvents = events.filter(event => event.type === 'awareness');

    if (specialEvents.length > 0) {
      // For simplicity, display the first special event found on that day
      setSelectedSpecialDay({
        title: specialEvents[0].title,
        date: specialEvents[0].date,
      });
      setShowSpecialDayDialog(true);
    }
  };


  // Effect to fetch real-time recent activities
  useEffect(() => {
    let unsubscribeActivities;

    if (isAuthReady) {
      const userId = auth.currentUser?.uid || 'anonymous';
      const activitiesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/activities`);
      // Order by timestamp in descending order to get most recent first
      const q = query(activitiesCollectionRef, orderBy('timestamp', 'desc'));

      unsubscribeActivities = onSnapshot(q, (snapshot) => {
        const fetchedActivities = snapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore Timestamp to JavaScript Date object for display
          const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
          return {
            id: doc.id,
            description: data.description,
            date: date,
            type: data.type, // Use type to determine icon
            details: data.details || {}
          };
        });
        setRecentActivities(fetchedActivities);
      }, (error) => {
        console.error("Error fetching real-time activities:", error);
        // Handle error, e.g., display a message to the user
      });
    }

    return () => {
      if (unsubscribeActivities) {
        unsubscribeActivities(); // Unsubscribe from real-time updates on unmount
      }
    };
  }, [isAuthReady]); // Re-run when auth state is ready

  // Effect to fetch BMI history from Firestore
  useEffect(() => {
    let unsubscribeBmi;

    if (isAuthReady) {
      const userId = auth.currentUser?.uid || 'anonymous';
      const bmiDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/bmiHistoryDoc`);

      unsubscribeBmi = onSnapshot(bmiDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure bmiEntries is an array and sort it by month
          const sortedBmiEntries = (data.bmiEntries || []).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));
          setBmiHistoryData(sortedBmiEntries);
        } else {
          setBmiHistoryData([]); // No BMI history yet
        }
      }, (error) => {
        console.error("Error fetching BMI history:", error);
        toast({
          title: "Error",
          description: "Failed to load BMI history.",
          variant: "destructive",
        });
      });
    }

    return () => {
      if (unsubscribeBmi) {
        unsubscribeBmi(); // Unsubscribe from real-time updates
      }
    };
  }, [isAuthReady]); // Re-run when auth state is ready

  // NEW: Effect to fetch Blood Pressure history from Firestore
  useEffect(() => {
    let unsubscribeBp;

    if (isAuthReady) {
      const userId = auth.currentUser?.uid || 'anonymous';
      const bpDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/bpHistoryDoc`);

      unsubscribeBp = onSnapshot(bpDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const sortedBpEntries = (data.bpEntries || []).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));
          setBpHistoryData(sortedBpEntries);
        } else {
          setBpHistoryData([]);
        }
      }, (error) => {
        console.error("Error fetching Blood Pressure history:", error);
        toast({
          title: "Error",
          description: "Failed to load Blood Pressure history.",
          variant: "destructive",
        });
      });
    }

    return () => {
      if (unsubscribeBp) {
        unsubscribeBp();
      }
    };
  }, [isAuthReady]);

  // NEW: Effect to fetch Blood Glucose history from Firestore
  useEffect(() => {
    let unsubscribeGlucose;

    if (isAuthReady) {
      const userId = auth.currentUser?.uid || 'anonymous';
      const glucoseDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/glucoseHistoryDoc`);

      unsubscribeGlucose = onSnapshot(glucoseDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const sortedGlucoseEntries = (data.glucoseEntries || []).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));
          setGlucoseHistoryData(sortedGlucoseEntries);
        } else {
          setGlucoseHistoryData([]);
        }
      }, (error) => {
        console.error("Error fetching Blood Glucose history:", error);
        toast({
          title: "Error",
          description: "Failed to load Blood Glucose history.",
          variant: "destructive",
        });
      });
    }

    return () => {
      if (unsubscribeGlucose) {
        unsubscribeGlucose();
      }
    };
  }, [isAuthReady]);


  // BMI Calculation function
  const calculateBmiValue = (weight, heightCm) => {
    const heightM = heightCm / 100; // Convert cm to meters
    if (heightM <= 0 || weight <= 0) {
      return null; // Invalid input
    }
    return (weight / (heightM * heightM)).toFixed(2); // Rounded to 2 decimal places
  };

  // Handle Save BMI
  const handleSaveBmi = async () => {
    setBmiInputError(null);
    setIsSavingBmi(true);

    const height = parseFloat(inputHeight);
    const weight = parseFloat(inputWeight);

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0 || !inputMonth) {
      setBmiInputError("Please enter valid positive numbers for height and weight, and select a month.");
      setIsSavingBmi(false);
      return;
    }

    const bmi = calculateBmiValue(weight, height);

    if (bmi === null) {
      setBmiInputError("Invalid input for BMI calculation.");
      setIsSavingBmi(false);
      return;
    }

    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const bmiDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/bmiHistoryDoc`);

      // Get current data to update the specific month or add new
      const currentBmiEntries = [...bmiHistoryData];
      const existingEntryIndex = currentBmiEntries.findIndex(entry => entry.month === inputMonth);

      if (existingEntryIndex > -1) {
        currentBmiEntries[existingEntryIndex] = { month: inputMonth, bmi: parseFloat(bmi) };
      } else {
        currentBmiEntries.push({ month: inputMonth, bmi: parseFloat(bmi) });
      }

      // Sort the entries by month order
      const sortedEntries = currentBmiEntries.sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

      await setDoc(bmiDocRef, { bmiEntries: sortedEntries }, { merge: true }); // Use merge to avoid overwriting other fields
      setBmiHistoryData(sortedEntries); // Update local state immediately

      toast({
        title: "BMI Saved",
        description: `BMI for ${inputMonth} (${bmi}) has been saved.`,
        duration: 3000,
      });

      // Close modal and reset inputs
      setShowBmiInputModal(false);
      setInputHeight('');
      setInputWeight('');
      setInputMonth('');

    } catch (error) {
      console.error("Error saving BMI data:", error);
      setBmiInputError("Failed to save BMI data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save BMI data.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBmi(false);
    }
  };

  // NEW: Handle Save Blood Pressure
  const handleSaveBloodPressure = async () => {
    setBpInputError(null);
    setIsSavingBp(true);

    const systolic = parseFloat(inputSystolic);
    const diastolic = parseFloat(inputDiastolic);

    if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0 || !inputBpMonth) {
      setBpInputError("Please enter valid positive numbers for systolic and diastolic, and select a month.");
      setIsSavingBp(false);
      return;
    }

    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const bpDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/bpHistoryDoc`);

      const currentBpEntries = [...bpHistoryData];
      const existingEntryIndex = currentBpEntries.findIndex(entry => entry.month === inputBpMonth);

      if (existingEntryIndex > -1) {
        currentBpEntries[existingEntryIndex] = { month: inputBpMonth, systolic: systolic, diastolic: diastolic };
      } else {
        currentBpEntries.push({ month: inputBpMonth, systolic: systolic, diastolic: diastolic });
      }

      const sortedEntries = currentBpEntries.sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

      await setDoc(bpDocRef, { bpEntries: sortedEntries }, { merge: true });
      setBpHistoryData(sortedEntries);

      toast({
        title: "Blood Pressure Saved",
        description: `BP for ${inputBpMonth} (${systolic}/${diastolic}) has been saved.`,
        duration: 3000,
      });

      setShowBloodPressureInputModal(false);
      setInputSystolic('');
      setInputDiastolic('');
      setInputBpMonth('');

    } catch (error) {
      console.error("Error saving Blood Pressure data:", error);
      setBpInputError("Failed to save Blood Pressure data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save Blood Pressure data.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBp(false);
    }
  };

  // NEW: Handle Save Blood Glucose
  const handleSaveBloodGlucose = async () => {
    setGlucoseInputError(null);
    setIsSavingGlucose(true);

    const glucose = parseFloat(inputGlucose);

    if (isNaN(glucose) || glucose <= 0 || !inputGlucoseMonth) {
      setGlucoseInputError("Please enter a valid positive number for glucose, and select a month.");
      setIsSavingGlucose(false);
      return;
    }

    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const glucoseDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthData/glucoseHistoryDoc`);

      const currentGlucoseEntries = [...glucoseHistoryData];
      const existingEntryIndex = currentGlucoseEntries.findIndex(entry => entry.month === inputGlucoseMonth);

      if (existingEntryIndex > -1) {
        currentGlucoseEntries[existingEntryIndex] = { month: inputGlucoseMonth, glucose: glucose };
      } else {
        currentGlucoseEntries.push({ month: inputGlucoseMonth, glucose: glucose });
      }

      const sortedEntries = currentGlucoseEntries.sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

      await setDoc(glucoseDocRef, { glucoseEntries: sortedEntries }, { merge: true });
      setGlucoseHistoryData(sortedEntries);

      toast({
        title: "Blood Glucose Saved",
        description: `Blood Glucose for ${inputGlucoseMonth} (${glucose}) has been saved.`,
        duration: 3000,
      });

      setShowBloodGlucoseInputModal(false);
      setInputGlucose('');
      setInputGlucoseMonth('');

    } catch (error) {
      console.error("Error saving Blood Glucose data:", error);
      setGlucoseInputError("Failed to save Blood Glucose data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save Blood Glucose data.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGlucose(false);
    }
  };

  // Function to generate wellness score using a rule-based system
  const generateWellnessScore = () => {
    setIsWellnessLoading(true);
    let score = 100; // Start with a perfect score

    // --- BMI Scoring ---
    if (bmiHistoryData.length > 0) {
      const totalBmi = bmiHistoryData.reduce((sum, entry) => sum + entry.bmi, 0);
      const avgBmi = totalBmi / bmiHistoryData.length;

      if (avgBmi < 18.5) { // Underweight
        score -= 15;
      } else if (avgBmi >= 25 && avgBmi < 30) { // Overweight
        score -= 10;
      } else if (avgBmi >= 30) { // Obesity
        score -= 20;
      }
      // Normal weight (18.5-24.9) has no deduction
    } else {
      score -= 5; // Small deduction if no BMI data
    }

    // --- Blood Pressure Scoring (using latest entry) ---
    if (bpHistoryData.length > 0) {
      const latestBp = bpHistoryData[bpHistoryData.length - 1];
      const systolic = latestBp.systolic;
      const diastolic = latestBp.diastolic;

      if (systolic >= 180 || diastolic >= 120) { // Hypertensive Crisis
        score -= 30;
      } else if ((systolic >= 140 && systolic <= 179) || (diastolic >= 90 && diastolic <= 119)) { // Hypertension Stage 2
        score -= 20;
      } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) { // Hypertension Stage 1
        score -= 10;
      } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) { // Elevated
        score -= 5;
      }
      // Normal (<120/80) has no deduction
    } else {
      score -= 5; // Small deduction if no BP data
    }

    // --- Blood Glucose Scoring (using average) ---
    if (glucoseHistoryData.length > 0) {
      const totalGlucose = glucoseHistoryData.reduce((sum, entry) => sum + entry.glucose, 0);
      const avgGlucose = totalGlucose / glucoseHistoryData.length;

      if (avgGlucose >= 126) { // Diabetes
        score -= 25;
      } else if (avgGlucose >= 100 && avgGlucose <= 125) { // Prediabetes
        score -= 10;
      }
      // Normal (<100) has no deduction
    } else {
      score -= 5; // Small deduction if no Glucose data
    }

    // Ensure score doesn't go below 0 or above 100
    score = Math.max(0, Math.min(100, score));
    setWellnessScore(score);
    setIsWellnessLoading(false);
  };

  // Effect to generate wellness score when health data changes
  useEffect(() => {
    // Only generate if auth is ready and there's some data
    if (isAuthReady) {
      generateWellnessScore();
    }
  }, [isAuthReady, bmiHistoryData, bpHistoryData, glucoseHistoryData]);

  // Helper to get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'hospital_contact':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'lab_test_attempt':
      case 'ai_lab_test_recommendation': 
      case 'lab_contact': 
        return <TestTube className="w-4 h-4 text-teal-500" />; 
      case 'blog_read':
        return <BookOpen className="w-4 h-4 text-lime-500" />; 
      case 'forum_post': 
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case 'profile_update': 
        return <Settings className="w-4 h-4 text-gray-500" />; 
      case 'doctor_booking': 
        return <Stethoscope className="w-4 h-4 text-red-500" />; 
      case 'ai_tool_opened':
        return <Brain className="w-4 h-4 text-purple-600" />; 
      case 'ai_chatbot_interaction':
        return <MessageSquare className="w-4 h-4 text-slate-500" />; 
      case 'ai_symptom_check':
        return <Stethoscope className="w-4 h-4 text-blue-500" />; 
      case 'ai_doctor_recommendation':
        return <User className="w-4 h-4 text-purple-500" />; 
      case 'ai_image_analysis':
        return <Image className="w-4 h-4 text-orange-500" />; 
      case 'ai_wellness_plan_generated':
        return <Activity className="w-4 h-4 text-teal-500" />; 
      case 'ai_drug_interaction_check':
        return <Pill className="w-4 h-4 text-red-500" />; 
      case 'ai_medical_term_simplify':
        return <FileText className="w-4 h-4 text-emerald-500" />; 
      case 'bmi_recorded': // New activity type
        return <User className="w-4 h-4 text-indigo-500" />;
      case 'blood_pressure_recorded': // New activity type
        return <Gauge className="w-4 h-4 text-rose-500" />;
      case 'blood_glucose_recorded': // New activity type
        return <Droplet className="w-4 h-4 text-cyan-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };


  return (
    <>
      <Helmet>
        <title>Dashboard - HealthPlat</title>
        <meta name="description" content="Your personal healthcare dashboard on HealthPlat." />
      </Helmet>
      <div className="space-y-8 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome Back!</h1>
        <p className="text-gray-600 dark:text-gray-400">Your personal healthcare dashboard at a glance.</p>

        {/* Top Row: Death Counters */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {DEATH_STATS.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={deathCounters[stat.id] ? deathCounters[stat.id].toLocaleString() : '0'}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Health Analytics & Appointment Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Analytics */}
          <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" /> Health Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Wellness Score */}
              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Overall Wellness Score:
                  {isWellnessLoading ? (
                    <Loader2 className="w-5 h-5 ml-2 inline-block animate-spin text-blue-600" />
                  ) : (
                    <span className="text-blue-600 font-bold"> {wellnessScore}/100</span>
                  )}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${wellnessScore}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on your recent activities and data.</p>
              </div>

              {/* BMI Trend */}
              <div className="relative"> {/* Added relative for positioning the button */}
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> BMI Trend</h3>
                <Button
                  onClick={() => setShowBmiInputModal(true)}
                  className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-sm"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add BMI Entry
                </Button>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={bmiHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-sm text-gray-600 dark:text-gray-400" />
                    <YAxis domain={['auto', 'auto']} className="text-sm text-gray-600 dark:text-gray-400" />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-900 dark:text-white text-sm">{`${label}`}</p>
                            <p className="text-blue-600 dark:text-blue-400 text-sm">{`BMI : ${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Line type="monotone" dataKey="bmi" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* NEW: Blood Pressure & Blood Glucose Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Pressure Trend (RadialBarChart) */}
                <div className="relative">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center"><Gauge className="w-5 h-5 mr-2" /> Blood Pressure (mmHg)</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={bpHistoryData.length > 0 ? [{ name: 'Blood Pressure', value: bpHistoryData[bpHistoryData.length - 1].systolic, fill: '#E74C3C' }] : []}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar minAngle={15} clockWise dataKey="value" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-background)', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} itemStyle={{ color: 'var(--text-color)' }} />
                      {bpHistoryData.length > 0 && (
                        <text
                          x="50%"
                          y="80%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold"
                          fill="#E74C3C"
                        >
                          {`${bpHistoryData[bpHistoryData.length - 1].systolic}/${bpHistoryData[bpHistoryData.length - 1].diastolic} mmHg`}
                        </text>
                      )}
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {bpHistoryData.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">No blood pressure data yet. Add an entry!</p>
                  )}
                  <Button
                    onClick={() => setShowBloodPressureInputModal(true)}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add BP Entry
                  </Button>
                </div>

                {/* Blood Glucose Trend (BarChart) */}
                <div className="relative">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center"><Droplet className="w-5 h-5 mr-2" /> Blood Glucose Trend (mg/dL)</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={glucoseHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
                      <XAxis dataKey="month" className="text-sm text-gray-600 dark:text-gray-400" />
                      <YAxis domain={['auto', 'auto']} className="text-sm text-gray-600 dark:text-gray-400" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-background)', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} itemStyle={{ color: 'var(--text-color)' }} />
                      <Bar dataKey="glucose" fill="#9B59B6" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <Button
                    onClick={() => setShowBloodGlucoseInputModal(true)}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Glucose Entry
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Interactive Appointment Calendar */}
          <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <CalendarDays className="w-6 h-6 mr-2 text-purple-600" /> Health Awareness Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{monthName}</h3>
                <Button variant="ghost" size="icon" onClick={goToNextMonth} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const events = getEventsForDay(day);
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const hasSpecialDay = events.some(event => event.type === 'awareness');

                  return (
                    <div
                      key={index}
                      className={`relative p-2 h-20 rounded-md flex flex-col items-center justify-start text-xs cursor-pointer transition-colors duration-200
                        ${day ? 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-transparent'}
                        ${isToday ? 'border-2 border-blue-500 dark:border-blue-400' : 'border border-gray-100 dark:border-gray-700'}
                        ${hasSpecialDay ? 'cursor-pointer' : ''}
                      `}
                      onClick={() => hasSpecialDay && handleDayClick(day)} // Only clickable if it has a special day
                    >
                      <span className={`font-semibold ${isToday ? 'text-blue-600 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {day ? day.getDate() : ''}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden w-full px-1">
                        {events.map(event => (
                          <div key={event.id} className="flex items-center text-white rounded-full px-1 py-0.5" style={{ backgroundColor: event.color }}>
                            {event.type === 'appointment' ? <Stethoscope className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            <span className="truncate">{event.title}</span> {/* Display event title */}
                          </div>
                        ))}
                      </div>
                      {events.length > 2 && ( // Indicate more events if overflow
                        <span className="absolute bottom-1 right-1 text-gray-500 dark:text-gray-400 text-[0.6rem]">+{events.length - 2}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Removed "Add New Event" button */}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline & Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Timeline */}
          <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-6 h-6 mr-2 text-orange-600" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">No recent activity to display.</p>
                ) : (
                  recentActivities.slice(0, 5).map((item, index) => ( // Display only latest 5 activities
                    <div key={item.id} className="mb-6 last:mb-0 flex items-start">
                      <div className="absolute -left-3 bg-white dark:bg-gray-900 rounded-full p-1 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                        {getActivityIcon(item.type)} {/* Use helper function for icon */}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="ml-4 flex-1"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                      </motion.div>
                    </div>
                  ))
                )}
              </div>
              {recentActivities.length > 5 && ( // Show button if more than 5 activities
                <div className="text-center mt-6">
                  <Button
                    onClick={() => setShowAllActivitiesDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors duration-200 shadow-md"
                  >
                    View All Activities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gamification / Wellness Badges */}
          <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Award className="w-6 h-6 mr-2 text-yellow-600" /> Wellness Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockBadges.map(badge => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`p-4 rounded-lg flex items-center shadow-md transition-all duration-300
                    ${badge.achieved ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
                  `}
                >
                  <span className="text-3xl mr-4">{badge.icon}</span>
                  <div>
                    <h4 className={`font-semibold ${badge.achieved ? 'text-yellow-800 dark:text-yellow-300' : 'text-gray-900 dark:text-white'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                    {badge.achieved && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                        <CheckCircle className="w-3 h-3 mr-1" /> Achieved!
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Chatbot (Floating) */}
        <AIAssistant />
      </div>

      {/* All Activities Dialog */}
      <AnimatePresence>
        {showAllActivitiesDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={() => setShowAllActivitiesDialog(false)} // Close when clicking outside
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-orange-600" /> All Activities
              </h2>
              <button
                onClick={() => setShowAllActivitiesDialog(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">No activities to display.</p>
                ) : (
                  recentActivities.map((item, index) => (
                    <div key={item.id} className="mb-6 last:mb-0 flex items-start">
                      <div className="absolute -left-3 bg-white dark:bg-gray-900 rounded-full p-1 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BMI Input Modal */}
      <AnimatePresence>
        {showBmiInputModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add BMI Entry</h3>
            <button
              onClick={() => setShowBmiInputModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <Label htmlFor="heightInput" className="text-gray-700 dark:text-gray-300">Height (cm)</Label>
                <Input
                  id="heightInput"
                  type="number"
                  placeholder="e.g., 175"
                  value={inputHeight}
                  onChange={(e) => setInputHeight(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isSavingBmi}
                />
              </div>
              <div>
                <Label htmlFor="weightInput" className="text-gray-700 dark:text-gray-300">Weight (kg)</Label>
                <Input
                  id="weightInput"
                  type="number"
                  placeholder="e.g., 70"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isSavingBmi}
                />
              </div>
              <div>
                <Label htmlFor="monthSelect" className="text-gray-700 dark:text-gray-300">Month</Label>
                <select
                  id="monthSelect"
                  value={inputMonth}
                  onChange={(e) => setInputMonth(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none"
                  disabled={isSavingBmi}
                >
                  <option value="">Select Month</option>
                  {MONTHS.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              {bmiInputError && (
                <p className="text-red-500 text-sm text-center">{bmiInputError}</p>
              )}
              <Button
                onClick={handleSaveBmi}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
                disabled={isSavingBmi}
              >
                {isSavingBmi ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Calculate & Save BMI
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blood Pressure Input Modal */}
      <AnimatePresence>
        {showBloodPressureInputModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Blood Pressure Entry</h3>
            <button
              onClick={() => setShowBloodPressureInputModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <Label htmlFor="systolicInput" className="text-gray-700 dark:text-gray-300">Systolic (mmHg)</Label>
                <Input
                  id="systolicInput"
                  type="number"
                  placeholder="e.g., 120"
                  value={inputSystolic}
                  onChange={(e) => setInputSystolic(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isSavingBp}
                />
              </div>
              <div>
                <Label htmlFor="diastolicInput" className="text-gray-700 dark:text-gray-300">Diastolic (mmHg)</Label>
                <Input
                  id="diastolicInput"
                  type="number"
                  placeholder="e.g., 80"
                  value={inputDiastolic}
                  onChange={(e) => setInputDiastolic(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isSavingBp}
                />
              </div>
              <div>
                <Label htmlFor="bpMonthSelect" className="text-gray-700 dark:text-gray-300">Month</Label>
                <select
                  id="bpMonthSelect"
                  value={inputBpMonth}
                  onChange={(e) => setInputBpMonth(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none"
                  disabled={isSavingBp}
                >
                  <option value="">Select Month</option>
                  {MONTHS.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              {bpInputError && (
                <p className="text-red-500 text-sm text-center">{bpInputError}</p>
              )}
              <Button
                onClick={handleSaveBloodPressure}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
                disabled={isSavingBp}
              >
                {isSavingBp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Blood Pressure
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blood Glucose Input Modal */}
      <AnimatePresence>
        {showBloodGlucoseInputModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Blood Glucose Entry</h3>
            <button
              onClick={() => setShowBloodGlucoseInputModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <Label htmlFor="glucoseInput" className="text-gray-700 dark:text-gray-300">Glucose (mg/dL)</Label>
                <Input
                  id="glucoseInput"
                  type="number"
                  placeholder="e.g., 100"
                  value={inputGlucose}
                  onChange={(e) => setInputGlucose(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  disabled={isSavingGlucose}
                />
              </div>
              <div>
                <Label htmlFor="glucoseMonthSelect" className="text-gray-700 dark:text-gray-300">Month</Label>
                <select
                  id="glucoseMonthSelect"
                  value={inputGlucoseMonth}
                  onChange={(e) => setInputGlucoseMonth(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none"
                  disabled={isSavingGlucose}
                >
                  <option value="">Select Month</option>
                  {MONTHS.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              {glucoseInputError && (
                <p className="text-red-500 text-sm text-center">{glucoseInputError}</p>
              )}
              <Button
                onClick={handleSaveBloodGlucose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
                disabled={isSavingGlucose}
              >
                {isSavingGlucose ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Blood Glucose
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Special Day Detail Modal */}
      <AnimatePresence>
        {showSpecialDayDialog && (
          <SpecialDayDetailModal
            specialDay={selectedSpecialDay}
            onClose={() => setShowSpecialDayDialog(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
