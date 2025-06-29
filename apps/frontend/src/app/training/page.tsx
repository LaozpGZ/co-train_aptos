"use client";

import { TrainingPage } from "@/components/cotrain/pages/training-page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { generateTrainingOptions } from "@/data/mock-data";
import { Notification } from "@/types/cotrain";

export default function Training() {
  const router = useRouter();
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("available");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const trainingOptions = generateTrainingOptions();

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleTrainingSelect = (option: any) => {
    console.log("Training option selected:", option);
    // Handle training selection logic here
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  return (
    <TrainingPage
      trainingOptions={trainingOptions}
      onNavigate={handleNavigate}
      onTrainingSelect={handleTrainingSelect}
      showContributeModal={showContributeModal}
      setShowContributeModal={setShowContributeModal}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      addNotification={addNotification}
    />
  );
}