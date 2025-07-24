
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Heart, 
  Shield, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const DashboardHome = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Calendar, label: 'Appointments', value: '12', change: '+2 this week', color: 'bg-blue-500' },
    { icon: Users, label: 'Doctors', value: '8', change: 'Available now', color: 'bg-green-500' },
    { icon: Activity, label: 'Health Score', value: '85%', change: '+5% this month', color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'Consultations', value: '24', change: '+12% growth', color: 'bg-orange-500' },
  ];

  const quickActions = [
    { icon: Calendar, title: 'Book Appointment', desc: 'Schedule with top doctors', path: '/book-doctor', color: 'bg-blue-50 text-blue-600' },
    { icon: Users, title: 'Online Consultation', desc: 'Video call with specialists', path: '/consultations', color: 'bg-green-50 text-green-600' },
    { icon: Activity, title: 'Lab Tests', desc: 'Book tests & get reports', path: '/lab-tests', color: 'bg-purple-50 text-purple-600' },
    { icon: Heart, title: 'AI Health Tools', desc: 'Smart health analysis', path: '/ai-tools', color: 'bg-red-50 text-red-600' },
  ];

  const recentActivity = [
    { type: 'appointment', title: 'Appointment with Dr. Sarah', time: '2 hours ago', status: 'completed' },
    { type: 'test', title: 'Blood Test Results Available', time: '1 day ago', status: 'new' },
    { type: 'consultation', title: 'Video Call - Dr. Ahmed', time: '3 days ago', status: 'completed' },
    { type: 'medicine', title: 'Medicine Delivered', time: '5 days ago', status: 'delivered' },
  ];

  const upcomingAppointments = [
    { doctor: 'Dr. Maria Khan', specialty: 'Cardiologist', time: 'Today, 3:00 PM', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face' },
    { doctor: 'Dr. Ahmed Ali', specialty: 'Dermatologist', time: 'Tomorrow, 10:00 AM', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face' },
    { doctor: 'Dr. Fatima Shah', specialty: 'Pediatrician', time: 'Friday, 2:00 PM', avatar: 'https://images.unsplash.com/photo-1594824475317-d0b8e4b5b8b8?w=50&h=50&fit=crop&crop=face' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Healthcare Platform</title>
        <meta name="description" content="Your personal healthcare dashboard. View appointments, health stats, and access medical services all in one place." />
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. Sarah!</h1>
            <p className="text-blue-100 mb-6">Here's what's happening with your health today</p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/book-doctor')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button 
                onClick={() => navigate('/ai-tools')}
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Try AI Tools
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/book-doctor')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={appointment.avatar}
                    alt={appointment.doctor}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{appointment.doctor}</h3>
                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">4.9</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toast({ description: "🚧 Activity history isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'new' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      activity.status === 'completed' ? 'text-green-600' :
                      activity.status === 'new' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{activity.title}</h3>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Health Tip</h3>
              <p className="text-gray-700 mb-4">
                Stay hydrated! Drinking 8-10 glasses of water daily helps maintain optimal body function and supports your immune system.
              </p>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/blog')}
              >
                Read More Tips
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
