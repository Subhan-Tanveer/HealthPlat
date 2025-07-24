import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const OnlineConsultations = () => {
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
        <title>Online Consultations - HealthPlat</title>
        <meta name="description" content="Consult with doctors online via chat, audio, or video calls on HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">Online Consultations</h1>
        <Card>
          <CardHeader>
            <CardTitle>Start a Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Here you will be able to start chat, audio, or video calls with doctors.</p>
            <Button onClick={showNotImplementedToast} className="mt-4">Start Video Call</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default OnlineConsultations;