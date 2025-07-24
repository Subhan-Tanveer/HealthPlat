import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Stethoscope, 
  FileText, 
  Image, 
  MessageSquare, 
  Heart, 
  Activity, // Used for Wellness Coach
  Pill, // Used for Drug Interaction Checker
  Mic, 
  ThumbsUp,
  TrendingUp,
  BookOpen, // Used for Medical Term Simplifier
  Bot,
  BarChart3,
  MapPin,
  TestTube, 
  Bell,
  Moon,
  Shield,
  Languages,
  Zap,
  Search,
  Send,
  Loader2,
  XCircle, 
  AlertTriangle, 
  Dumbbell, 
  Salad, 
  Syringe, 
  Info, 
  Phone as PhoneIcon, 
  Star as StarIcon, 
  ChevronRight as ChevronRightIcon, 
  Upload,
  Lightbulb,
  HandIcon,
  MessageCircleIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ReactMarkdown from 'react-markdown'; 

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../pages/firebase-config'; // Corrected path
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

// Symptom and Disease Lists provided by the user, converted to JavaScript objects
const SYMPTOMS_LIST = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12, 'spotting_urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32, 'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51, 'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55, 'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89, 'foul_smell_of_urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93, 'toxic_look_typhos': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101, 'dischromic_patches': 102, 'watering_from_eyes': 103, 'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116, 'fluid_overload_1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119, 'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123, 'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127, 'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
};

const DISEASE_LIST = {
    15: "Fungal infection", 4: "Allergy", 16: "GERD", 9: "Chronic cholestasis", 14: "Drug Reaction", 33: "Peptic ulcer diseae", 1: "AIDS", 12: "Diabetes", 17: "Gastroenteritis", 6: "Bronchial Asthma", 23: "Hypertension", 30: "Migraine", 7: "Cervical spondylosis", 32: "Paralysis (brain hemorrhage)", 28: "Jaundice", 29: "Malaria", 8: "Chicken pox", 11: "Dengue", 37: "Typhoid", 40: "hepatitis A", 19: "Hepatitis B", 20: "Hepatitis C", 21: "Hepatitis D", 22: "Hepatitis E", 3: "Alcoholic hepatitis", 36: "Tuberculosis", 10: "Common Cold", 34: "Pneumonia", 13: "Dimorphic hemmorhoids(piles)", 18: "Heart attack", 39: "Varicose veins", 26: "Hypothyroidism", 24: "Hyperthyroidism", 25: "Hypoglycemia", 31: "Osteoarthristis", 5: "Arthritis", 0: "(vertigo) Paroymsal Positional Vertigo", 2: "Acne", 38: "Urinary tract infection", 35: "Psoriasis", 27: "Impetigo"
};

const API_KEY = "AIzaSyB1NKfvOWdAy1o2voJzQGEOMVq85Hnl3_U"; // Your provided API Key for Gemini

const AITools = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTool, setActiveTool] = useState(null);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  // Symptom Checker states
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomCheckerResult, setSymptomCheckerResult] = useState(null); // Stores structured result
  const [isSymptomCheckerLoading, setIsSymptomCheckerLoading] = useState(false);
  const [symptomSearchTerm, setSearchTermSymptomChecker] = useState(''); // Renamed to avoid conflict
  const [showSymptomDropdown, setShowSymptomDropdown] = useState(false);
  const symptomInputRef = useRef(null);
  const symptomDropdownRef = useRef(null);

  // Doctor Recommender states
  const [doctors, setDoctors] = useState([]); // All doctors from Firebase
  const [uniqueCities, setUniqueCities] = useState([]); // Unique cities from doctors
  const [userLocation, setUserLocation] = useState(''); // Selected location for recommender
  const [userDisease, setUserDisease] = useState(''); // Selected disease for recommender
  const [recommendedDoctor, setRecommendedDoctor] = useState(null); // AI recommended doctor
  const [isDoctorRecommenderLoading, setIsDoctorRecommenderLoading] = useState(false);
  const [doctorRecommenderError, setDoctorRecommenderError] = useState(null);

  // Medical Image Analyzer states
  const [selectedImageFile, setSelectedImageFile] = useState(null); // Stores the actual File object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // URL for image preview
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null); // Stores AI analysis text
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false); // Loading state for image analysis
  const [imageAnalysisError, setImageAnalysisError] = useState(null); // Error state for image analysis

  // Wellness Coach states
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState(''); // in kg
  const [healthGoal, setHealthGoal] = useState('');
  const [medicalIssues, setMedicalIssues] = useState(''); // comma-separated
  const [activityLevel, setActivityLevel] = useState('');
  const [wellnessPlan, setWellnessPlan] = useState(null); // Structured plan from AI
  const [isWellnessLoading, setIsWellnessLoading] = useState(false);
  const [wellnessError, setWellnessError] = useState(null);

  // Lab Test Recommender states
  const [selectedLabTestSymptoms, setSelectedLabTestSymptoms] = useState([]); // Array of selected symptoms
  const [labTestSymptomSearchTerm, setLabTestSymptomSearchTerm] = useState('');
  const [showLabTestSymptomDropdown, setShowLabTestSymptomDropdown] = useState(false);
  const labTestSymptomInputRef = useRef(null);
  const labTestSymptomDropdownRef = useRef(null);

  const [medicalHistoryGoal, setMedicalHistoryGoal] = useState('');
  const [recommendedLabTests, setRecommendedLabTests] = useState(null); // Array of {testName, reason}
  const [isLabTestLoading, setIsLabTestLoading] = useState(false);
  const [labTestError, setLabTestError] = useState(null);

  // Drug Interaction Checker states
  const [medicationList, setMedicationList] = useState(''); // Comma-separated list of medications
  const [drugInteractionResult, setDrugInteractionResult] = useState(null); // Structured result from AI
  const [isDrugInteractionLoading, setIsDrugInteractionLoading] = useState(false);
  const [drugInteractionError, setDrugInteractionError] = useState(null);

  // Medical Term Simplifier states
  const [medicalTextInput, setMedicalTextInput] = useState('');
  const [simplifiedMedicalText, setSimplifiedMedicalText] = useState(null);
  const [isSimplifyingMedicalText, setIsSimplifyingMedicalText] = useState(false);
  const [medicalTextSimplifierError, setMedicalTextSimplifierError] = useState(null);


  // Helper to get initials for doctor avatar, ignoring titles
  const getInitials = (name) => {
    if (!name) return 'DR';

    // Define common titles/prefixes to ignore (case-insensitive)
    const titlesToIgnore = ['prof.', 'dr.', 'asst.', 'asst. prof.', 'md.', 'phd.', 'assoc.'];

    // Split the name, filter out empty strings and titles
    const parts = name.split(' ')
                      .filter(part => part.trim() !== '') // Remove empty parts
                      .filter(part => !titlesToIgnore.includes(part.toLowerCase().replace('.', ''))); // Remove titles and handle dot

    if (parts.length === 0) {
      return 'DR'; // If only titles or empty, fallback
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase(); // Only one name part left
    }
    if (parts.length >= 2) {
      // Take the first character of the first actual name part and the last actual name part
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return 'DR'; // Fallback
  };


  // Effect to load doctor data from Firestore for Doctor Recommender
  useEffect(() => {
    const fetchDoctors = async () => {
      // Only fetch if db is available and doctors haven't been loaded yet
      if (!db || doctors.length > 0) return; 

      try {
        const doctorsCollectionRef = collection(db, 'doctors'); 
        const querySnapshot = await getDocs(doctorsCollectionRef);
        
        const fetchedDoctors = [];
        const cities = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedDoctors.push({ ...data, "$id": doc.id }); 
          if (data.city) {
            cities.add(data.city);
          }
        });
        
        setDoctors(fetchedDoctors);
        setUniqueCities(Array.from(cities).sort());
      } catch (err) {
        console.error("Error fetching doctors for AI Tools:", err);
        // Set an error specifically for the recommender if it's the active tool
        if (activeTool && activeTool.component === 'DoctorRecommender') {
            setDoctorRecommenderError(`Failed to load doctor data. Please check your Firebase setup. Error: ${err.message}`);
        }
      }
    };

    fetchDoctors();
  }, [db, doctors.length, activeTool]);


  // Close symptom dropdown if clicked outside (for Symptom Checker)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (symptomInputRef.current && !symptomInputRef.current.contains(event.target) &&
          symptomDropdownRef.current && !symptomDropdownRef.current.contains(event.target)) {
        setShowSymptomDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close symptom dropdown if clicked outside (for Lab Test Recommender)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labTestSymptomInputRef.current && !labTestSymptomInputRef.current.contains(event.target) &&
          labTestSymptomDropdownRef.current && !labTestSymptomDropdownRef.current.contains(event.target)) {
        setShowLabTestSymptomDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Filtered list of symptoms for the dropdown, based on symptomSearchTerm and already selected symptoms
  const availableSymptomsForDropdown = Object.keys(SYMPTOMS_LIST)
    .filter(symptom => 
      !selectedSymptoms.includes(symptom) && 
      symptom.toLowerCase().includes(symptomSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));

  // Filtered list of symptoms for Lab Test Recommender dropdown
  const availableLabTestSymptomsForDropdown = Object.keys(SYMPTOMS_LIST)
    .filter(symptom => 
      !selectedLabTestSymptoms.includes(symptom) && 
      symptom.toLowerCase().includes(labTestSymptomSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));


  const aiTools = [
    {
      id: 1,
      title: 'Symptom Checker',
      description: 'AI-powered symptom analysis to suggest possible conditions and provide detailed information.',
      icon: Stethoscope,
      category: 'diagnosis',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      popular: true,
      component: 'SymptomChecker'
    },
    {
      id: 2,
      title: 'Doctor Recommender',
      description: 'Smart matching system to find the best doctors for your needs.',
      icon: Brain,
      category: 'recommendation',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      popular: true,
      component: 'DoctorRecommender'
    },
    {
      id: 4,
      title: 'Medical Image Analyzer',
      description: 'AI analysis of X-rays, MRIs, and other medical images.',
      icon: Image,
      category: 'analysis',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      popular: true,
      component: 'MedicalImageAnalyzer'
    },
    {
      id: 7,
      title: 'Wellness Coach',
      description: 'Personalized daily plan for diet, exercise, and sleep based on your health goals.',
      icon: Activity,
      category: 'wellness',
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      popular: false,
      component: 'WellnessCoach'
    },
    {
      id: 8,
      title: 'Drug Interaction Checker',
      description: 'Identify dangerous medication combinations and interactions',
      icon: Pill,
      category: 'safety',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      popular: true,
      component: 'DrugInteractionChecker' 
    },
    {
      id: 12,
      title: 'Medical Term Simplifier',
      description: 'Convert complex medical terms to plain language (English or Urdu).',
      icon: BookOpen,
      category: 'education',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      popular: false,
      component: 'MedicalTermSimplifier' // New component added
    },
    {
      id: 13,
      title: 'Healthcare Chatbot',
      description: 'AI assistant for medical FAQs and navigation help',
      icon: Bot,
      category: 'support',
      color: 'bg-slate-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      popular: true,
      component: 'Chatbot'
    },
    {
      id: 16,
      title: 'Lab Test Recommender',
      description: 'AI suggests appropriate tests based on symptoms and medical history.',
      icon: TestTube,
      category: 'recommendation',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      popular: true,
      component: 'LabTestRecommender' 
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'diagnosis', name: 'Diagnosis' },
    { id: 'recommendation', name: 'Recommendations' },
    { id: 'analysis', name: 'Analysis' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'safety', name: 'Safety' },
    { id: 'documentation', name: 'Documentation' },
    { id: 'mental-health', name: 'Mental Health' },
    { id: 'prediction', name: 'Prediction' },
    { id: 'monitoring', name: 'Monitoring' },
    { id: 'support', name: 'Support' },
    { id: 'education', name: 'Education' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'optimization', name: 'Optimization' },
    { id: 'security', name: 'Security' },
    { id: 'utility', name: 'Utility' }
  ];

  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularTools = aiTools.filter(tool => tool.popular);

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    setIsToolDialogOpen(true);
    // Reset Chatbot states
    setChatInput('');
    setChatHistory([]);
    setIsChatbotLoading(false);
    // Reset Symptom Checker states
    setSelectedSymptoms([]);
    setSymptomCheckerResult(null); // Reset structured result
    setIsSymptomCheckerLoading(false);
    setSearchTermSymptomChecker(''); // Reset symptom search
    setShowSymptomDropdown(false); // Hide dropdown on tool open
    // Reset Doctor Recommender states
    setUserLocation('');
    setUserDisease('');
    setRecommendedDoctor(null);
    setIsDoctorRecommenderLoading(false);
    setDoctorRecommenderError(null);
    // Reset Medical Image Analyzer states
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageAnalysisResult(null);
    setIsImageAnalyzing(false);
    setImageAnalysisError(null);
    // Reset Wellness Coach states
    setAge('');
    setGender('');
    setWeight('');
    setHealthGoal('');
    setMedicalIssues('');
    setActivityLevel('');
    setWellnessPlan(null);
    setIsWellnessLoading(false);
    setWellnessError(null);
    // Reset Lab Test Recommender states
    setSelectedLabTestSymptoms([]); 
    setLabTestSymptomSearchTerm(''); 
    setShowLabTestSymptomDropdown(false); 
    setMedicalHistoryGoal('');
    setRecommendedLabTests(null);
    setIsLabTestLoading(false);
    setLabTestError(null);
    // Reset Drug Interaction Checker states
    setMedicationList('');
    setDrugInteractionResult(null);
    setIsDrugInteractionLoading(false);
    setDrugInteractionError(null);
    // Reset Medical Term Simplifier states
    setMedicalTextInput('');
    setSimplifiedMedicalText(null);
    setIsSimplifyingMedicalText(false);
    setMedicalTextSimplifierError(null);

    // Log activity when an AI tool dialog is opened
    logActivity('ai_tool_opened', `Opened AI Tool: ${tool.title}`, { toolName: tool.title });
  };

  // --- Chatbot Functionality ---
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", parts: [{ text: chatInput }] };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatbotLoading(true);

    try {
      // Updated prompt for Chatbot to encourage emojis and spacing
      const apiChatHistory = [...chatHistory, userMessage];
      const lastUserMessage = apiChatHistory[apiChatHistory.length - 1].parts[0].text;
      const promptWithFormattingInstruction = `Respond to the following user message. If your response includes a list, please use relevant emojis as bullet points (e.g., ✨, 💡, ✅) and ensure there is a blank line after each list item and between paragraphs for improved readability.
      User: ${lastUserMessage}`;

      const payload = { 
        contents: [...apiChatHistory.slice(0, -1), { role: "user", parts: [{ text: promptWithFormattingInstruction }] }]
      };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const botResponseText = result.candidates[0].content.parts[0].text;
        setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botResponseText }] }]);
        logActivity('ai_chatbot_interaction', `Used Chatbot for: "${chatInput}"`, { query: chatInput, response: botResponseText }); // Log activity on successful bot response
      } else {
        console.error("Unexpected API response structure:", result);
        setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I couldn't get a response. Please try again." }] }]);
      }
    } catch (error) {
      console.error("Error calling Gemini API for chatbot:", error);
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "An error occurred while connecting to the AI. Please try again." }] }]);
    } finally {
      setIsChatbotLoading(false);
    }
  };

  // --- Symptom Checker Functionality ---
  const handleAddSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => [...prev, symptom]);
      setSearchTermSymptomChecker(''); // Clear search after adding
      setShowSymptomDropdown(false); // Hide dropdown
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptomToRemove));
  };

  const handleSymptomCheck = async () => {
    if (selectedSymptoms.length === 0) {
      setSymptomCheckerResult({ 
        diseaseName: "No Symptoms Selected", 
        description: "Please select at least one symptom to get a prediction.",
        precautions: [], workouts: [], medication: [], diets: []
      });
      return;
    }

    setIsSymptomCheckerLoading(true);
    setSymptomCheckerResult(null); // Clear previous result

    try {
        const prompt = `Based on the following symptoms: ${selectedSymptoms.join(', ')}.
        Please identify the most likely disease from this list: ${Object.values(DISEASE_LIST).join(', ')}.
        Provide a structured JSON response with the following fields:
        "diseaseName": The predicted disease name from the list or "Cannot determine a specific disease from the given symptoms."
        "description": A concise description of the predicted disease (or a general message if not determined).
        "precautions": An array of 3-5 key precautions for the predicted disease.
        "workouts": An array of 3-5 recommended workouts or physical activities.
        "medication": An array of 3-5 common medications or types of treatment.
        "diets": An array of 3-5 dietary recommendations.
        
        Ensure the response is valid JSON and strictly adheres to the schema. If a specific disease cannot be determined, provide general health advice for precautions, workouts, medication, and diets.`;
        
        const payload = { 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "diseaseName": { "type": "STRING" },
                        "description": { "type": "STRING" },
                        "precautions": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "workouts": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "medication": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "diets": { "type": "ARRAY", "items": { "type": "STRING" } }
                    },
                    required: ["diseaseName", "description", "precautions", "workouts", "medication", "diets"]
                }
            }
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonResponseText = result.candidates[0].content.parts[0].text;
            try {
                const parsedResult = JSON.parse(jsonResponseText);
                setSymptomCheckerResult(parsedResult);
                logActivity('ai_symptom_check', `Used Symptom Checker for: ${selectedSymptoms.join(', ')}`, { symptoms: selectedSymptoms, disease: parsedResult.diseaseName }); // Log activity
            } catch (jsonError) {
                console.error("Failed to parse JSON response:", jsonError);
                setSymptomCheckerResult({ 
                  diseaseName: "Error", 
                  description: "Could not parse AI response. Please try again.",
                  precautions: [], workouts: [], medication: [], diets: []
                });
            }
        } else {
            console.error("Unexpected API response structure:", result);
            setSymptomCheckerResult({ 
              diseaseName: "Error", 
              description: "Sorry, I couldn't analyze your symptoms. Please try again.",
              precautions: [], workouts: [], medication: [], diets: []
            });
        }
    } catch (error) {
        console.error("Error calling Gemini API for symptom checker:", error);
        setSymptomCheckerResult({ 
          diseaseName: "Error", 
          description: "An error occurred while processing your symptoms. Please try again.",
          precautions: [], workouts: [], medication: [], diets: []
        });
    } finally {
        setIsSymptomCheckerLoading(false);
    }
  };

  // --- Doctor Recommender Functionality ---
  const getDoctorRecommendation = async () => {
    if (!userLocation.trim() || !userDisease.trim()) {
      setDoctorRecommenderError("Please select both your location and the disease/specialty.");
      setRecommendedDoctor(null);
      return;
    }

    setIsDoctorRecommenderLoading(true);
    setDoctorRecommenderError(null);
    setRecommendedDoctor(null); // Clear previous recommendation

    try {
      // Prepare doctor data for the AI from the *currently loaded* doctors
      // IMPORTANT: Only send necessary fields to save tokens.
      // We will ask AI to return the $id (Firestore doc.id) of the best doctor.
      const doctorsForAI = doctors.map(doc => ({
        $id: doc.$id, // Include ID for mapping back
        name: doc.name,
        specialties: Array.isArray(doc.specialties) ? doc.specialties.join(', ') : doc.specialties,
        city: doc.city,
        rating: doc.rating,
      }));

      const prompt = `As a doctor recommendation AI, analyze the following user request and list of doctors.
      User is in "${userLocation}" and needs a doctor for "${userDisease}".
      
      Here is the list of available doctors:
      ${JSON.stringify(doctorsForAI, null, 2)}
      
      Please recommend the BEST doctor from this list based on:
      1. Closest match to the user's disease/specialty.
      2. Matching location (city).
      3. Highest rating.
      
      Provide your recommendation as a JSON object with the following structure:
      {
        "recommendedDoctorId": "The $id of the recommended doctor from the list, e.g., 'doc_1'",
        "reason": "Brief explanation for the recommendation"
      }
      If no suitable doctor is found, return:
      {
        "recommendedDoctorId": null,
        "message": "No suitable doctor found based on your criteria. Please try different symptoms or location."
      }`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "recommendedDoctorId": { "type": "STRING" },
                      "reason": { "type": "STRING" }
                  }
              }
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
          const jsonResponseText = result.candidates[0].content.parts[0].text;
          try {
              const parsedResult = JSON.parse(jsonResponseText);
              if (parsedResult.recommendedDoctorId) {
                const foundDoctor = doctors.find(doc => doc.$id === parsedResult.recommendedDoctorId); 
                if (foundDoctor) {
                  setRecommendedDoctor({ ...foundDoctor, reason: parsedResult.reason });
                  setDoctorRecommenderError(null);
                  logActivity('ai_doctor_recommendation', `Got Doctor Recommendation for ${userDisease} in ${userLocation}`, { disease: userDisease, location: userLocation, doctorId: foundDoctor.$id, doctorName: foundDoctor.name }); // Log activity
                } else {
                  setRecommendedDoctor(null);
                  setDoctorRecommenderError("AI recommended a doctor not found in the list. Please try again.");
                }
              } else {
                setRecommendedDoctor(null);
                setDoctorRecommenderError(parsedResult.message || "No suitable doctor found based on your criteria.");
              }
          } catch (jsonError) {
              console.error("Failed to parse JSON response from AI:", jsonError);
              setDoctorRecommenderError("Failed to interpret AI's recommendation. Please try again.");
          }
      } else {
          console.error("Unexpected AI response structure:", result);
          setDoctorRecommenderError("AI could not provide a recommendation. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for doctor recommendation:", error);
      setDoctorRecommenderError("An error occurred while getting AI recommendation. Please check your network or API key.");
    } finally {
      setIsDoctorRecommenderLoading(false);
    }
  };

  // --- Medical Image Analyzer Functionality ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageAnalysisResult(null); // Clear previous results
      setImageAnalysisError(null); // Clear previous errors
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImageFile) {
      setImageAnalysisError("Please upload a medical image to analyze.");
      return;
    }

    setIsImageAnalyzing(true);
    setImageAnalysisResult(null);
    setImageAnalysisError(null);

    try {
      // Convert image file to Base64
      const base64ImageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 string after 'base64,'
        reader.onerror = reject;
        reader.readAsDataURL(selectedImageFile);
      });

      // Updated prompt to request emojis and better spacing
      const prompt = `Analyze this medical image (e.g., chest X-ray, skin rash, MRI).
      Provide a detailed analysis in Markdown format, ensuring readability with line spacing and emojis.

      Your response should cover:
      -   🔍 **Overall Analysis:** A general interpretation of the image.
      -   🚨 **Key Findings/Abnormalities:** Any specific areas of concern, abnormalities, or potential issues observed. Use bullet points with emojis for each finding.
      -   ⚠️ **Risk Assessment/Considerations:** Any potential health risks or important considerations based on the findings. Use bullet points with emojis.
      -   💡 **General Advice/Recommendations:** Non-diagnostic, general advice or next steps. Use bullet points with emojis.

      Ensure there is a blank line after each bullet point and between paragraphs for improved readability.
      Remember, this analysis is for informational assistance only and does not replace a professional medical diagnosis.`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: selectedImageFile.type,
                  data: base64ImageData
                }
              }
            ]
          }
        ],
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setImageAnalysisResult(aiResponseText);
        logActivity('ai_image_analysis', `Analyzed a medical image`, { imageType: selectedImageFile.type }); // Log activity
      } else {
        console.error("Unexpected AI response structure:", result);
        setImageAnalysisError("AI could not analyze the image. Please try again or with a different image.");
      }

    } catch (error) {
      console.error("Error analyzing image with Gemini API:", error);
      setImageAnalysisError(`An error occurred during image analysis: ${error.message}. Please try again.`);
    } finally {
      setIsImageAnalyzing(false);
    }
  };

  // --- Wellness Coach Functionality ---
  const getWellnessPlan = async () => {
    // Basic validation
    if (!age || !gender || !weight || !healthGoal || !activityLevel) {
      setWellnessError("Please fill in all required fields (Age, Gender, Weight, Health Goal, Activity Level).");
      setWellnessPlan(null);
      return;
    }
    if (isNaN(age) || age <= 0) {
        setWellnessError("Please enter a valid age.");
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        setWellnessError("Please enter a valid weight.");
        return;
    }

    setIsWellnessLoading(true);
    setWellnessError(null);
    setWellnessPlan(null);

    try {
      // Updated prompt to request emojis and better spacing
      const prompt = `Generate a comprehensive daily wellness plan for an individual with the following details:
      Age: ${age} years
      Gender: ${gender}
      Weight: ${weight} kg
      Health Goal: ${healthGoal}
      Medical Issues: ${medicalIssues.trim() === '' ? 'None' : medicalIssues}
      Activity Level: ${activityLevel}

      The plan should include:
      1.  **Personalized Diet:** A sample daily meal plan (Breakfast, Lunch, Dinner, Snacks), specific food recommendations, and foods to avoid. For each point in the diet plan, use a 🥗 emoji. Ensure there's a blank line between each list item and between paragraphs for improved readability.
      2.  **Exercise Plan:** Specific exercise recommendations (e.g., types of cardio, strength training, yoga), suggested duration, frequency, and sets/reps if applicable. For each point in the exercise plan, use a 🏃 emoji. Ensure there's a blank line between each list item and between paragraphs for improved readability.
      3.  **Sleep Advice:** Recommendations for improving sleep quality, including ideal sleep duration and habits. For each point in the sleep advice, use a 😴 emoji. Ensure there's a blank line between each list item and between paragraphs for improved readability.
      4.  **Motivation Tips:** 3-5 actionable tips to stay motivated and consistent with the plan. For each point in the motivation tips, use a ✨ emoji. Ensure there's a blank line between each list item and between paragraphs for improved readability.

      Provide the response as a JSON object with the following structure. Ensure all content within the string fields is formatted using Markdown for readability (e.g., **bold**, *italics*, lists, headings).

      {
        "dietPlan": "Markdown formatted string for diet plan",
        "exercisePlan": "Markdown formatted string for exercise plan",
        "sleepAdvice": "Markdown formatted string for sleep advice",
        "motivationTips": "Markdown formatted string for motivation tips"
      }
      `;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "dietPlan": { "type": "STRING" },
                      "exercisePlan": { "type": "STRING" },
                      "sleepAdvice": { "type": "STRING" },
                      "motivationTips": { "type": "STRING" }
                  },
                  required: ["dietPlan", "exercisePlan", "sleepAdvice", "motivationTips"]
              }
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      // Check for HTTP errors first
      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
          const jsonResponseText = result.candidates[0].content.parts[0].text;
          try {
              const parsedResult = JSON.parse(jsonResponseText);
              // Validate the structure of the parsed result
              if (parsedResult.dietPlan && parsedResult.exercisePlan && parsedResult.sleepAdvice && parsedResult.motivationTips) {
                setWellnessPlan(parsedResult);
                logActivity('ai_wellness_plan_generated', `Generated a Wellness Plan for ${healthGoal}`, { age, gender, weight, healthGoal, medicalIssues, activityLevel }); // Log activity
              } else {
                throw new Error("AI response is missing required fields for the wellness plan.");
              }
          } catch (jsonError) {
              console.error("Failed to parse or validate JSON response from AI for wellness plan:", jsonError);
              setWellnessError(`Failed to interpret AI's wellness plan. The AI might have returned an unexpected format. Error: ${jsonError.message}`);
          }
      } else {
              console.error("Unexpected AI response structure for wellness plan:", result);
              setWellnessError("AI could not generate a wellness plan. The response was empty or malformed. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for wellness coach:", error);
      setWellnessError(`An error occurred while getting the wellness plan: ${error.message}. Please check your network, API key, or try again.`);
    } finally {
      setIsWellnessLoading(false);
    }
  };

  // --- Lab Test Recommender Functionality ---
  const handleAddLabTestSymptom = (symptom) => {
    if (!selectedLabTestSymptoms.includes(symptom)) {
      setSelectedLabTestSymptoms(prev => [...prev, symptom]);
      setLabTestSymptomSearchTerm(''); // Clear search after adding
      setShowLabTestSymptomDropdown(false); // Hide dropdown
    }
  };

  const handleRemoveLabTestSymptom = (symptomToRemove) => {
    setSelectedLabTestSymptoms(prev => prev.filter(s => s !== symptomToRemove));
  };

  const getLabTestRecommendations = async () => {
    if (selectedLabTestSymptoms.length === 0) {
      setLabTestError("Please select at least one symptom to get lab test recommendations.");
      setRecommendedLabTests(null);
      return;
    }

    setIsLabTestLoading(true);
    setLabTestError(null);
    setRecommendedLabTests(null); // Clear previous recommendations

    try {
      const prompt = `Based on the following symptoms: "${selectedLabTestSymptoms.join(', ')}".
      ${medicalHistoryGoal.trim() ? `Also consider the user's medical history/goal: "${medicalHistoryGoal}".` : ''}
      
      Please suggest relevant lab tests. Provide a structured JSON response as an array of objects. Each object should have:
      "testName": The name of the lab test (e.g., "CBC", "LFT", "Blood Sugar", "Thyroid Profile", "ECG").
      "reason": A concise reason for recommending this test. If the reason contains multiple points, use bullet points with relevant emojis (e.g., ✅, 📈, 🩸) and ensure a blank line after each bullet point and between paragraphs for improved readability.

      Example output structure:
      [
        {
          "testName": "CBC",
          "reason": "✅ To check for signs of infection or anemia.\n\n🩸 Evaluates red blood cells, white blood cells, and platelets."
        },
        {
          "testName": "LFT",
          "reason": "📈 To assess liver function and detect liver damage.\n\n💡 Important for overall metabolic health."
        }
      ]
      
      If no specific tests are immediately recommended, return an empty array or a message indicating so.`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "ARRAY",
                  items: {
                      type: "OBJECT",
                      properties: {
                          "testName": { "type": "STRING" },
                          "reason": { "type": "STRING" }
                      },
                      required: ["testName", "reason"]
                  }
              }
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
          const jsonResponseText = result.candidates[0].content.parts[0].text;
          try {
              const parsedResult = JSON.parse(jsonResponseText);
              if (Array.isArray(parsedResult)) {
                setRecommendedLabTests(parsedResult);
                logActivity('ai_lab_test_recommendation', `Got Lab Test Recommendations for symptoms: ${selectedLabTestSymptoms.join(', ')}`, { symptoms: selectedLabTestSymptoms, medicalHistoryGoal }); // Log activity
              } else {
                throw new Error("AI response is not an array for lab tests.");
              }
          } catch (jsonError) {
              console.error("Failed to parse JSON response from AI for lab tests:", jsonError);
              setLabTestError(`Failed to interpret AI's lab test recommendations. Error: ${jsonError.message}`);
          }
      } else {
          console.error("Unexpected AI response structure for lab tests:", result);
          setLabTestError("AI could not provide lab test recommendations. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for lab test recommender:", error);
      setLabTestError(`An error occurred while getting lab test recommendations: ${error.message}. Please check your network or API key.`);
    } finally {
      setIsLabTestLoading(false);
    }
  };

  // --- Drug Interaction Checker Functionality ---
  const checkDrugInteractions = async () => {
    if (!medicationList.trim()) {
      setDrugInteractionError("Please enter at least one medication to check for interactions.");
      setDrugInteractionResult(null);
      return;
    }

    setIsDrugInteractionLoading(true);
    setDrugInteractionError(null);
    setDrugInteractionResult(null);

    try {
      const prompt = `Analyze the following list of medications for potential drug interactions: "${medicationList}".
      Provide a structured JSON response with three arrays: "warnings", "suggestions", and "safeCombinations".
      
      Each item in "warnings" should be an object with "medications" (an array of involved drugs) and "description" (a detailed warning).
      Each item in "suggestions" should be an object with "medications" (an array of involved drugs) and "advice" (actionable advice).
      Each item in "safeCombinations" should be an object with "medications" (an array of safe drugs) and "confirmation" (a brief confirmation message).

      If no interactions are found, the "warnings" and "suggestions" arrays should be empty, and "safeCombinations" should confirm safety.
      
      Use relevant emojis within the "description", "advice", and "confirmation" strings for better readability (e.g., ⚠️ for warnings, 💡 for suggestions, ✅ for safe combinations). Ensure there is a blank line after each bullet point and between paragraphs for improved readability.

      Example output structure:
      {
        "warnings": [
          {
            "medications": ["Ibuprofen", "Aspirin"],
            "description": "⚠️ Combining Ibuprofen and Aspirin can increase the risk of gastrointestinal bleeding."
          }
        ],
        "suggestions": [
          {
            "medications": ["Medication A", "Medication B"],
            "advice": "💡 Consider taking Medication A and Medication B at least 2 hours apart to minimize interaction."
          }
        ],
        "safeCombinations": [
          {
            "medications": ["Paracetamol", "Amoxicillin"],
            "confirmation": "✅ Paracetamol and Amoxicillin are generally safe to combine."
          }
        ]
      }`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "warnings": { 
                          type: "ARRAY", 
                          items: { 
                              type: "OBJECT", 
                              properties: { "medications": { "type": "ARRAY", "items": { "type": "STRING" } }, "description": { "type": "STRING" } },
                              required: ["medications", "description"]
                          } 
                      },
                      "suggestions": { 
                          type: "ARRAY", 
                          items: { 
                              type: "OBJECT", 
                              properties: { "medications": { "type": "ARRAY", "items": { "type": "STRING" } }, "advice": { "type": "STRING" } },
                              required: ["medications", "advice"]
                          } 
                      },
                      "safeCombinations": { 
                          type: "ARRAY", 
                          items: { 
                              type: "OBJECT", 
                              properties: { "medications": { "type": "ARRAY", "items": { "type": "STRING" } }, "confirmation": { "type": "STRING" } },
                              required: ["medications", "confirmation"]
                          } 
                      }
                  },
                  required: ["warnings", "suggestions", "safeCombinations"]
              }
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
          const jsonResponseText = result.candidates[0].content.parts[0].text;
          try {
              const parsedResult = JSON.parse(jsonResponseText);
              // Basic validation for expected arrays
              if (Array.isArray(parsedResult.warnings) && Array.isArray(parsedResult.suggestions) && Array.isArray(parsedResult.safeCombinations)) {
                setDrugInteractionResult(parsedResult);
                logActivity('ai_drug_interaction_check', `Checked Drug Interactions for: ${medicationList}`, { medications: medicationList }); // Log activity
              } else {
                throw new Error("AI response is missing expected array fields for drug interactions.");
              }
          } catch (jsonError) {
              console.error("Failed to parse JSON response from AI for drug interactions:", jsonError);
              setDrugInteractionError(`Failed to interpret AI's drug interaction analysis. Error: ${jsonError.message}`);
          }
      } else {
          console.error("Unexpected AI response structure for drug interactions:", result);
          setDrugInteractionError("AI could not provide drug interaction analysis. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for drug interaction checker:", error);
      setDrugInteractionError(`An error occurred during drug interaction analysis: ${error.message}. Please check your network or API key.`);
    } finally {
      setIsDrugInteractionLoading(false);
    }
  };

  // --- Medical Term Simplifier Functionality ---
  const simplifyMedicalText = async () => {
    if (!medicalTextInput.trim()) {
      setMedicalTextSimplifierError("Please paste some medical text to simplify.");
      setSimplifiedMedicalText(null);
      return;
    }

    setIsSimplifyingMedicalText(true);
    setMedicalTextSimplifierError(null);
    setSimplifiedMedicalText(null);

    try {
      const prompt = `Simplify the following medical text into plain, easy-to-understand language.
      If the text is in English, simplify it into plain English.
      If the text is in Urdu, simplify it into plain Urdu.
      
      Medical Text: "${medicalTextInput}"
      
      Provide only the simplified text. Do not add any conversational phrases or extra information.`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setSimplifiedMedicalText(aiResponseText);
        logActivity('ai_medical_term_simplify', `Simplified medical text`, { originalTextLength: medicalTextInput.length }); // Log activity
      } else {
        console.error("Unexpected AI response structure:", result);
        setMedicalTextSimplifierError("AI could not simplify the text. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for medical term simplifier:", error);
      setMedicalTextSimplifierError(`An error occurred during simplification: ${error.message}. Please check your network or API key.`);
    } finally {
      setIsSimplifyingMedicalText(false);
    }
  };


  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Healthcare Tools</h1>
                <p className="text-purple-100">Advanced AI-powered tools to enhance your healthcare experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                <span>Powered by AI</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Tools */}
        {selectedCategory === 'all' && searchTerm === '' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular AI Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTools.slice(0, 6).map((tool, index) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToolClick(tool)}
                  className={`${tool.bgColor} p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left group`}
                >
                  <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`font-semibold ${tool.textColor} mb-2`}>{tool.title}</h3>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  <div className="flex items-center mt-3">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Popular</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All AI Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
            </h2>
            <span className="text-sm text-gray-500">{filteredTools.length} tools available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="ai-tool-card p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleToolClick(tool)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  {tool.popular && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Popular</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tool.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${tool.bgColor} ${tool.textColor} font-medium`}>
                    {categories.find(c => c.id === tool.category)?.name}
                  </span>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Try Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More AI Tools Coming Soon!</h3>
              <p className="text-gray-700 mb-4">
                We're constantly developing new AI-powered healthcare tools to improve your medical experience. 
                Stay tuned for updates and new features!
              </p>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => console.log("Newsletter subscription isn't implemented yet. Please request it in your next prompt!")}
              >
                Get Notified
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tool Dialog */}
      <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
        {activeTool && (
          <DialogContent className="space-y-4 p-4 sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6 sm:max-w-[700px] p-6 bg-gray-900 text-white border border-gray-700 rounded-xl shadow-2xl">
            <DialogHeader className="border-b border-gray-700 pb-4 mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${activeTool.color} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                  <activeTool.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-white">{activeTool.title}</DialogTitle>
                  <DialogDescription className="text-gray-400 mt-1">{activeTool.description}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Render specific tool component based on activeTool.component */}
            {activeTool.component === 'Chatbot' && (
              <div className="mt-4 space-y-4">
                <div className="h-64 overflow-y-auto border border-gray-700 rounded-md p-3 bg-gray-800 flex flex-col space-y-2 custom-scrollbar">
                  {chatHistory.length === 0 && (
                    <p className="text-gray-500 text-center italic mt-auto">Start a conversation with the AI.</p>
                  )}
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg max-w-[85%] text-sm shadow-md ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white self-end rounded-br-none' 
                          : 'bg-gray-700 text-gray-100 self-start rounded-bl-none'
                      }`}
                    >
                      {/* Apply ReactMarkdown and the new CSS class for bot responses */}
                      {msg.role === 'model' ? (
                        <div className="chatbot-markdown">
                          <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.parts[0].text}</p>
                      )}
                    </div>
                  ))}
                  {isChatbotLoading && (
                    <div className="self-start flex items-center bg-gray-700 text-gray-100 p-3 rounded-lg rounded-bl-none text-sm shadow-md">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-400" />
                      <span>AI is thinking...</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a health question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
                    className="flex-grow p-3 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isChatbotLoading}
                  />
                  <Button 
                    onClick={handleChatSubmit} 
                    disabled={isChatbotLoading || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                  >
                    {isChatbotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {activeTool.component === 'SymptomChecker' && (
              <div className="mt-4 space-y-6">
                {/* Symptom Selection Input */}
                <div className="relative">
                  <label htmlFor="symptom-search" className="block text-sm font-medium text-gray-300 mb-2">Select Symptoms:</label>
                  <div className="flex flex-wrap gap-2 p-2 border border-gray-700 rounded-md bg-gray-800 min-h-[50px] items-center">
                    {selectedSymptoms.map(symptom => (
                      <span key={symptom} className="flex items-center bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-sm">
                        {symptom.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                        <XCircle className="w-4 h-4 ml-2 cursor-pointer hover:text-red-300" onClick={() => handleRemoveSymptom(symptom)} />
                      </span>
                    ))}
                    <input
                      ref={symptomInputRef}
                      type="text"
                      id="symptom-search"
                      placeholder={selectedSymptoms.length === 0 ? "Search and add symptoms..." : ""}
                      value={symptomSearchTerm}
                      onChange={(e) => {
                        setSearchTermSymptomChecker(e.target.value);
                        setShowSymptomDropdown(true); // Show dropdown on input change
                      }}
                      onFocus={() => setShowSymptomDropdown(true)}
                      className="flex-grow p-1 bg-transparent text-white placeholder-gray-500 outline-none min-w-[150px]"
                      disabled={isSymptomCheckerLoading}
                    />
                  </div>

                  {showSymptomDropdown && availableSymptomsForDropdown.length > 0 && (
                    <div ref={symptomDropdownRef} className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg custom-scrollbar">
                      {availableSymptomsForDropdown.map(symptom => (
                        <div 
                          key={symptom} 
                          className="p-2 cursor-pointer hover:bg-gray-700 text-gray-200 text-sm"
                          onClick={() => handleAddSymptom(symptom)}
                        >
                          {symptom.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSymptomCheck} 
                  disabled={isSymptomCheckerLoading || selectedSymptoms.length === 0} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                >
                  {isSymptomCheckerLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Analyze Symptoms
                </Button>

                {isSymptomCheckerLoading && !symptomCheckerResult && (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-lg">Analyzing symptoms and generating insights...</p>
                    </div>
                )}

                {symptomCheckerResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Predicted Disease */}
                    <div className="bg-red-700 text-white p-4 rounded-lg text-center font-bold text-xl shadow-md">
                      Predicted Disease: {symptomCheckerResult.diseaseName}
                    </div>

                    {/* Description */}
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                      <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-blue-400" /> Description</h4>
                      <p className="text-gray-300 text-sm">{symptomCheckerResult.description}</p>
                    </div>

                    {/* Precautions */}
                    {symptomCheckerResult.precautions && symptomCheckerResult.precautions.length > 0 && (
                      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                        <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" /> Precautions</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {symptomCheckerResult.precautions.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Workouts/Foods */}
                    {symptomCheckerResult.workouts && symptomCheckerResult.workouts.length > 0 && (
                      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                        <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><Dumbbell className="w-5 h-5 mr-2 text-green-400" /> Recommended Workouts & Foods</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {symptomCheckerResult.workouts.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Medication */}
                    {symptomCheckerResult.medication && symptomCheckerResult.medication.length > 0 && (
                      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                        <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><Syringe className="w-5 h-5 mr-2 text-red-400" /> Medication</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {symptomCheckerResult.medication.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Diets */}
                    {symptomCheckerResult.diets && symptomCheckerResult.diets.length > 0 && (
                      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                        <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><Salad className="w-5 h-5 mr-2 text-orange-400" /> Diets</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {symptomCheckerResult.diets.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-4 italic text-center">
                      Disclaimer: This AI tool provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {activeTool.component === 'DoctorRecommender' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Select your location and the disease/specialty to get a doctor recommendation.</p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Location Select */}
                        <select
                            className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-gray-500"
                            value={userLocation}
                            onChange={(e) => setUserLocation(e.target.value)}
                            disabled={isDoctorRecommenderLoading || uniqueCities.length === 0}
                        >
                            <option value="">Select City</option>
                            {uniqueCities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                            ))}
                        </select>

                        {/* Disease Select */}
                        <select
                            className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 text-white placeholder-500"
                            value={userDisease}
                            onChange={(e) => setUserDisease(e.target.value)}
                            disabled={isDoctorRecommenderLoading}
                        >
                            <option value="">Select Disease/Specialty</option>
                            {Object.values(DISEASE_LIST).map((disease) => (
                            <option key={disease} value={disease}>
                                {disease}
                            </option>
                            ))}
                        </select>

                        <Button 
                            onClick={getDoctorRecommendation} 
                            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                            disabled={isDoctorRecommenderLoading || !userLocation.trim() || !userDisease.trim() || doctors.length === 0}
                        >
                            {isDoctorRecommenderLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Get Recommendation
                        </Button>
                    </div>

                    {isDoctorRecommenderLoading && !recommendedDoctor && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-400 text-lg">Finding the best doctor for you...</p>
                        </div>
                    )}

                    {doctorRecommenderError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{doctorRecommenderError}</p>
                        </div>
                    )}

                    {recommendedDoctor && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 flex items-center p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700"
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                                    {getInitials(recommendedDoctor.name)}
                                </div>
                            </div>
                            <div className="flex-grow text-left">
                                <h3 className="text-xl font-bold text-white mb-1">{recommendedDoctor.name}</h3>
                                <p className="text-sm text-gray-400 mb-0.5">
                                    {Array.isArray(recommendedDoctor.specialties) ? recommendedDoctor.specialties.join(', ') : recommendedDoctor.specialties}
                                </p>
                                <p className="text-sm text-gray-400 flex items-center mb-0.5">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {recommendedDoctor.city}
                                </p>
                                {recommendedDoctor.phone && (
                                    <p className="text-sm text-gray-400 flex items-center mb-0.5">
                                        <PhoneIcon className="w-4 h-4 mr-1 text-gray-500" /> {recommendedDoctor.phone}
                                    </p>
                                )}
                                <div className="flex items-center text-yellow-500 mt-2">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <StarIcon
                                            key={i}
                                            fill={i < parseFloat(recommendedDoctor.rating) ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            className="w-4 h-4"
                                        />
                                    ))}
                                    <span className="text-sm font-semibold ml-1">{recommendedDoctor.rating} / 5</span>
                                </div>
                                <p className="text-sm text-blue-300 mt-2 italic">
                                    Reason: {recommendedDoctor.reason}
                                </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {activeTool.component === 'MedicalImageAnalyzer' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Upload a medical image for AI analysis. The AI can help detect diseases, mark abnormal regions, and provide risk scores or advice.</p>
                    
                    {/* Image Upload Input */}
                    <div className="flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-lg p-6 bg-gray-800 relative cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isImageAnalyzing}
                        />
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Image Preview" className="max-w-full max-h-64 rounded-md object-contain mb-4" />
                        ) : (
                            <div className="text-center">
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Drag & drop an image or click to upload</p>
                                <p className="text-gray-500 text-xs mt-1">(e.g., Chest X-ray, Skin Rash, MRI)</p>
                            </div>
                        )}
                        {imagePreviewUrl && (
                            <Button 
                                onClick={() => { setSelectedImageFile(null); setImagePreviewUrl(null); setImageAnalysisResult(null); setImageAnalysisError(null); }}
                                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                disabled={isImageAnalyzing}
                            >
                                Remove Image
                            </Button>
                        )}
                    </div>

                    <Button 
                        onClick={analyzeImage} 
                        disabled={!selectedImageFile || isImageAnalyzing} 
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isImageAnalyzing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Analyze Image
                    </Button>

                    {isImageAnalyzing && !imageAnalysisResult && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                            <p className="text-gray-400 text-lg">Analyzing image, please wait...</p>
                        </div>
                    )}

                    {imageAnalysisError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{imageAnalysisError}</p>
                        </div>
                    )}

                    {imageAnalysisResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-4"
                        >
                            <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-orange-400" /> Analysis Result</h4>
                            {/* Use ReactMarkdown to render the AI response with proper formatting */}
                            <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar image-analysis-markdown">
                                <ReactMarkdown>{imageAnalysisResult}</ReactMarkdown>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 italic text-center">
                                Disclaimer: This AI tool provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {activeTool.component === 'WellnessCoach' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Get a personalized daily wellness plan based on your health goals and details.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Age (years)"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                        />
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                        />
                        <input
                            type="text"
                            placeholder="Health Goal (e.g., lose weight, build muscle)"
                            value={healthGoal}
                            onChange={(e) => setHealthGoal(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Medical Issues (comma-separated, e.g., diabetes, high BP)"
                            value={medicalIssues}
                            onChange={(e) => setMedicalIssues(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select
                            value={activityLevel}
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Activity Level</option>
                            <option value="Sedentary">Sedentary (little to no exercise)</option>
                            <option value="Lightly active">Lightly active (light exercise/sports 1-3 days/week)</option>
                            <option value="Moderately active">Moderately active (moderate exercise/sports 3-5 days/week)</option>
                            <option value="Very active">Very active (hard exercise/sports 6-7 days a week)</option>
                            <option value="Extra active">Extra active (very hard exercise/physical job)</option>
                        </select>
                    </div>

                    <Button 
                        onClick={getWellnessPlan} 
                        disabled={isWellnessLoading || !age || !gender || !weight || !healthGoal || !activityLevel} 
                        className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isWellnessLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Generate Wellness Plan
                    </Button>

                    {isWellnessLoading && !wellnessPlan && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                            <p className="text-gray-400 text-lg">Generating your personalized wellness plan...</p>
                        </div>
                    )}

                    {wellnessError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{wellnessError}</p>
                        </div>
                    )}

                    {wellnessPlan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-6"
                        >
                            <h4 className="font-semibold text-xl text-gray-200 flex items-center mb-4"><Activity className="w-6 h-6 mr-2 text-teal-400" /> Your Personalized Wellness Plan</h4>
                            
                            {wellnessPlan.dietPlan && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-lg text-gray-200 flex items-center"><Salad className="w-5 h-5 mr-2 text-orange-400" /> Personalized Diet</h5>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar wellness-markdown">
                                        <ReactMarkdown>{wellnessPlan.dietPlan}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {wellnessPlan.exercisePlan && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-lg text-gray-200 flex items-center"><Dumbbell className="w-5 h-5 mr-2 text-green-400" /> Exercise Plan</h5>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar wellness-markdown">
                                        <ReactMarkdown>{wellnessPlan.exercisePlan}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {wellnessPlan.sleepAdvice && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-lg text-gray-200 flex items-center"><Moon className="w-5 h-5 mr-2 text-indigo-400" /> Sleep Advice</h5>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar wellness-markdown">
                                        <ReactMarkdown>{wellnessPlan.sleepAdvice}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {wellnessPlan.motivationTips && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-lg text-gray-200 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-yellow-400" /> Motivation Tips</h5>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar wellness-markdown">
                                        <ReactMarkdown>{wellnessPlan.motivationTips}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-4 italic text-center">
                                Disclaimer: This AI tool provides general wellness information and is not a substitute for professional medical or health advice. Always consult a qualified healthcare professional or nutritionist for personalized guidance.
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {activeTool.component === 'LabTestRecommender' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Select your symptoms and provide any relevant medical history or health goals to get recommended lab tests.</p>
                    
                    {/* Symptom Selection Input for Lab Test Recommender */}
                    <div className="relative flex-grow">
                      <label htmlFor="lab-test-symptom-search" className="sr-only">Select Symptoms:</label>
                      <div className="flex flex-wrap gap-2 p-2 border border-gray-700 rounded-md bg-gray-800 min-h-[50px] items-center">
                        {selectedLabTestSymptoms.map(symptom => (
                          <span key={symptom} className="flex items-center bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-sm">
                            {symptom.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                            <XCircle className="w-4 h-4 ml-2 cursor-pointer hover:text-red-300" onClick={() => handleRemoveLabTestSymptom(symptom)} />
                          </span>
                        ))}
                        <input
                          ref={labTestSymptomInputRef}
                          type="text"
                          id="lab-test-symptom-search"
                          placeholder={selectedLabTestSymptoms.length === 0 ? "Search and add symptoms..." : ""}
                          value={labTestSymptomSearchTerm}
                          onChange={(e) => {
                            setLabTestSymptomSearchTerm(e.target.value);
                            setShowLabTestSymptomDropdown(true); // Show dropdown on input change
                          }}
                          onFocus={() => setShowLabTestSymptomDropdown(true)}
                          className="flex-grow p-1 bg-transparent text-white placeholder-gray-500 outline-none min-w-[150px]"
                          disabled={isLabTestLoading}
                        />
                      </div>

                      {showLabTestSymptomDropdown && availableLabTestSymptomsForDropdown.length > 0 && (
                        <div ref={labTestSymptomDropdownRef} className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg custom-scrollbar">
                          {availableLabTestSymptomsForDropdown.map(symptom => (
                            <div 
                              key={symptom} 
                              className="p-2 cursor-pointer hover:bg-gray-700 text-gray-200 text-sm"
                              onClick={() => handleAddLabTestSymptom(symptom)}
                            >
                              {symptom.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <textarea
                        placeholder="Optional: Medical history or health goals (e.g., 'family history of diabetes', 'want to monitor cholesterol')"
                        value={medicalHistoryGoal}
                        onChange={(e) => setMedicalHistoryGoal(e.target.value)}
                        rows="2"
                        className="w-full p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>

                    <Button 
                        onClick={getLabTestRecommendations} 
                        disabled={isLabTestLoading || selectedLabTestSymptoms.length === 0} 
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isLabTestLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Get Lab Test Recommendations
                    </Button>

                    {isLabTestLoading && !recommendedLabTests && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                            <p className="text-gray-400 text-lg">Analyzing and recommending lab tests...</p>
                        </div>
                    )}

                    {labTestError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{labTestError}</p>
                        </div>
                    )}

                    {recommendedLabTests && recommendedLabTests.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-4"
                        >
                            <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><TestTube className="w-5 h-5 mr-2 text-amber-400" /> Recommended Lab Tests</h4>
                            <div className="space-y-4 lab-test-markdown">
                                {recommendedLabTests.map((test, index) => (
                                    <div key={index} className="border-b border-gray-700 pb-3 last:border-b-0 last:pb-0">
                                        <h5 className="font-semibold text-md text-white mb-1">{test.testName}</h5>
                                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                            <ReactMarkdown>{test.reason}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-4 italic text-center">
                                Disclaimer: These recommendations are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
                            </p>
                        </motion.div>
                    )}
                     {recommendedLabTests && recommendedLabTests.length === 0 && !isLabTestLoading && (
                        <div className="text-center text-gray-400 py-4">
                            <p>No specific lab tests recommended based on the provided information. Please provide more details or consult a doctor.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTool.component === 'DrugInteractionChecker' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Enter a comma-separated list of medications to check for potential interactions.</p>
                    
                    <textarea
                        placeholder="Enter medications (e.g., Paracetamol, Ibuprofen, Metformin)"
                        value={medicationList}
                        onChange={(e) => setMedicationList(e.target.value)}
                        rows="3"
                        className="w-full p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isDrugInteractionLoading}
                    ></textarea>

                    <Button 
                        onClick={checkDrugInteractions} 
                        disabled={isDrugInteractionLoading || !medicationList.trim()} 
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isDrugInteractionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Check Drug Interactions
                    </Button>

                    {isDrugInteractionLoading && !drugInteractionResult && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                            <p className="text-gray-400 text-lg">Analyzing drug interactions...</p>
                        </div>
                    )}

                    {drugInteractionError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{drugInteractionError}</p>
                        </div>
                    )}

                    {drugInteractionResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-6"
                        >
                            <h4 className="font-semibold text-lg text-gray-200 mb-4 flex items-center"><Pill className="w-5 h-5 mr-2 text-red-400" /> Drug Interaction Analysis</h4>
                            
                            {drugInteractionResult.warnings && drugInteractionResult.warnings.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-md text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Warnings</h5>
                                    <ul className="space-y-2 drug-interaction-markdown">
                                        {drugInteractionResult.warnings.map((warning, idx) => (
                                            <li key={idx}>
                                                <p className="text-gray-300"><strong>{warning.medications.join(' + ')}:</strong></p>
                                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                                    <ReactMarkdown>{warning.description}</ReactMarkdown>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {drugInteractionResult.suggestions && drugInteractionResult.suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-md text-yellow-400 flex items-center"><Lightbulb className="w-5 h-5 mr-2" /> Suggestions</h5>
                                    <ul className="space-y-2 drug-interaction-markdown">
                                        {drugInteractionResult.suggestions.map((suggestion, idx) => (
                                            <li key={idx}>
                                                <p className="text-gray-300"><strong>{suggestion.medications.join(' & ')}:</strong></p>
                                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                                    <ReactMarkdown>{suggestion.advice}</ReactMarkdown>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {drugInteractionResult.safeCombinations && drugInteractionResult.safeCombinations.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-md text-green-400 flex items-center"><HandIcon className="w-5 h-5 mr-2" /> Safe Combinations</h5>
                                    <ul className="space-y-2 drug-interaction-markdown">
                                        {drugInteractionResult.safeCombinations.map((safe, idx) => (
                                            <li key={idx}>
                                                <p className="text-gray-300"><strong>{safe.medications.join(' & ')}:</strong></p>
                                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                                    <ReactMarkdown>{safe.confirmation}</ReactMarkdown>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Message if no interactions are found at all */}
                            {drugInteractionResult.warnings.length === 0 && 
                             drugInteractionResult.suggestions.length === 0 && 
                             drugInteractionResult.safeCombinations.length === 0 && (
                                <div className="text-center text-gray-400 py-4 flex items-center justify-center">
                                    <MessageCircleIcon className="w-6 h-6 mr-2" />
                                    <p>No specific interactions or safe combinations found for the provided medications. Always consult a healthcare professional.</p>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-4 italic text-center">
                                Disclaimer: This AI tool provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional or pharmacist for personalized guidance on medication interactions.
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {activeTool.component === 'MedicalTermSimplifier' && (
                <div className="mt-4 space-y-6">
                    <p className="text-gray-300">Paste medical text below to get a simplified explanation in plain English or Urdu.</p>
                    
                    <textarea
                        placeholder="Paste medical text here (e.g., 'The patient presents with hepatosplenomegaly and lymphadenopathy.')"
                        value={medicalTextInput}
                        onChange={(e) => setMedicalTextInput(e.target.value)}
                        rows="5"
                        className="w-full p-3 border rounded-md bg-gray-800 text-white placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isSimplifyingMedicalText}
                    ></textarea>

                    <Button 
                        onClick={simplifyMedicalText} 
                        disabled={isSimplifyingMedicalText || !medicalTextInput.trim()} 
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-md transition-all duration-200 shadow-lg"
                    >
                        {isSimplifyingMedicalText ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Simplify Medical Text
                    </Button>

                    {isSimplifyingMedicalText && !simplifiedMedicalText && (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded-lg">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                            <p className="text-gray-400 text-lg">Simplifying medical text...</p>
                        </div>
                    )}

                    {medicalTextSimplifierError && (
                        <div className="text-center text-red-500 py-4">
                            <p>{medicalTextSimplifierError}</p>
                        </div>
                    )}

                    {simplifiedMedicalText && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-4"
                        >
                            <h4 className="font-semibold text-lg text-gray-200 mb-2 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-emerald-400" /> Simplified Text</h4>
                            <div className="prose prose-invert prose-sm max-w-none text-gray-300 custom-scrollbar medical-simplifier-markdown">
                                <ReactMarkdown>{simplifiedMedicalText}</ReactMarkdown>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 italic text-center">
                                Disclaimer: This AI tool provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Fallback for not-yet-implemented tools */}
            {activeTool.component === undefined && (
              <div className="text-center py-4 text-gray-400">
                <p>
                  This tool is not yet functional. Please request it in your next prompt! 🚀
                </p>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
      {/* Custom CSS for ReactMarkdown output */}
      <style>{`
        .wellness-markdown ul, .image-analysis-markdown ul, .chatbot-markdown ul, .lab-test-markdown ul, .drug-interaction-markdown ul, .medical-simplifier-markdown ul {
          list-style: none; /* Remove default bullet */
          padding-left: 0; /* Remove default padding */
        }
        .wellness-markdown li, .image-analysis-markdown li, .chatbot-markdown li, .lab-test-markdown li, .drug-interaction-markdown li, .medical-simplifier-markdown li {
          margin-bottom: 0.75em; /* Add spacing after each list item */
          position: relative;
          padding-left: 1.5em; /* Space for custom bullet */
        }
        .wellness-markdown li::before, .image-analysis-markdown li::before, .chatbot-markdown li::before, .lab-test-markdown li::before, .drug-interaction-markdown li::before, .medical-simplifier-markdown li::before {
          content: '•'; /* Default bullet, will be replaced by AI if it follows instructions */
          position: absolute;
          left: 0;
          color: #60A5FA; /* A nice blue color for the bullet */
          font-size: 1.2em;
          line-height: inherit; /* Inherit line height for vertical alignment */
        }
        .wellness-markdown p, .image-analysis-markdown p, .chatbot-markdown p, .lab-test-markdown p, .drug-interaction-markdown p, .medical-simplifier-markdown p {
          margin-bottom: 1em; /* Add spacing after each paragraph */
        }
        /* Specific emoji overrides if AI doesn't include them */
        /* These styles rely on the AI putting the emoji directly in the markdown. */
        /* If the AI consistently fails to add emojis, we would need more complex CSS
           like targeting specific list items based on their content or order,
           which is less robust. For now, we assume AI will follow instructions. */
      `}</style>
    </>
  );
};

export default AITools;
