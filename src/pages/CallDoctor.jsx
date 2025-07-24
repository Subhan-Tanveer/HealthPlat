
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, Star, AlertCircle, CheckCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const CallDoctor = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [callType, setCallType] = useState('emergency');

  const emergencyDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Ahmed',
      specialty: 'Emergency Medicine',
      rating: 4.9,
      reviews: 156,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      status: 'available',
      responseTime: '< 2 minutes',
      fee: 1500,
      languages: ['English', 'Urdu']
    },
    {
      id: 2,
      name: 'Dr. Ahmed Khan',
      specialty: 'General Physician',
      rating: 4.8,
      reviews: 203,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      status: 'available',
      responseTime: '< 3 minutes',
      fee: 1200,
      languages: ['English', 'Urdu']
    },
    {
      id: 3,
      name: 'Dr. Fatima Shah',
      specialty: 'Pediatrician',
      rating: 4.7,
      reviews: 89,
      avatar: 'https://images.unsplash.com/photo-1594824475317-d0b8e4b5b8b8?w=150&h=150&fit=crop&crop=face',
      status: 'busy',
      responseTime: '< 5 minutes',
      fee: 1300,
      languages: ['English', 'Urdu']
    }
  ];

  const callTypes = [
    {
      id: 'emergency',
      name: 'Emergency Call',
      description: 'Urgent medical consultation',
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      priority: 'High Priority'
    },
    {
      id: 'consultation',
      name: 'General Consultation',
      description: 'Regular medical advice',
      icon: Phone,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      priority: 'Normal Priority'
    }
  ];

  const recentCalls = [
    {
      id: 1,
      doctor: 'Dr. Sarah Ahmed',
      date: '2024-01-15',
      time: '14:30',
      duration: '12 minutes',
      type: 'Emergency',
      status: 'completed',
      fee: 1500
    },
    {
      id: 2,
      doctor: 'Dr. Ahmed Khan',
      date: '2024-01-10',
      time: '10:15',
      duration: '8 minutes',
      type: 'Consultation',
      status: 'completed',
      fee: 1200
    }
  ];

  const handleCallDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    toast({
      title: "Initiating Call",
      description: `Connecting you with ${doctor.name}...`,
    });
  };

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call Initiated",
      description: "Connecting you to the nearest available emergency doctor...",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Helmet>
        <title>Call Doctor Now - Healthcare Platform</title>
        <meta name="description" content="Get instant medical consultation through emergency calls. Connect with qualified doctors for urgent healthcare needs." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Doctor Now</h1>
          <p className="text-gray-600">Get instant medical consultation through audio calls</p>
        </div>

        {/* Emergency Call Button */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Medical Emergency?</h2>
                <p className="text-red-100 mb-4">Connect instantly with emergency doctors</p>
                <Button
                  onClick={handleEmergencyCall}
                  className="bg-white text-red-600 hover:bg-red-50 font-semibold"
                >
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Emergency Call Now
                </Button>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-4">
                  <AlertCircle className="w-12 h-12 mb-2 pulse-animation" />
                  <p className="text-sm font-medium">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Call Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {callTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCallType(type.id)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  callType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.name}</h3>
                    <p className="text-gray-600 mb-2">{type.description}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      type.id === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {type.priority}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Available Doctors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Doctors</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emergencyDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      doctor.status === 'available' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                          <span className="text-sm text-gray-500 ml-1">({doctor.reviews})</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">Rs. {doctor.fee}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doctor.status)}`}>
                          {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Response: {doctor.responseTime}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {doctor.languages.map(lang => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({ description: "🚧 Doctor profile isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleCallDoctor(doctor)}
                        disabled={doctor.status !== 'available'}
                        className={`${
                          doctor.status === 'available'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Calls</h2>
          {recentCalls.length > 0 ? (
            <div className="space-y-4">
              {recentCalls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{call.doctor}</h3>
                      <p className="text-sm text-gray-600">{call.date} at {call.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{call.duration}</p>
                      <p className="text-xs text-gray-600">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Rs. {call.fee}</p>
                      <p className="text-xs text-gray-600">Fee</p>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {call.status}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({ description: "🚧 Call again functionality isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}
                    >
                      Call Again
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent calls</h3>
              <p className="text-gray-600">Your call history will appear here</p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How Emergency Calls Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Connection</h3>
              <p className="text-sm text-gray-600">Click call and get connected within 2 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Medical Consultation</h3>
              <p className="text-sm text-gray-600">Discuss symptoms and get professional advice</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Follow-up Care</h3>
              <p className="text-sm text-gray-600">Receive prescription and follow-up instructions</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallDoctor;
