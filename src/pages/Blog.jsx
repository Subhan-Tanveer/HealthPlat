// src/pages/Blog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen, // For blog icon
  Headphones, // For Text-to-Speech
  Languages, // For translation
  Lightbulb, // For AI features
  X, // For closing modal
  Search, // For search bar
  Loader2, // For loading states
  Square // For stop button
} from 'lucide-react';

// Import Firebase Firestore functions (if you plan to use Firestore for real blogs)
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase-config'; // Adjust path as necessary
import { auth } from '../pages/firebase-config'; // Import auth to get current user
import { onAuthStateChanged } from 'firebase/auth'; // Import for auth state change listener

// Import activity logger
import { logActivity } from '../utils/activityLogger'; // NEW: Import logActivity

// API Key for Gemini
const GEMINI_API_KEY = "AIzaSyB1NKfvOWdAy1o2voJzQGEOMVq85Hnl3_U"; // Your provided API Key

// --- Mock Blog Data (Replace with Firestore Fetching in a real app) ---
const MOCK_BLOG_POSTS = [
  {
    id: "blog1",
    title: "Understanding Diabetes: A Simple Guide",
    author: "Dr. Aisha Khan",
    date: "October 26, 2023",
    image: "https://dpuhospital.com/images/blogs/diabetes-types-symptoms-causes-treatment-management.jpg",
    content_en: `Diabetes mellitus is a chronic metabolic disorder where the body has high blood sugar levels over a prolonged period. It occurs either when the pancreas does not produce enough insulin or when the body cannot effectively use the insulin it produces. There are three main types: Type 1, Type 2, and gestational diabetes. Type 1 is an autoimmune condition, usually diagnosed in children and young adults. Type 2 is the most common and is typically linked to lifestyle factors like poor diet, obesity, and inactivity. Gestational diabetes occurs during pregnancy and usually resolves after delivery but increases the risk of developing Type 2 diabetes later in life. Common symptoms include excessive thirst, frequent urination, fatigue, and blurry vision. Long-term complications can affect the heart, kidneys, eyes, and nerves. Managing diabetes requires regular monitoring of blood sugar levels, healthy eating, exercise, and in some cases, insulin therapy or oral medication. With proper management and lifestyle changes, people with diabetes can lead full and active lives.`,
    tags: ["diabetes", "chronic disease", "blood sugar", "health guide"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog2",
    title: "The Importance of Regular Health Check-ups",
    author: "Sarah Ahmed, RN",
    date: "November 15, 2023",
    image: "https://www.remedieslabs.com/blog/wp-content/uploads/2022/03/Why-are-regular-health-checkups-important-nowadays-1.jpg",
    content_en: `Health check-ups are not only for when you're sick—they are vital for detecting diseases early and keeping you on track with your wellness goals. A typical check-up may include a physical examination, blood pressure monitoring, blood tests, cholesterol screening, cancer screenings (such as mammograms or prostate exams), and consultations about your lifestyle. Early detection through these tests allows for early intervention, increasing the chances of successful treatment. For example, high blood pressure and diabetes may be present for years without symptoms and can cause serious damage if left unmanaged. Health professionals also use check-ups to evaluate mental health, nutritional status, and physical fitness. In Pakistan, where many people delay doctor visits until symptoms become severe, promoting preventive care is key. Establishing a routine for annual or biannual check-ups can lead to improved long-term health outcomes and reduced healthcare costs. Take ownership of your health before problems arise.`,
    tags: ["preventive care", "health check-up", "wellness", "cardiovascular health"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog3",
    title: "Mental Health Awareness: Breaking the Stigma",
    author: "Dr. Omar Farooq",
    date: "December 01, 2023",
    image: "https://www.abarcahealth.com/wp-content/uploads/2019/10/HH-Mental-Health-1.jpeg",
    content_en: `Mental health is just as important as physical health, yet stigma and misinformation continue to discourage people from seeking help. Common mental health conditions such as anxiety, depression, bipolar disorder, and schizophrenia affect millions of people worldwide—including in Pakistan. Unfortunately, due to cultural taboos, these conditions are often ignored or misunderstood. Stigma creates a harmful cycle where individuals fear judgment, avoid therapy, and suffer silently. It's time we normalize conversations about mental wellness. Mental illness is not a personal failure—it's a medical condition that deserves compassion and treatment. Whether through professional counseling, medication, peer support groups, or lifestyle changes, people can and do recover. Educating families and communities about the signs of mental illness, and encouraging early intervention, can save lives. Let's create a society where no one feels ashamed to say, 'I need help.' Support, empathy, and awareness can break the cycle of silence.`,
    tags: ["mental health", "awareness", "stigma", "well-being", "therapy"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog4",
    title: "Managing Hypertension Naturally",
    author: "Dr. Khalid Mehmood",
    date: "January 08, 2024",
    image: "https://lirp.cdn-website.com/69c0b277/dms3rep/multi/opt/Hypertension+-+Symptoms-+Causes-+Types-+Complications+-+Prevention-640w.jpg",
    content_en: `Hypertension, commonly known as high blood pressure, is a silent killer that affects millions of people globally. Often, it has no noticeable symptoms but can lead to heart disease, stroke, and kidney failure if left unchecked. While medication is sometimes necessary, many cases of hypertension can be managed through lifestyle changes. Reducing salt intake, quitting smoking, limiting alcohol, managing stress, and getting regular exercise are crucial steps. Incorporating potassium-rich foods like bananas, spinach, and sweet potatoes can help balance sodium levels. Meditation and yoga also reduce stress hormones and improve heart health. Monitoring blood pressure regularly is key, especially for people over 40 or those with a family history of the condition. Patients in Pakistan are encouraged to adopt these changes early, as hypertension is increasingly common in younger populations due to sedentary habits and fast food consumption. With commitment and support, you can control blood pressure without relying entirely on medication.`,
    tags: ["hypertension", "blood pressure", "natural remedies", "heart health"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog5",
    title: "How AI is Transforming Healthcare in Pakistan",
    author: "Zoya Rauf",
    date: "February 18, 2024",
    image: "https://iips.com.pk/wp-content/uploads/2023/09/RE-Guide-Blog-213.jpg",
    content_en: `Artificial Intelligence (AI) is revolutionizing healthcare by enhancing diagnostics, personalizing treatment, and streamlining hospital operations. In Pakistan, AI is helping bridge the gap between rural and urban healthcare access. Symptom checkers, virtual consultations, and smart scheduling systems are reducing wait times and improving early diagnosis. For example, AI can assist in reading X-rays or predicting the risk of chronic illness by analyzing patient history. Chatbots now help patients navigate symptoms, while machine learning models predict hospital resource needs and medication stock levels. AI-driven platforms also enable remote follow-ups for post-surgery patients, reducing the need for in-person visits. While challenges remain—such as data privacy and infrastructure—Pakistan’s digital health startups are making strong progress. AI is not here to replace doctors but to empower them to deliver better care efficiently. When paired with trained medical professionals, AI becomes a tool that enhances—not replaces—human care.`,
    tags: ["AI in healthcare", "technology", "Pakistan", "digital health"],
    summary_en: "",
    content_ur: ""
  },
  {
  id: "blog6",
  title: "Child Nutrition: What Every Parent Should Know",
  author: "Dr. Bushra Tariq",
  date: "March 11, 2024",
  image: "https://images.onlymyhealth.com//imported/images/2022/May/26_May_2022/mainnutrients.jpg",
  content_en: `Proper nutrition during childhood is essential for physical growth, brain development, and immune strength. During the first five years of life, children experience rapid physical and cognitive development. Diets rich in essential nutrients like calcium, iron, vitamin A, D, and protein play a vital role in supporting this growth. A balanced plate for children should include fruits, vegetables, whole grains, dairy, and lean proteins. Avoiding processed and sugary foods can prevent early-onset obesity and metabolic conditions like type 2 diabetes. Malnutrition—both under and overnutrition—is still a concern in Pakistan. Common deficiencies in children include iron-deficiency anemia and vitamin D deficiency, both of which impact energy and bone development. Parents must also consider hydration and sleep as key components of overall health. Schools and healthcare professionals must work together to create awareness about child nutrition. Regular health checkups and growth monitoring ensure early intervention if a child is not meeting developmental milestones. Healthy habits begin at home.`,
  tags: ["child nutrition", "parenting", "growth", "vitamins"],
  summary_en: "",
  content_ur: ""
},
{
  id: "blog7",
  title: "Covid-19 Vaccination: Myths vs Facts",
  author: "Dr. Faraz Anwar",
  date: "April 02, 2024",
  image: "https://www.rrh.org/media/vpics/Myths-vs-facts-hani-chaabo-MD.png",
  content_en: `Despite the global success of COVID-19 vaccination programs, misinformation and myths continue to spread, especially on social media platforms. Some people believe vaccines alter DNA, cause infertility, or contain microchips—none of which are supported by scientific evidence. Vaccines like Pfizer, Moderna, and Sinopharm have undergone extensive clinical trials and received emergency use authorization based on safety and efficacy. In Pakistan, increasing vaccine hesitancy was driven by conspiracy theories, especially in rural regions. It’s important to understand how vaccines work—they train your immune system to recognize and fight the virus without causing the disease. Mild side effects like fever or fatigue are common and show that the body is building protection. Vaccinated individuals are less likely to develop severe illness, require hospitalization, or die from COVID-19. Public health campaigns, religious leader endorsements, and transparency from healthcare professionals are essential to build trust. Getting vaccinated is not only a personal decision—it’s a social responsibility.`,
  tags: ["covid-19", "vaccination", "myths", "public health"],
  summary_en: "",
  content_ur: ""
},
{
  id: "blog8",
  title: "Understanding Women's Health: PCOS Explained",
  author: "Dr. Mehwish Ali",
  date: "May 20, 2024",
  image: "https://www.remedieslabs.com/blog/wp-content/uploads/2022/04/PCOS-in-women.jpg",
  content_en: `Polycystic Ovary Syndrome (PCOS) is a hormonal disorder that affects 1 in 10 women of reproductive age. It is characterized by irregular periods, excess androgen (male hormone) levels, and the presence of multiple cysts on the ovaries. Women with PCOS may experience weight gain, acne, thinning hair, and difficulty conceiving. While the exact cause is unknown, insulin resistance and genetic factors play a role. PCOS can also increase the risk of developing type 2 diabetes, high cholesterol, sleep apnea, and endometrial cancer. Management focuses on lifestyle changes such as a healthy diet, regular physical activity, and weight loss. Medications like metformin and birth control pills are often prescribed to regulate hormones. Early diagnosis is crucial to prevent complications and improve fertility outcomes. Awareness about PCOS remains low in Pakistan, where many women suffer in silence due to stigma or misinformation. If you're experiencing symptoms, consult a gynecologist for evaluation and treatment. PCOS is manageable with proper care.`,
  tags: ["PCOS", "women's health", "hormones", "reproductive health"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog9",
    title: "Understanding Depression: A Guide for Families",
    author: "Dr. Imran Zafar",
    date: "June 15, 2024",
    image: "https://www.mhinnovation.net/sites/default/files/styles/node_image_xs/public/content/node/Infographic%20on%20Depression_.png.jpeg?itok=6dzkdLFS",
    content_en: `Depression is more than just feeling sad—it’s a clinical condition that affects a person’s mood, thoughts, and daily functioning. Symptoms can include persistent sadness, loss of interest, changes in appetite or sleep, difficulty concentrating, and feelings of hopelessness. In severe cases, it can lead to suicidal thoughts or actions. For families, recognizing these signs is essential. Many people suffering from depression feel isolated and misunderstood, especially in cultures where mental illness is taboo. Offering non-judgmental support, listening, and encouraging professional help can make a huge difference. Depression is treatable through therapy, medication, or a combination of both. Family members should educate themselves about mental health and reduce the stigma by treating it like any other health condition. In Pakistan, access to mental health services remains limited, but awareness is growing. Support groups, online therapy platforms, and helplines are expanding. Early intervention and emotional support from loved ones can significantly aid recovery and prevent relapse.`,
    tags: ["depression", "mental health", "support", "family"],
    summary_en: "",
    content_ur: ""
  },
  {
    id: "blog10",
    title: "The Role of Telemedicine in Post-Surgery Follow-up",
    author: "Dr. Sania Rehman",
    date: "July 05, 2024",
    image: "https://ca-times.brightspotcdn.com/dims4/default/f3aaaf1/2147483647/strip/true/crop/2430x1366+0+0/resize/1200x675!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F22%2F0b%2F0163ea504a6591952cc53496a738%2Ftele-proc-lead.jpeg",
    tags: ["telemedicine", "follow-up", "surgery", "digital health"],
    summary_en: "",
    content_ur: ""
  }

];


// --- Medical Terms for Simplifier (Hardcoded for demonstration) ---
// In a real app, this could be fetched from a database or a more sophisticated AI model.
const MEDICAL_TERMS_GLOSSARY = {
  "mellitus": "a type of diabetes",
  "metabolic disease": "a disease that affects how your body processes food for energy",
  "blood glucose": "sugar in your blood",
  "insulin": "a hormone that helps your body use sugar for energy",
  "pancreas": "an organ that makes insulin",
  "gestational diabetes": "diabetes that develops during pregnancy",
  "hypertension": "high blood pressure",
  "cholesterol": "a waxy, fat-like substance found in your blood",
  "cardiovascular disease": "diseases that affect the heart and blood vessels",
  "prognosis": "the likely course of a disease or ailment",
  "bipolar disorder": "a mental health condition that causes extreme mood swings",
  "stigma": "a mark of disgrace associated with a particular circumstance, quality, or person.",
  "empathy": "the ability to understand and share the feelings of another.",
  "prevalent": "widespread in a particular area or at a particular time."
};


// Blog Card Component
const BlogCard = ({ blog, onReadMore, onListenSummary, isSummaryLoading, summaryError, onGenerateSummary }) => {
  const { toast } = useToast();
  const [currentSummary, setCurrentSummary] = useState(blog.summary_en);
  // const [isSummaryTranslated, setIsSummaryTranslated] = useState(false); // No longer needed for card summary translation

  useEffect(() => {
    setCurrentSummary(blog.summary_en); // Reset summary when blog prop changes
    // setIsSummaryTranslated(false); // No longer needed
  }, [blog]);

  const handleListenSummary = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Always English for summary on card
      window.speechSynthesis.speak(utterance);
      toast({
        title: "Playing Audio",
        description: "Listening to the summary...",
        duration: 2000,
      });
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  // Removed handleTranslateSummary as per user request for card level


  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/E0F2F7/0288D1?text=Blog+Image"; }} />
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{blog.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">By {blog.author} on {blog.date}</p>
        
        {/* AI Summary Section */}
        <div className="mb-4">
          {isSummaryLoading ? (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating summary...
            </div>
          ) : summaryError ? (
            <p className="text-red-500 text-sm">{summaryError}</p>
          ) : currentSummary ? (
            <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-2">
              {currentSummary}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-2">
              No summary available.
            </p>
          )}
          <div className="flex space-x-2 mt-2">
            {!currentSummary && ( // Only show generate button if no summary
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onGenerateSummary(blog.id, blog.content_en)} 
                disabled={isSummaryLoading}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
              >
                <Lightbulb className="w-4 h-4 mr-1" /> Generate Summary
              </Button>
            )}
            {currentSummary && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleListenSummary(currentSummary)}
                  className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-gray-700"
                >
                  <Headphones className="w-4 h-4 mr-1" /> Listen
                </Button>
                {/* Removed the summary translation button from here as per user request */}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
              {tag}
            </span>
          ))}
        </div>
        <Button onClick={() => onReadMore(blog)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200">
          Read Full Article
        </Button>
      </CardContent>
    </motion.div>
  );
};

// Blog Detail Modal Component
const BlogDetailModal = ({ blog, onClose, onTranslateFullContent, isTranslationLoading, translationError, currentLanguage, onListenFullContent, medicalTerms }) => {
  const { toast } = useToast();
  // Determine content to display based on currentLanguage state
  const contentToDisplay = currentLanguage === 'ur' ? blog.content_ur : blog.content_en;

  const handleListenFullContent = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech before starting new one
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'ur' ? 'ur-PK' : 'en-US'; // Set language based on current view
      window.speechSynthesis.speak(utterance);
      toast({
        title: "Playing Audio",
        description: "Listening to the full article...",
        duration: 2000,
      });
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  const handleStopListening = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      toast({
        title: "Audio Stopped",
        description: "Text-to-Speech playback has been stopped.",
        duration: 2000,
      });
    }
  };

  // Function to render content with medical term tooltips
  const renderContentWithSimplifier = (content) => {
    let processedContent = content;
    const sortedTerms = Object.keys(medicalTerms).sort((a, b) => b.length - a.length); // Sort by length to match longer terms first

    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi'); // Whole word, case-insensitive
      processedContent = processedContent.replace(regex, (match) => {
        const explanation = medicalTerms[term];
        // Using a span with data-tooltip attribute for simplicity, could be a custom tooltip component
        return `<span class="medical-term" title="${explanation}">${match}</span>`;
      });
    });
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}> {/* Added onClick for outside close */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x400/E0F2F7/0288D1?text=Blog+Image"; }} />
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{blog.title}</h2>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-4">By {blog.author} on {blog.date}</p>

        {/* AI Functionality Buttons for Full Content */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            onClick={() => handleListenFullContent(contentToDisplay)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            <Headphones className="w-4 h-4 mr-2" /> Listen
          </Button>
          <Button 
            onClick={handleStopListening}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            <Square className="w-4 h-4 mr-2" /> Stop
          </Button>
          <Button 
            onClick={() => onTranslateFullContent(blog.id, currentLanguage === 'en' ? 'ur' : 'en')}
            disabled={isTranslationLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isTranslationLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
            {currentLanguage === 'en' ? 'Translate to Urdu' : 'Show Original English'}
          </Button>
        </div>

        {isTranslationLoading && (
          <div className="flex items-center text-purple-600 dark:text-purple-400 mb-4">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Translating content...
          </div>
        )}
        {translationError && (
          <div className="text-center text-red-500 dark:text-red-400 py-4">
            <p>{translationError}</p>
          </div>
        )}

        {/* Blog Content with Medical Term Simplifier */}
        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-lg blog-content-area">
          {renderContentWithSimplifier(contentToDisplay)}
        </div>

        {/* Basic styling for medical terms - can be expanded with a proper tooltip component */}
        <style jsx>{`
          .medical-term {
            text-decoration: underline dotted;
            cursor: help;
            color: #1a73e8; /* A distinct color for highlighted terms */
            font-weight: 500;
          }
          .medical-term:hover {
            color: #0d47a1;
          }
          /* Added styles for better readability and spacing */
          .blog-content-area p {
            margin-bottom: 1.2em; /* More space between paragraphs */
            line-height: 1.8; /* Increased line height for readability */
          }
          .blog-content-area h1, .blog-content-area h2, .blog-content-area h3, .blog-content-area h4 {
            margin-top: 1.5em; /* Space before headings */
            margin-bottom: 0.8em; /* Space after headings */
          }
          .blog-content-area ul {
            margin-bottom: 1.2em; /* Space after lists */
          }
          /* Custom bullet point styling for lists within prose */
          .blog-content-area ul {
            list-style: none; /* Remove default bullet */
            padding-left: 0; /* Remove default padding */
          }
          .blog-content-area li {
            margin-bottom: 0.75em; /* Add spacing after each list item */
            position: relative;
            padding-left: 1.5em; /* Space for custom bullet */
          }
          .blog-content-area li::before {
            content: '•'; /* Default bullet, can be overridden by AI if it includes emojis */
            position: absolute;
            left: 0;
            color: #60A5FA; /* A nice blue color for the bullet */
            font-size: 1.2em;
            line-height: inherit; /* Inherit line height for vertical alignment */
          }
        `}</style>
      </motion.div>
    </div>
  );
};


const Blog = () => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredBlogPosts, setFilteredBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [visibleBlogCount, setVisibleBlogCount] = useState(6); // Show 6 blogs initially
  const [selectedBlog, setSelectedBlog] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal
  const [currentBlogLanguage, setCurrentBlogLanguage] = useState('en'); // 'en' or 'ur' for modal content
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  // State for AI Summary loading/error for each blog card
  const [summaryStatus, setSummaryStatus] = useState({}); // { blogId: { loading: bool, error: string } }

  const [currentUser, setCurrentUser] = useState(null); // State to hold the current user

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch blog posts (using mock data for now)
  useEffect(() => {
    setLoading(true);
    // In a real app, you would fetch from Firestore here:
    // const fetchBlogPosts = async () => {
    //   try {
    //     const querySnapshot = await getDocs(collection(db, 'blogPosts'));
    //     const fetchedPosts = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    //     setBlogPosts(fetchedPosts);
    //     setFilteredBlogPosts(fetchedPosts);
    //   } catch (err) {
    //     console.error("Error fetching blog posts:", err);
    //     setError("Failed to load blog posts. Please check your Firestore connection.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchBlogPosts();

    // Using mock data for demonstration
    setBlogPosts(MOCK_BLOG_POSTS.map(blog => ({...blog}))); // Create a deep copy to allow modifications
    setFilteredBlogPosts(MOCK_BLOG_POSTS.map(blog => ({...blog})));
    setLoading(false);
  }, []);

  // Filter blogs based on search term and selected tags
  useEffect(() => {
    let results = blogPosts;

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      results = results.filter(blog =>
        blog.title.toLowerCase().includes(lowercasedSearchTerm) ||
        blog.author.toLowerCase().includes(lowcasedSearchTerm) ||
        blog.content_en.toLowerCase().includes(lowcasedSearchTerm) ||
        blog.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm))
      );
    }

    if (selectedTags.length > 0) {
      results = results.filter(blog =>
        selectedTags.every(tag => blog.tags.includes(tag))
      );
    }
    
    setFilteredBlogPosts(results);
    setVisibleBlogCount(6); // Reset visible count on filter change
  }, [searchTerm, selectedTags, blogPosts]);


  const handleLoadMore = () => {
    setVisibleBlogCount(prevCount => prevCount + 6);
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  const handleReadMore = (blog) => {
    setSelectedBlog(blog);
    setCurrentBlogLanguage('en'); // Reset language to English when opening modal
    setIsModalOpen(true);
    // Log activity when "Read Full Article" is clicked
    // Corrected logActivity call: type, description, details
    logActivity('blog_read', `Read Blog Article by ${blog.author}`, { blogId: blog.id, blogTitle: blog.title, author: blog.author });
  };

  const handleCloseModal = () => {
    setSelectedBlog(null);
    setIsModalOpen(false);
    setCurrentBlogLanguage('en'); // Reset language on close
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  };

  const handleTranslateFullContent = async (blogId, targetLang) => {
    if (!selectedBlog) return;

    setIsTranslationLoading(true);
    setTranslationError(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // If targetLang is 'ur' and we don't have Urdu content, translate from English
    // If targetLang is 'en' and we have Urdu content, translate from Urdu
    const contentToTranslate = targetLang === 'ur' 
      ? selectedBlog.content_en 
      : selectedBlog.content_ur; // If switching back to English, use the Urdu content if it exists

    const prompt = `Translate the following medical blog content into ${targetLang === 'ur' ? 'natural-sounding Urdu' : 'natural-sounding English'}. Maintain medical accuracy and context. Do NOT include any conversational phrases like "Here's a translation" or "Original Content:". Provide only the translated text. \n\nContent:\n"${contentToTranslate}"`;

    try {
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "text/plain",
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const translatedText = result.candidates[0].content.parts[0].text;
        
        // Update the selected blog's content_ur or content_en based on targetLang
        setSelectedBlog(prevBlog => {
          const updatedBlog = { ...prevBlog };
          if (targetLang === 'ur') {
            updatedBlog.content_ur = translatedText;
          } else {
            // When translating back to English, we update content_en
            updatedBlog.content_en = translatedText;
          }
          return updatedBlog;
        });
        setCurrentBlogLanguage(targetLang); // Set the current language to the target language
        toast({
          title: "Translation Complete",
          description: `Content translated to ${targetLang === 'ur' ? 'Urdu' : 'English'}.`,
          duration: 2000,
        });
      } else {
        setTranslationError("Could not translate content. Please try again.");
        toast({
          title: "Translation Failed",
          description: "AI could not provide translation.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error translating full content:", error);
      setTranslationError("An error occurred during translation. Please check your network or API key.");
      toast({
        title: "Translation Error",
        description: "An error occurred during translation.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTranslationLoading(false);
    }
  };

  const handleGenerateSummary = async (blogId, content) => {
    setSummaryStatus(prev => ({ ...prev, [blogId]: { loading: true, error: null } }));

    try {
      const prompt = `Summarize the following medical blog post in 2-3 concise lines. Focus on the main takeaways. \n\nContent:\n"${content}"`;
      const payload = { 
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "text/plain",
          }
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const summary = result.candidates[0].content.parts[0].text;
        setBlogPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === blogId ? { ...post, summary_en: summary } : post
          )
        );
        setSummaryStatus(prev => ({ ...prev, [blogId]: { loading: false, error: null } }));
        toast({
          title: "Summary Generated",
          description: "AI summary created successfully.",
          duration: 2000,
        });
      } else {
        setSummaryStatus(prev => ({ ...prev, [blogId]: { loading: false, error: "Failed to generate summary." } }));
        toast({
          title: "Summary Generation Failed",
          description: "AI could not generate summary.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryStatus(prev => ({ ...prev, [blogId]: { loading: false, error: "Network error or API issue." } }));
      toast({
        title: "Summary Generation Error",
        description: "An error occurred during summary generation.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };


  const allTags = [...new Set(MOCK_BLOG_POSTS.flatMap(blog => blog.tags))];

  return (
    <>
      <Helmet>
        <title>Medical Blog - HealthPlat</title>
        <meta name="description" content="Read health articles in English and Urdu on the HealthPlat blog with AI tools." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">HealthPlat Medical Blog</h1>

        {/* Search and Filter Section */}
        <div className="p-6 shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Filter Articles</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              className="flex-grow p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 shadow-md"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">Tags:</span>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full ${selectedTags.includes(tag) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700'}`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center py-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading blog posts...</p>
            </div>
          )}
          {error && (
            <div className="col-span-full text-center py-10 text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && filteredBlogPosts.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-600 dark:text-gray-400">
              <p>No blog posts found matching your criteria.</p>
            </div>
          )}

          {!loading && !error && filteredBlogPosts.slice(0, visibleBlogCount).map(blog => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              onReadMore={handleReadMore} 
              onListenSummary={() => { /* Handled internally by BlogCard */ }}
              // onTranslateSummary={() => { /* No longer passed to BlogCard */ }}
              isSummaryLoading={summaryStatus[blog.id]?.loading || false}
              summaryError={summaryStatus[blog.id]?.error || null}
              onGenerateSummary={handleGenerateSummary}
            />
          ))}
        </div>

        {/* Load More Button */}
        {!loading && !error && filteredBlogPosts.length > visibleBlogCount && (
          <div className="text-center py-6">
            <Button
              onClick={handleLoadMore}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors duration-200 shadow-md"
            >
              Load More Articles
            </Button>
          </div>
        )}

        {!loading && !error && filteredBlogPosts.length > 0 && filteredBlogPosts.length <= visibleBlogCount && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-6">
            <p>All {filteredBlogPosts.length} articles displayed.</p>
          </div>
        )}
      </motion.div>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBlog && (
          <BlogDetailModal
            blog={selectedBlog}
            onClose={handleCloseModal}
            onTranslateFullContent={handleTranslateFullContent}
            isTranslationLoading={isTranslationLoading}
            translationError={translationError}
            currentLanguage={currentBlogLanguage}
            onListenFullContent={() => { /* Handled internally by BlogDetailModal */ }}
            medicalTerms={MEDICAL_TERMS_GLOSSARY} // Pass the glossary
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Blog;
