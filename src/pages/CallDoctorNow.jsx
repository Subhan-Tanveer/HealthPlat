import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const CallDoctorNow = () => {
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
        <title>Call a Doctor Now - HealthPlat</title>
        <meta name="description" content="Instantly connect with a doctor for an emergency audio call on HealthPlat." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">Call a Doctor Now</h1>
        <Card>
          <CardHeader>
            <CardTitle>Emergency Call</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A mock UI for an emergency audio call will be available here.</p>
            <Button onClick={showNotImplementedToast} className="mt-4" variant="destructive">Initiate Emergency Call</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default CallDoctorNow;