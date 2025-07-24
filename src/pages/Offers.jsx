
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Percent, Gift, Star, Calendar, TestTube, Pill, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const Offers = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Offers', icon: Gift },
    { id: 'lab', name: 'Lab Tests', icon: TestTube },
    { id: 'medicine', name: 'Medicines', icon: Pill },
    { id: 'consultation', name: 'Consultations', icon: Video },
  ];

  const offers = [
    {
      id: 1,
      title: 'Complete Health Checkup Package',
      description: 'Full body checkup including CBC, Lipid Profile, Liver Function, and more',
      category: 'lab',
      originalPrice: 8500,
      discountedPrice: 4999,
      discount: 41,
      validUntil: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop',
      features: ['25+ Tests Included', 'Home Sample Collection', 'Digital Reports', 'Doctor Consultation'],
      rating: 4.8,
      reviews: 1250,
      popular: true,
      code: 'HEALTH50'
    },
    {
      id: 2,
      title: 'Free Medicine Delivery',
      description: 'Get free home delivery on medicine orders above Rs. 1000',
      category: 'medicine',
      originalPrice: 200,
      discountedPrice: 0,
      discount: 100,
      validUntil: '2024-01-31',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop',
      features: ['Free Delivery', 'Genuine Medicines', 'Prescription Verification', '24/7 Support'],
      rating: 4.6,
      reviews: 890,
      popular: false,
      code: 'FREEDEL'
    },
    {
      id: 3,
      title: 'Online Consultation Discount',
      description: '30% off on video consultations with specialist doctors',
      category: 'consultation',
      originalPrice: 2000,
      discountedPrice: 1400,
      discount: 30,
      validUntil: '2024-02-28',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
      features: ['Video Consultation', 'Prescription Included', 'Follow-up Support', 'Instant Booking'],
      rating: 4.9,
      reviews: 2100,
      popular: true,
      code: 'CONSULT30'
    },
    {
      id: 4,
      title: 'Diabetes Care Package',
      description: 'Special package for diabetes monitoring and management',
      category: 'lab',
      originalPrice: 3500,
      discountedPrice: 2450,
      discount: 30,
      validUntil: '2024-02-10',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop',
      features: ['HbA1c Test', 'Glucose Monitoring', 'Diet Plan', 'Doctor Consultation'],
      rating: 4.7,
      reviews: 650,
      popular: false,
      code: 'DIABETES30'
    },
    {
      id: 5,
      title: 'Heart Health Screening',
      description: 'Comprehensive cardiac health assessment at discounted rates',
      category: 'lab',
      originalPrice: 6000,
      discountedPrice: 3600,
      discount: 40,
      validUntil: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=200&fit=crop',
      features: ['ECG', 'Lipid Profile', 'Cardiac Enzymes', 'Cardiologist Consultation'],
      rating: 4.8,
      reviews: 980,
      popular: true,
      code: 'HEART40'
    },
    {
      id: 6,
      title: 'Women\'s Health Package',
      description: 'Specialized health screening package designed for women',
      category: 'lab',
      originalPrice: 4500,
      discountedPrice: 2700,
      discount: 40,
      validUntil: '2024-02-25',
      image: 'https://images.unsplash.com/photo-1594824475317-d0b8e4b5b8b8?w=300&h=200&fit=crop',
      features: ['Pap Smear', 'Mammography', 'Bone Density', 'Gynecologist Consultation'],
      rating: 4.9,
      reviews: 1100,
      popular: false,
      code: 'WOMEN40'
    }
  ];

  const filteredOffers = offers.filter(offer => 
    selectedCategory === 'all' || offer.category === selectedCategory
  );

  const popularOffers = offers.filter(offer => offer.popular);

  const handleClaimOffer = (offer) => {
    toast({
      title: "Offer Claimed!",
      description: `Use code ${offer.code} to avail this discount.`,
    });
  };

  const getDaysLeft = (validUntil) => {
    const today = new Date();
    const endDate = new Date(validUntil);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Helmet>
        <title>Offers & Discounts - Healthcare Platform</title>
        <meta name="description" content="Discover exclusive healthcare offers and discounts. Save on lab tests, medicines, consultations, and health packages." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Exclusive Offers & Discounts</h1>
                <p className="text-purple-100">Save big on healthcare services with our limited-time offers</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Percent className="w-4 h-4 mr-1" />
                <span>Up to 50% OFF</span>
              </div>
              <div className="flex items-center">
                <Gift className="w-4 h-4 mr-1" />
                <span>Limited Time Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border transition-all text-center ${
                  selectedCategory === category.id
                    ? 'border-purple-500 bg-purple-50 text-purple-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <category.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{category.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Popular Offers */}
        {selectedCategory === 'all' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🔥 Popular Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {offer.discount}% OFF
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">Rs. {offer.discountedPrice}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">Rs. {offer.originalPrice}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{offer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {getDaysLeft(offer.validUntil)} days left
                      </div>
                      <span className="font-medium">Code: {offer.code}</span>
                    </div>
                    
                    <Button
                      onClick={() => handleClaimOffer(offer)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Claim Offer
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Offers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Offers' : `${categories.find(c => c.id === selectedCategory)?.name} Offers`}
            </h2>
            <span className="text-sm text-gray-500">{filteredOffers.length} offers available</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  <div className="relative w-1/3">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {offer.discount}% OFF
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{offer.title}</h3>
                      {offer.popular && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {offer.features.slice(0, 4).map(feature => (
                        <div key={feature} className="flex items-center text-xs text-gray-600">
                          <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-gray-900">Rs. {offer.discountedPrice}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">Rs. {offer.originalPrice}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{offer.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({offer.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {offer.code}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleClaimOffer(offer)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      Claim Offer
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How to Use Offers */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Use Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Offer</h3>
              <p className="text-sm text-gray-600">Browse and select the offer that suits your needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Apply Code</h3>
              <p className="text-sm text-gray-600">Use the provided code during checkout</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">Enjoy discounted healthcare services</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Offers are valid for limited time only and subject to availability</li>
            <li>• Discount codes cannot be combined with other offers</li>
            <li>• Some offers may have minimum order requirements</li>
            <li>• Healthcare platform reserves the right to modify or cancel offers</li>
            <li>• Offers are applicable for new and existing customers</li>
            <li>• Please read individual offer terms before claiming</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Offers;
