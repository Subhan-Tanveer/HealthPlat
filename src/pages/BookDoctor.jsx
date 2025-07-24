// src/pages/BookDoctor.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, ChevronRight, Brain, Lightbulb, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../pages/firebase-config'; // Import your Firebase db instance
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

// API Key for Gemini (remains the same as it's for Gemini API, not Firebase DB)
const GEMINI_API_KEY = "AIzaSyB1NKfvOWdAy1o2voJzQGEOMVq85Hnl3_U";

const BookDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleDoctorCount, setVisibleDoctorCount] = useState(20);

  // AI Recommendation states
  const [userLocation, setUserLocation] = useState('');
  const [userDisease, setUserDisease] = useState('');
  const [recommendedDoctor, setRecommendedDoctor] = useState(null);
  const [isAIRecommendationLoading, setIsAIRecommendationLoading] = useState(false);
  const [aiRecommendationError, setAIRecommendationError] = useState(null);
  const [uniqueCities, setUniqueCities] = useState([]);
  
  // Your provided disease list
  const disease_list = {15: "Fungal infection",4: "Allergy",16: "GERD",9: "Chronic cholestasis",14: "Drug Reaction",33: "Peptic ulcer diseae",1: "AIDS",12: "Diabetes", 17: "Gastroenteritis",6: "Bronchial Asthma",23: "Hypertension",30: "Migraine",7: "Cervical spondylosis",32: "Paralysis (brain hemorrhage)",28: "Jaundice",29: "Malaria",8: "Chicken pox",11: "Dengue",37: "Typhoid",40: "hepatitis A",19: "Hepatitis B",20: "Hepatitis C",21: "Hepatitis D",22: "Hepatitis E",3: "Alcoholic hepatitis",36: "Tuberculosis",10: "Common Cold",34: "Pneumonia",13: "Dimorphic hemmorhoids(piles)",18: "Heart attack",39: "Varicose veins",26: "Hypothyroidism",24: "Hyperthyroidism",25: "Hypoglycemia",31: "Osteoarthristis",5: "Arthritis",0: "(vertigo) Paroymsal  Positional Vertigo",2: "Acne",38: "Urinary tract infection",35: "Psoriasis",27: "Impetigo",};

  // Helper to get initials for placeholder image
  const getInitials = (name) => {
    if (!name) return 'DR';

    // Define common titles/prefixes to ignore (case-insensitive)
    const titlesToIgnore = ['Prof.', 'Dr.', 'Asst.'];

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

  // Effect to load doctor data from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        // Reference to your 'doctors' collection in Firestore
        const doctorsCollectionRef = collection(db, 'doctors'); 
        const querySnapshot = await getDocs(doctorsCollectionRef);
        
        const fetchedDoctors = [];
        const cities = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Use Firestore's doc.id as the unique identifier
          fetchedDoctors.push({ ...data, $id: doc.id }); 
          if (data.city) {
            cities.add(data.city);
          }
        });
        
        setDoctors(fetchedDoctors);
        setFilteredDoctors(fetchedDoctors); // Initialize filtered with all doctors
        setUniqueCities(Array.from(cities).sort()); // Set unique cities
        setLoading(false);
      } catch (err) {
        console.error("Error fetching doctors from Firestore:", err);
        setError(`Failed to load doctor data from Firebase. Please ensure your Firestore database is set up correctly and has a 'doctors' collection. Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []); // Empty dependency array means this runs once on component mount

  // Filter doctors based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = doctors.filter(doctor =>
      (doctor.name && doctor.name.toLowerCase().includes(lowercasedSearchTerm)) ||
      (Array.isArray(doctor.specialties)
        ? doctor.specialties.some(s => s && s.toLowerCase().includes(lowercasedSearchTerm))
        : (doctor.specialties && typeof doctor.specialties === 'string' && doctor.specialties.toLowerCase().includes(lowercasedSearchTerm))) ||
      (doctor.city && doctor.city.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredDoctors(results);
    setVisibleDoctorCount(20); // Reset visible count on new search/filter
  }, [searchTerm, doctors]);

  const handleCardClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleDoctorCount(prevCount => prevCount + 20);
  };

  // NEW: Handle Book Now click
  const handleBookNowClick = () => {
    if (selectedDoctor) {
      // Log the activity
      logActivity(
        'doctor_booking',
        `Booked appointment with Dr. ${selectedDoctor.name} for ${selectedDoctor.specialties}`,
        { doctorId: selectedDoctor.$id, doctorName: selectedDoctor.name, specialty: selectedDoctor.specialties }
      );
      // In a real application, you would proceed with the actual booking logic here
      alert(`Appointment booked with Dr. ${selectedDoctor.name}! (This is a demo action)`);
      setIsDialogOpen(false); // Close the dialog after "booking"
    }
  };

  // --- AI Recommendation Functionality ---
  const getAIRecommendation = async () => {
    if (!userLocation.trim() || !userDisease.trim()) {
      setAIRecommendationError("Please select both your location and the disease/specialty.");
      setRecommendedDoctor(null);
      return;
    }

    setIsAIRecommendationLoading(true);
    setAIRecommendationError(null);
    setRecommendedDoctor(null);

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
              if (parsedResult.recommendedDoctorId) {
                const foundDoctor = doctors.find(doc => doc.$id === parsedResult.recommendedDoctorId);
                if (foundDoctor) {
                  setRecommendedDoctor({ ...foundDoctor, reason: parsedResult.reason });
                  setAIRecommendationError(null);
                } else {
                  setRecommendedDoctor(null);
                  setAIRecommendationError("AI recommended a doctor not found in the list. Please try again.");
                }
              } else {
                setRecommendedDoctor(null);
                setAIRecommendationError(parsedResult.message || "No suitable doctor found based on your criteria.");
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
      console.error("Error calling Gemini API for recommendation:", error);
      setAIRecommendationError("An error occurred while getting AI recommendation. Please check your network or API key.");
    } finally {
      setIsAIRecommendationLoading(false);
    }
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6 md:p-8"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Find Your Perfect Doctor</h1>

        {/* AI Recommendation Section */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700">
          <div className="p-0 pb-4 flex flex-row items-center">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">AI Doctor Recommendation</h2>
          </div>
          <div className="p-0 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Let our AI help you find the best doctor based on your needs.</p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Location Select */}
              <select
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                disabled={isAIRecommendationLoading}
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
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-500"
                value={userDisease}
                onChange={(e) => setUserDisease(e.target.value)}
                disabled={isAIRecommendationLoading}
              >
                <option value="">Select Disease/Specialty</option>
                {Object.values(disease_list).map((disease) => (
                  <option key={disease} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>

              <button 
                onClick={getAIRecommendation} 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md"
                disabled={isAIRecommendationLoading || !userLocation.trim() || !userDisease.trim()}
              >
                {isAIRecommendationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                Get Recommendation
              </button>
            </div>

            {isAIRecommendationLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                <p className="text-blue-600 dark:text-blue-400">Finding the best doctor for you...</p>
              </div>
            )}

            {aiRecommendationError && (
              <div className="text-center text-red-600 dark:text-red-400 py-4">
                <p>{aiRecommendationError}</p>
              </div>
            )}

            {recommendedDoctor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleCardClick(recommendedDoctor)}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                    {getInitials(recommendedDoctor.name)}
                  </div>
                </div>
                <div className="flex-grow text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{recommendedDoctor.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">
                    {Array.isArray(recommendedDoctor.specialties) ? recommendedDoctor.specialties.join(', ') : recommendedDoctor.specialties}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {recommendedDoctor.city}
                  </p>
                  {recommendedDoctor.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                        <Phone className="w-4 h-4 mr-1 text-gray-500" /> {recommendedDoctor.phone}
                    </p>
                  )}
                  <div className="flex items-center text-yellow-500 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        fill={i < parseFloat(recommendedDoctor.rating) ? "currentColor" : "none"}
                        stroke="currentColor"
                        className="w-4 h-4"
                      />
                    ))}
                    <span className="text-sm font-semibold ml-1">{recommendedDoctor.rating} / 5</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2 italic">
                    Reason: {recommendedDoctor.reason}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-6 h-6 text-gray-500" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Existing Search and Filter Section */}
        <div className="p-6 shadow-lg rounded-xl">
          <div className="p-0 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Search Doctors</h2>
          </div>
          <div className="p-0">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="Search by name, specialty, or city..."
                className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Existing Available Doctors List */}
        <div className="p-6 shadow-lg rounded-xl">
          <div className="p-0 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Available Doctors ({Math.min(visibleDoctorCount, filteredDoctors.length)} of {filteredDoctors.length})
            </h2>
          </div>
          <div className="p-0">
            {loading && doctors.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">Loading doctors...</p>
            )}
            {error && (
              <p className="text-center text-lg text-red-600 dark:text-red-400 whitespace-pre-wrap">Error: {error}</p>
            )}

            {!loading && !error && filteredDoctors.length === 0 && (
              <p className="text-center text-lg text-gray-600 dark:text-gray-400">No doctors found matching your search. Try a different query.</p>
            )}

            <div className="grid grid-cols-1 gap-4 mt-6">
                {!error && filteredDoctors.slice(0, visibleDoctorCount).map(doctor => (
                    <motion.div
                        key={doctor.$id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * doctors.indexOf(doctor) }}
                    >
                        <div
                            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() => handleCardClick(doctor)}
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                                    {getInitials(doctor.name)}
                                </div>
                            </div>
                            <div className="flex-grow text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{doctor.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-500" /> {doctor.city}
                                </p>
                                {doctor.phone && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-0.5">
                                      <Phone className="w-4 h-4 mr-1 text-gray-500" /> {doctor.phone}
                                  </p>
                                )}
                                <div className="flex items-center text-yellow-500 mt-2">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            fill={i < doctor.rating ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            className="w-4 h-4"
                                        />
                                    ))}
                                    <span className="text-sm font-semibold ml-1">{doctor.rating} / 5</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <ChevronRight className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Load More Button */}
            {!loading && !error && filteredDoctors.length > visibleDoctorCount && (
                <div className="text-center py-6">
                    <button
                        onClick={handleLoadMore}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Load More Doctors
                    </button>
                </div>
            )}

            {!loading && doctors.length > 0 && filteredDoctors.length <= visibleDoctorCount && filteredDoctors.length > 0 && (
                <div className="text-center text-gray-600 dark:text-gray-400 py-6">
                    <p>All {filteredDoctors.length} doctors displayed.</p>
                </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Doctor Detail Dialog/Pop-up */}
      {isDialogOpen && selectedDoctor && (
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
                    {getInitials(selectedDoctor.name)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</h2>
                <p className="text-md text-gray-700 dark:text-gray-300">
                  {Array.isArray(selectedDoctor.specialties) ? selectedDoctor.specialties.join(', ') : selectedDoctor.specialties}
                </p>
              </div>

              <div className="w-full text-left space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" /> <strong>City:</strong> {selectedDoctor.city}
                </p>
                {selectedDoctor.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" /> <strong>Phone:</strong> {selectedDoctor.phone}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    🗓️ <strong>Experience:</strong> {selectedDoctor.experience} Years
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    💰 <strong>Fee:</strong> PKR {selectedDoctor.fee}
                </p>
                <div className="flex items-center text-yellow-500">
                    <Star fill="currentColor" stroke="none" className="w-5 h-5 mr-1" />
                    <span className="text-base font-semibold">{selectedDoctor.rating} / 5</span>
                </div>
              </div>

              {selectedDoctor.about && (
                <div className="w-full text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">About</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedDoctor.about}
                  </p>
                </div>
              )}

              <button 
                onClick={handleBookNowClick} // Changed to call the new handler
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDoctor;
