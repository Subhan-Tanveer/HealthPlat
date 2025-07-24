// src/pages/LabTests.jsx
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  ChevronRight, 
  Brain, 
  Lightbulb, 
  Loader2, 
  Search,
  TestTube, // Icon for labs
  Syringe, // Icon for specialty/service
  XCircle // For removing selected items
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../pages/firebase-config'; // Import your Firebase db instance
import { auth } from '../pages/firebase-config'; // Import auth to get current user
import { onAuthStateChanged } from 'firebase/auth'; // Import for auth state change listener
import { useToast } from "@/components/ui/use-toast"; // Import useToast

// Import activity logger
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

// API Key for Gemini (remains the same as it's for Gemini API, not Firebase DB)
const GEMINI_API_KEY = "AIzaSyB1NKfvOWdAy1o2voJzQGEOMVq85Hnl3_U"; // Your provided API Key

// Your provided symptom/disease list for AI recommendation
const SYMPTOMS_LIST = {
  'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12, 'spotting_urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32, 'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51, 'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55, 'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89, 'foul_smell_of_urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93, 'toxic_look_typhos': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101, 'dischromic_patches': 102, 'watering_from_eyes': 103, 'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116, 'fluid_overload_1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119, 'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123, 'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127, 'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
};

const LabTests = () => {
  const { toast } = useToast(); // Initialize toast
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleLabCount, setVisibleLabCount] = useState(20);

  // AI Recommendation states for labs
  const [selectedLabTestSymptoms, setSelectedLabTestSymptoms] = useState([]); // User input for symptoms (array)
  const [labTestSymptomSearchTerm, setLabTestSymptomSearchTerm] = useState(''); // Search term for symptom dropdown
  const [showLabTestSymptomDropdown, setShowLabTestSymptomDropdown] = useState(false); // Controls dropdown visibility
  const labTestSymptomInputRef = React.useRef(null); // Ref for input field
  const labTestSymptomDropdownRef = React.useRef(null); // Ref for dropdown container

  const [userLabLocation, setUserLabLocation] = useState(''); // User selected location for lab
  const [recommendedLab, setRecommendedLab] = useState(null);
  const [isAIRecommendationLoading, setIsAIRecommendationLoading] = useState(false);
  const [aiRecommendationError, setAIRecommendationError] = useState(null);
  const [uniqueCities, setUniqueCities] = useState([]); // Unique cities for labs dropdown

  const [currentUser, setCurrentUser] = useState(null); // State to hold the current user

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Helper to get initials for placeholder image (adapted for labs)
  const getInitials = (name) => {
    if (!name) return 'LAB'; // Default for labs
    const parts = name.split(' ').filter(part => part.trim() !== '');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Effect to load lab data from Firestore
  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Reference to your 'labs' collection in Firestore
        const labsCollectionRef = collection(db, 'labs'); 
        const querySnapshot = await getDocs(labsCollectionRef);
        
        const fetchedLabs = [];
        const cities = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Use Firestore's doc.id as the unique identifier
          fetchedLabs.push({ ...data, $id: doc.id }); 
          if (data.city) {
            cities.add(data.city);
          }
        });
        
        setLabs(fetchedLabs);
        setFilteredLabs(fetchedLabs); // Initialize filtered with all labs
        setUniqueCities(Array.from(cities).sort()); // Set unique cities for lab recommender
        setLoading(false);
      } catch (err) {
        console.error("Error fetching labs from Firestore:", err);
        setError(`Failed to load lab data from Firebase. Please ensure your Firestore database is set up correctly and has a 'labs' collection. Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchLabs();
  }, []); // Empty dependency array means this runs once on component mount

  // Filter labs based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = labs.filter(lab =>
      (lab.name && lab.name.toLowerCase().includes(lowercasedSearchTerm)) ||
      (lab.city && lab.city.toLowerCase().includes(lowcasedSearchTerm)) ||
      (lab.area && lab.area.toLowerCase().includes(lowcasedSearchTerm)) ||
      (lab.address && lab.address.toLowerCase().includes(lowcasedSearchTerm)) ||
      (lab.contact && lab.contact.toLowerCase().includes(lowcasedSearchTerm)) ||
      (lab.doctors && lab.doctors.toLowerCase().includes(lowcasedSearchTerm)) // Search by doctors/staff listed in lab
    );
    setFilteredLabs(results);
    setVisibleLabCount(20); // Reset visible count on new search/filter
  }, [searchTerm, labs]);

  const handleCardClick = (lab) => {
    setSelectedLab(lab);
    setIsDialogOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleLabCount(prevCount => prevCount + 20);
  };

  // Function to handle WhatsApp integration
  const handleWhatsAppClick = () => {
    if (selectedLab && selectedLab.contact) {
      const phoneNumber = selectedLab.contact.replace(/[\s-()]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, '_blank');
      // Log activity when "Contact via WhatsApp" is clicked
      const activityType = 'lab_contact';
      const activityDescription = `Contact Lab: ${selectedLab.name} via WhatsApp`;
      const activityDetails = { labId: selectedLab.$id, labName: selectedLab.name, contactMethod: 'WhatsApp' };
      
      console.log("Logging activity with type:", activityType, "description:", activityDescription, "details:", activityDetails);
      logActivity(activityType, activityDescription, activityDetails); 
      
      toast({
        title: "WhatsApp Opened",
        description: `Opened WhatsApp chat with ${selectedLab.name}.`,
        duration: 2000,
      });
    } else {
      console.error("Contact number not available for this lab.");
      toast({
        title: "Contact Not Available",
        description: "Contact number is not available for this lab.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // --- AI Lab Recommendation Functionality ---
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

  // Filtered list of symptoms for Lab Test Recommender dropdown, based on search term and already selected symptoms
  const availableLabTestSymptomsForDropdown = Object.keys(SYMPTOMS_LIST)
    .filter(symptom => 
      !selectedLabTestSymptoms.includes(symptom) && 
      symptom.toLowerCase().includes(labTestSymptomSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));

  const getAILabRecommendation = async () => {
    if (selectedLabTestSymptoms.length === 0 || !userLabLocation.trim()) {
      setAIRecommendationError("Please select at least one symptom and your location for a lab recommendation.");
      setRecommendedLab(null);
      return;
    }

    setIsAIRecommendationLoading(true);
    setAIRecommendationError(null);
    setRecommendedLab(null);

    try {
      // Prepare lab data for the AI
      const labsForAI = labs.map(lab => ({
        $id: lab.$id, // Include ID for mapping back
        name: lab.name,
        city: lab.city,
        area: lab.area,
        contact: lab.contact,
        // Assuming 'doctors' field in labs might indicate specialties or services
        services: lab.doctors || 'General Lab Services', 
      }));

      const prompt = `As a lab recommendation AI, analyze the following user request and list of labs.
      User details: Symptoms: "${selectedLabTestSymptoms.join(', ')}", Location: "${userLabLocation}".
      
      Here is the list of available labs:
      ${JSON.stringify(labsForAI, null, 2)}
      
      Please recommend the BEST lab from this list based on:
      1. Relevance to the user's symptoms (infer from lab services/specialties if available).
      2. Matching location (city and area).
      3. Overall suitability.
      
      Provide your recommendation as a JSON object with the following structure:
      {
        "recommendedLabId": "The $id of the recommended lab from the list, e.g., 'lab_1'",
        "reason": "Brief explanation for the recommendation"
      }
      If no suitable lab is found, return:
      {
        "recommendedLabId": null,
        "message": "No suitable lab found based on your criteria. Please try different inputs."
      }`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "recommendedLabId": { "type": "STRING" },
                      "reason": { "type": "STRING" }
                  }
              }
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
              if (parsedResult.recommendedLabId) {
                const foundLab = labs.find(lab => lab.$id === parsedResult.recommendedLabId);
                if (foundLab) {
                  setRecommendedLab({ ...foundLab, reason: parsedResult.reason });
                  setAIRecommendationError(null);
                  logActivity('ai_lab_test_recommendation', `Received AI Lab Recommendation for ${foundLab.name}`, { labId: foundLab.$id, labName: foundLab.name, symptoms: selectedLabTestSymptoms.join(', '), location: userLabLocation });
                } else {
                  setRecommendedLab(null);
                  setAIRecommendationError("AI recommended a lab not found in the list. Please try again.");
                }
              } else {
                setRecommendedLab(null);
                setAIRecommendationError(parsedResult.message || "No suitable lab found based on your criteria.");
              }
          } catch (jsonError) {
              console.error("Failed to parse JSON response from AI:", jsonError);
              setAIRecommendationError("Failed to interpret AI's recommendation. Please try again.");
          }
      } else {
          console.error("Unexpected AI response structure:", result);
          setAIRecommendationError("AI could not provide a recommendation. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for lab recommendation:", error);
      setAIRecommendationError("An error occurred while getting AI recommendation. Please check your network or API key.");
    } finally {
      setIsAIRecommendationLoading(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Lab & Diagnostic Centers - HealthPlat</title>
        <meta name="description" content="Find and book lab tests and diagnostic services on HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">Find Your Lab or Diagnostic Center</h1>

        {/* AI Lab Recommendation Section */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border border-purple-200 dark:border-gray-700">
          <div className="p-0 pb-4 flex flex-row items-center">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">AI Lab Recommendation</h2>
          </div>
          <div className="p-0 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Let our AI help you find the best lab based on your symptoms and location.</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Symptoms Input for Lab Test Recommender */}
              <div className="relative flex-grow">
                <label htmlFor="lab-test-symptom-search" className="sr-only">Select Symptoms:</label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-700 rounded-md bg-white min-h-[50px] items-center">
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
                    className="flex-grow p-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none min-w-[150px]"
                    disabled={isAIRecommendationLoading}
                  />
                </div>

                {showLabTestSymptomDropdown && availableLabTestSymptomsForDropdown.length > 0 && (
                  <div ref={labTestSymptomDropdownRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg custom-scrollbar">
                    {availableLabTestSymptomsForDropdown.map(symptom => (
                      <div 
                        key={symptom} 
                        className="p-2 cursor-pointer hover:bg-gray-100 text-gray-900 text-sm"
                        onClick={() => handleAddLabTestSymptom(symptom)}
                      >
                        {symptom.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Select */}
              <select
                className="flex-grow p-3 border rounded-md focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={userLabLocation}
                onChange={(e) => setUserLabLocation(e.target.value)}
                disabled={isAIRecommendationLoading || uniqueCities.length === 0}
              >
                <option value="">Select City</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <button 
                onClick={getAILabRecommendation} 
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center"
                disabled={isAIRecommendationLoading || selectedLabTestSymptoms.length === 0 || !userLabLocation.trim() || labs.length === 0}
              >
                {isAIRecommendationLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                Get Recommendation
              </button>
            </div>

            {isAIRecommendationLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-3" />
                <p className="text-purple-600 dark:text-purple-400">Finding the best lab for you...</p>
              </div>
            )}

            {aiRecommendationError && (
              <div className="text-center text-red-600 dark:text-red-400 py-4">
                <p>{aiRecommendationError}</p>
              </div>
            )}

            {recommendedLab && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleCardClick(recommendedLab)}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-purple-200 dark:border-purple-700 shadow-sm">
                    {getInitials(recommendedLab.name)}
                  </div>
                </div>
                <div className="flex-grow text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{recommendedLab.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {recommendedLab.city}, {recommendedLab.area}
                  </p>
                  {recommendedLab.contact && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                        <Phone className="w-4 h-4 mr-1 text-gray-500" /> {recommendedLab.contact}
                    </p>
                  )}
                  {recommendedLab.services && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5 italic">
                        Services: {recommendedLab.services}
                    </p>
                  )}
                  <p className="text-sm text-purple-800 dark:text-purple-200 mt-2 italic">
                    Reason: {recommendedLab.reason}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-6 h-6 text-gray-500" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="p-0 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Search Labs</h2>
          </div>
          <div className="p-0">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Search by lab name, city, area, or contact..."
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                className="w-full md:w-auto bg-purple-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md"
                onClick={() => { /* No explicit action needed as filter is real-time */ }}
              >
                <Search className="w-5 h-5 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Available Labs List */}
        <div className="p-6 shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="p-0 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Available Labs ({Math.min(visibleLabCount, filteredLabs.length)} of {filteredLabs.length})
            </h2>
          </div>
          <div className="p-0">
            {loading && labs.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">Loading labs...</p>
            )}
            {error && (
              <p className="text-center text-lg text-red-600 dark:text-red-400 whitespace-pre-wrap">Error: {error}</p>
            )}

            {!loading && !error && filteredLabs.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">No labs found matching your search. Try a different query.</p>
            )}

            <div className="grid grid-cols-1 gap-4 mt-6">
                {!error && filteredLabs.slice(0, visibleLabCount).map(lab => (
                    <motion.div
                        key={lab.$id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * filteredLabs.indexOf(lab) }}
                    >
                        <div
                            className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
                            onClick={() => handleCardClick(lab)}
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-purple-200 dark:border-purple-700 shadow-sm">
                                    {getInitials(lab.name)}
                                </div>
                            </div>
                            <div className="flex-grow text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{lab.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {lab.city}, {lab.area}
                                </p>
                                {lab.contact && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                      <Phone className="w-4 h-4 mr-1 text-gray-500" /> {lab.contact}
                                  </p>
                                )}
                                {lab.services && ( // Display services if available
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5 italic">
                                        Services: {lab.services}
                                    </p>
                                )}
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <ChevronRight className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Load More Button */}
            {!loading && !error && filteredLabs.length > visibleLabCount && (
                <div className="text-center py-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Load More Labs
                    </button>
                </div>
            )}

            {!loading && labs.length > 0 && filteredLabs.length <= visibleLabCount && filteredLabs.length > 0 && (
                <div className="text-center text-gray-600 dark:text-gray-400 py-6">
                    <p>All {filteredLabs.length} labs displayed.</p>
                </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lab Detail Dialog/Pop-up */}
      {isDialogOpen && selectedLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 w-full">
                <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-purple-300 shadow-lg mx-auto mb-4">
                    {getInitials(selectedLab.name)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLab.name}</h2>
                <p className="text-md text-gray-700 dark:text-gray-300">
                  {selectedLab.city}, {selectedLab.area}
                </p>
              </div>

              <div className="w-full text-left space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" /> <strong>Address:</strong> {selectedLab.address}
                </p>
                {selectedLab.contact && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" /> <strong>Contact:</strong> {selectedLab.contact}
                  </p>
                )}
                {selectedLab.doctors && ( // Display doctors/staff if available in the lab data
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Syringe className="w-4 h-4 mr-2 text-gray-500" /> <strong>Staff/Services:</strong> {selectedLab.doctors}
                  </p>
                )}
              </div>

              {recommendedLab && recommendedLab.$id === selectedLab.$id && (
                <div className="w-full text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">AI Recommendation Reason</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 italic">
                    {recommendedLab.reason}
                  </p>
                </div>
              )}

              {/* Button for WhatsApp integration */}
              <button 
                onClick={handleWhatsAppClick} 
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
                disabled={!selectedLab?.contact} // Disable if no contact number
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.34 4.96l-1.41 5.16 5.25-1.38c1.45.79 3.09 1.25 4.73 1.25 5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zm5.11 14.88l-.3-.5c-.16-.27-.6-.44-.85-.56-.25-.12-1.47-.73-1.7-.82-.23-.09-.4-.12-.56.12-.16.25-.6 1.05-.73 1.2-.12.16-.25.18-.46.06-.2-.12-.85-.3-1.6-.99-.6-.53-1-1.2-1.4-1.92-.4-.73-.04-.67.2-.92.2-.25.3-.44.44-.6.14-.16.07-.3.04-.44-.03-.16-.12-.4-.25-.6-.12-.2-.25-.23-.46-.23h-.44c-.2 0-.5.09-.76.34-.25.25-.96.96-.96 2.33s.99 2.7 1.13 2.89c.14.16 1.95 2.98 4.75 4.17 2.45 1.02 2.92.83 3.45.79.53-.04 1.6-.65 1.83-.92.23-.25.23-.44.16-.56z"/>
                </svg>
                Contact via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabTests;
