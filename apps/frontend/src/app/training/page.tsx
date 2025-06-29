"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/cotrain/ui/card";
import { Button } from "@/components/cotrain/ui/button";
import { 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  Activity,
  Zap,
  Brain,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function Training() {
  const router = useRouter();

  const quickActions = [
    {
      title: "Create Session",
      description: "Start a new AI training session with custom parameters",
      icon: Plus,
      href: "/training/create",
      color: "bg-blue-500",
    },
    {
      title: "Browse Sessions", 
      description: "Discover and join existing training sessions",
      icon: Calendar,
      href: "/training/sessions",
      color: "bg-green-500",
    },
    {
      title: "My Rewards",
      description: "Check and claim your earned training rewards",
      icon: Trophy,
      href: "/rewards",
      color: "bg-yellow-500",
    },
  ];

  const stats = [
    { label: "Active Sessions", value: "12", icon: Activity, color: "text-blue-600" },
    { label: "Total Participants", value: "156", icon: Users, color: "text-green-600" },
    { label: "Rewards Distributed", value: "2.4K APT", icon: Trophy, color: "text-yellow-600" },
    { label: "Models Trained", value: "48", icon: Brain, color: "text-purple-600" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Training Platform</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participate in decentralized AI model training and earn rewards for your contributions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action) => (
            <Card 
              key={action.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(action.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${action.color} p-2 rounded-lg text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>
                <Button variant="outline" className="w-full">
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
            <CardDescription>
              Real-time metrics from our training ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Connect Your Wallet</div>
                    <div className="text-sm text-muted-foreground">
                      Connect your Aptos wallet to participate in training sessions
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Join Training Sessions</div>
                    <div className="text-sm text-muted-foreground">
                      Browse available sessions and contribute your computational resources
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Earn Rewards</div>
                    <div className="text-sm text-muted-foreground">
                      Get rewarded with APT tokens based on your contribution quality
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Training Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Natural Language Processing</div>
                  <div className="text-sm text-muted-foreground">
                    Train advanced language models for text understanding and generation
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Computer Vision</div>
                  <div className="text-sm text-muted-foreground">
                    Contribute to image recognition and object detection models
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Reinforcement Learning</div>
                  <div className="text-sm text-muted-foreground">
                    Help train AI agents for decision-making and optimization
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}