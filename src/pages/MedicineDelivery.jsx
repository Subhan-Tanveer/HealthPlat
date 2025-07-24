import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const MedicineDelivery = () => {
  const { toast } = useToast();

  const showNotImplementedToast = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Medicine Delivery - HealthPlat</title>
        <meta name="description" content="Get medicines delivered to your doorstep with HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">Medicine Delivery</h1>
        <Card>
          <CardHeader>
            <CardTitle>Order Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is where you'll upload prescriptions, fill out a delivery form, and track your order.</p>
            <Button onClick={showNotImplementedToast} className="mt-4">Upload Prescription</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default MedicineDelivery;