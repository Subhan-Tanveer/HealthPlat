// src/pages/Directory.jsx
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
  User,     // Icon for gender
  Syringe,  // Icon for disease/specialty
  Building2 // Alternative icon for hospital/clinic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../pages/firebase-config'; // Import your Firebase db instance
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

// API Key for Gemini
const GEMINI_API_KEY = "AIzaSyB1NKfvOWdAy1o2voJzQGEOMVq85Hnl3_U"; // Your provided API Key

// Your provided disease list (from BookDoctor.jsx)
const DISEASE_LIST = {
  15: "Fungal infection", 4: "Allergy", 16: "GERD", 9: "Chronic cholestasis", 14: "Drug Reaction",
  33: "Peptic ulcer diseae", 1: "AIDS", 12: "Diabetes", 17: "Gastroenteritis", 6: "Bronchial Asthma",
  23: "Hypertension", 30: "Migraine", 7: "Cervical spondylosis", 32: "Paralysis (brain hemorrhage)",
  28: "Jaundice", 29: "Malaria", 8: "Chicken pox", 11: "Dengue", 37: "Typhoid", 40: "hepatitis A",
  19: "Hepatitis B", 20: "Hepatitis C", 21: "Hepatitis D", 22: "Hepatitis E", 3: "Alcoholic hepatitis",
  36: "Tuberculosis", 10: "Common Cold", 34: "Pneumonia", 13: "Dimorphic hemmorhoids(piles)",
  18: "Heart attack", 39: "Varicose veins", 26: "Hypothyroidism", 24: "Hyperthyroidism",
  25: "Hypoglycemia", 31: "Osteoarthristis", 5: "Arthritis", 0: "(vertigo) Paroymsal Positional Vertigo",
  2: "Acne", 38: "Urinary tract infection", 35: "Psoriasis", 27: "Impetigo",
};

const Directory = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleHospitalCount, setVisibleHospitalCount] = useState(20);

  // AI Recommendation states
  const [userGender, setUserGender] = useState('');
  const [userDisease, setUserDisease] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [recommendedHospital, setRecommendedHospital] = useState(null);
  const [isAIRecommendationLoading, setIsAIRecommendationLoading] = useState(false);
  const [aiRecommendationError, setAIRecommendationError] = useState(null);
  const [uniqueCities, setUniqueCities] = useState([]);

  // Helper to get initials for placeholder image (adapted for hospitals, e.g., first letter)
  const getInitials = (name) => {
    if (!name) return 'H'; // Default for hospitals
    const parts = name.split(' ').filter(part => part.trim() !== '');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Effect to load hospital data from Firestore
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      setError(null);
      try {
        // Reference to your 'hospitals' collection in Firestore
        const hospitalsCollectionRef = collection(db, 'hospitals'); 
        const querySnapshot = await getDocs(hospitalsCollectionRef);
        
        const fetchedHospitals = [];
        const cities = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Use Firestore's doc.id as the unique identifier
          fetchedHospitals.push({ ...data, $id: doc.id }); 
          if (data.city) {
            cities.add(data.city);
          }
        });
        
        setHospitals(fetchedHospitals);
        setFilteredHospitals(fetchedHospitals); // Initialize filtered with all hospitals
        setUniqueCities(Array.from(cities).sort()); // Set unique cities
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hospitals from Firestore:", err);
        setError(`Failed to load hospital data from Firebase. Please ensure your Firestore database is set up correctly and has a 'hospitals' collection. Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []); // Empty dependency array means this runs once on component mount

  // Filter hospitals based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = hospitals.filter(hospital =>
      (hospital.name && hospital.name.toLowerCase().includes(lowercasedSearchTerm)) ||
      (hospital.city && hospital.city.toLowerCase().includes(lowercasedSearchTerm)) ||
      (hospital.area && hospital.area.toLowerCase().includes(lowercasedSearchTerm)) ||
      (hospital.address && hospital.address.toLowerCase().includes(lowercasedSearchTerm)) ||
      (hospital.contact && hospital.contact.toLowerCase().includes(lowercasedSearchTerm)) ||
      (hospital.doctors && hospital.doctors.toLowerCase().includes(lowercasedSearchTerm)) // Search by doctors listed in hospital
    );
    setFilteredHospitals(results);
    setVisibleHospitalCount(20); // Reset visible count on new search/filter
  }, [searchTerm, hospitals]);

  const handleCardClick = (hospital) => {
    setSelectedHospital(hospital);
    setIsDialogOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleHospitalCount(prevCount => prevCount + 20);
  };

  // Function to handle WhatsApp integration
  const handleWhatsAppClick = () => {
    if (selectedHospital && selectedHospital.contact) {
      // Clean the phone number for WhatsApp URL (remove spaces, dashes, etc.)
      const phoneNumber = selectedHospital.contact.replace(/[\s-()]/g, '');
      // If the number doesn't start with a country code, you might need to prepend one (e.g., "92" for Pakistan)
      // This example assumes numbers are already in a format WhatsApp can handle or are local to Pakistan.
      // For global use, you might need more robust country code handling.
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, '_blank');

      // NEW: Log activity
      logActivity(
        'hospital_contact',`Contacted hospital: ${selectedHospital.name} via WhatsApp`,
        { hospitalId: selectedHospital.$id, hospitalName: selectedHospital.name, contact: selectedHospital.contact }
      );

    } else {
      // Optionally, show a toast or alert if contact number is missing
      alert("Contact number not available for this hospital.");
    }
  };

  // --- AI Hospital Recommendation Functionality ---
  const getAIRecommendation = async () => {
    if (!userGender.trim() || !userDisease.trim() || !userLocation.trim()) {
      setAIRecommendationError("Please select your Gender, Disease, and Location for a hospital recommendation.");
      setRecommendedHospital(null);
      return;
    }

    setIsAIRecommendationLoading(true);
    setAIRecommendationError(null);
    setRecommendedHospital(null);

    try {
      // Prepare hospital data for the AI
      // We'll send relevant fields for AI to make a decision
      const hospitalsForAI = hospitals.map(hosp => ({
        $id: hosp.$id, // Include ID for mapping back
        name: hosp.name,
        city: hosp.city,
        area: hosp.area,
        doctors: hosp.doctors, // AI can infer specialties from doctor names
        contact: hosp.contact,
      }));

      const prompt = `As a hospital recommendation AI, analyze the following user request and list of hospitals.
      User details: Gender: "${userGender}", Disease/Condition: "${userDisease}", Location: "${userLocation}".
      
      Here is the list of available hospitals:
      ${JSON.stringify(hospitalsForAI, null, 2)}
      
      Please recommend the BEST hospital from this list based on:
      1. Closest match to the user's disease/condition (infer from 'doctors' field if no explicit specialty).
      2. Matching location (city and area).
      3. Overall suitability for the user's gender and condition.
      
      Provide your recommendation as a JSON object with the following structure:
      {
        "recommendedHospitalId": "The $id of the recommended hospital from the list, e.g., 'hosp_1'",
        "reason": "Brief explanation for the recommendation"
      }
      If no suitable hospital is found, return:
      {
        "recommendedHospitalId": null,
        "message": "No suitable hospital found based on your criteria. Please try different inputs."
      }`;
      
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "recommendedHospitalId": { "type": "STRING" },
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
              if (parsedResult.recommendedHospitalId) {
                const foundHospital = hospitals.find(hosp => hosp.$id === parsedResult.recommendedHospitalId);
                if (foundHospital) {
                  setRecommendedHospital({ ...foundHospital, reason: parsedResult.reason });
                  setAIRecommendationError(null);
                } else {
                  setRecommendedHospital(null);
                  setAIRecommendationError("AI recommended a hospital not found in the list. Please try again.");
                }
              } else {
                setRecommendedHospital(null);
                setAIRecommendationError(parsedResult.message || "No suitable hospital found based on your criteria.");
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
      console.error("Error calling Gemini API for hospital recommendation:", error);
      setAIRecommendationError("An error occurred while getting AI recommendation. Please check your network or API key.");
    } finally {
      setIsAIRecommendationLoading(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Hospital & Lab Directory - HealthPlat</title>
        <meta name="description" content="Find and compare hospitals and labs on HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">Find Your Perfect Hospital</h1>

        {/* AI Hospital Recommendation Section */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700">
          <div className="p-0 pb-4 flex flex-row items-center">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">AI Hospital Recommendation</h2>
          </div>
          <div className="p-0 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Let our AI help you find the best hospital based on your needs.</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Gender Select */}
              <select
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={userGender}
                onChange={(e) => setUserGender(e.target.value)}
                disabled={isAIRecommendationLoading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Disease Select */}
              <select
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-500"
                value={userDisease}
                onChange={(e) => setUserDisease(e.target.value)}
                disabled={isAIRecommendationLoading}
              >
                <option value="">Select Disease/Condition</option>
                {Object.values(DISEASE_LIST).map((disease) => (
                  <option key={disease} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>

              {/* Location Select */}
              <select
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
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
                onClick={getAIRecommendation} 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center"
                disabled={isAIRecommendationLoading || !userGender.trim() || !userDisease.trim() || !userLocation.trim() || hospitals.length === 0}
              >
                {isAIRecommendationLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                Get Recommendation
              </button>
            </div>

            {isAIRecommendationLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                <p className="text-blue-600 dark:text-blue-400">Finding the best hospital for you...</p>
              </div>
            )}

            {aiRecommendationError && (
              <div className="text-center text-red-600 dark:text-red-400 py-4">
                <p>{aiRecommendationError}</p>
              </div>
            )}

            {recommendedHospital && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleCardClick(recommendedHospital)}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                    {getInitials(recommendedHospital.name)}
                  </div>
                </div>
                <div className="flex-grow text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{recommendedHospital.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {recommendedHospital.city}, {recommendedHospital.area}
                  </p>
                  {recommendedHospital.contact && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                        <Phone className="w-4 h-4 mr-1 text-gray-500" /> {recommendedHospital.contact}
                    </p>
                  )}
                  {recommendedHospital.doctors && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5 italic">
                        Specialists: {recommendedHospital.doctors}
                    </p>
                  )}
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2 italic">
                    Reason: {recommendedHospital.reason}
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
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Search Hospitals</h2>
          </div>
          <div className="p-0">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Search by hospital name, city, area, or contact..."
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Apply Filters button is now implicitly handled by useEffect on searchTerm change */}
              <Button 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md"
                onClick={() => { /* No explicit action needed as filter is real-time */ }}
              >
                <Search className="w-5 h-5 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Available Hospitals List */}
        <div className="p-6 shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="p-0 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Available Hospitals ({Math.min(visibleHospitalCount, filteredHospitals.length)} of {filteredHospitals.length})
            </h2>
          </div>
          <div className="p-0">
            {loading && hospitals.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">Loading hospitals...</p>
            )}
            {error && (
              <p className="text-center text-lg text-red-600 dark:text-red-400 whitespace-pre-wrap">Error: {error}</p>
            )}

            {!loading && !error && filteredHospitals.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">No hospitals found matching your search. Try a different query.</p>
            )}

            <div className="grid grid-cols-1 gap-4 mt-6">
                {!error && filteredHospitals.slice(0, visibleHospitalCount).map(hospital => (
                    <motion.div
                        key={hospital.$id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * filteredHospitals.indexOf(hospital) }}
                    >
                        <div
                            className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
                            onClick={() => handleCardClick(hospital)}
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                                    {getInitials(hospital.name)}
                                </div>
                            </div>
                            <div className="flex-grow text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{hospital.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {hospital.city}, {hospital.area}
                                </p>
                                {hospital.contact && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                      <Phone className="w-4 h-4 mr-1 text-gray-500" /> {hospital.contact}
                                  </p>
                                )}
                                {hospital.doctors && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5 italic">
                                        Specialists: {hospital.doctors}
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
            {!loading && !error && filteredHospitals.length > visibleHospitalCount && (
                <div className="text-center py-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Load More Hospitals
                    </button>
                </div>
            )}

            {!loading && hospitals.length > 0 && filteredHospitals.length <= visibleHospitalCount && filteredHospitals.length > 0 && (
                <div className="text-center text-gray-600 dark:text-gray-400 py-6">
                    <p>All {filteredHospitals.length} hospitals displayed.</p>
                </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hospital Detail Dialog/Pop-up */}
      {isDialogOpen && selectedHospital && (
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
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-blue-300 shadow-lg mx-auto mb-4">
                    {getInitials(selectedHospital.name)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedHospital.name}</h2>
                <p className="text-md text-gray-700 dark:text-gray-300">
                  {selectedHospital.city}, {selectedHospital.area}
                </p>
              </div>

              <div className="w-full text-left space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" /> <strong>Address:</strong> {selectedHospital.address}
                </p>
                {selectedHospital.contact && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" /> <strong>Contact:</strong> {selectedHospital.contact}
                  </p>
                )}
                {selectedHospital.doctors && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" /> <strong>Doctors:</strong> {selectedHospital.doctors}
                  </p>
                )}
              </div>

              {recommendedHospital && recommendedHospital.$id === selectedHospital.$id && (
                <div className="w-full text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">AI Recommendation Reason</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                    {recommendedHospital.reason}
                  </p>
                </div>
              )}

              {/* Updated button for WhatsApp integration */}
              <button 
                onClick={handleWhatsAppClick} 
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
                disabled={!selectedHospital?.contact} // Disable if no contact number
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

export default Directory;
