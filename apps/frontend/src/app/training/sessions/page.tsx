'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cotrain/ui/card';
import { Button } from '@/components/cotrain/ui/button';
import { Badge } from '@/components/cotrain/ui/badge';
import { Input } from '@/components/cotrain/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cotrain/ui/select';
import { Alert, AlertDescription } from '@/components/cotrain/ui/alert';
import { useToast } from '@/components/cotrain/ui/use-toast';
import { useAptosContract } from '@/hooks/useAptosContract';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Trophy, 
  AlertCircle, 
  Loader2,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  duration: number;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  creator: string;
  participants: string[];
}

type SessionStatus = 'all' | 'active' | 'completed' | 'pending';

// Mock data for demonstration (replace with real data from contract)
const mockSessions: SessionDetails[] = [
  {
    id: '0x1234567890abcdef',
    name: 'Advanced NLP Model Training',
    description: 'Train a state-of-the-art natural language processing model with distributed computing.',
    rewardAmount: 500,
    maxParticipants: 20,
    currentParticipants: 15,
    duration: 7200,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000),
    creator: '0xabcdef1234567890',
    participants: [],
  },
  {
    id: '0xfedcba0987654321',
    name: 'Computer Vision Dataset Training',
    description: 'Collaborative training on a large-scale computer vision dataset for object detection.',
    rewardAmount: 300,
    maxParticipants: 15,
    currentParticipants: 12,
    duration: 3600,
    status: 'active',
    createdAt: new Date(Date.now() - 43200000),
    creator: '0x1234567890abcdef',
    participants: [],
  },
  {
    id: '0x1111222233334444',
    name: 'Reinforcement Learning Challenge',
    description: 'Train RL agents to solve complex decision-making problems.',
    rewardAmount: 800,
    maxParticipants: 10,
    currentParticipants: 10,
    duration: 14400,
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000),
    completedAt: new Date(Date.now() - 86400000),
    creator: '0x9876543210fedcba',
    participants: [],
  },
];

export default function TrainingSessions() {
  const router = useRouter();
  const { toast } = useToast();
  const { connected, account, isLoading: contractLoading } = useAptosContract();

  const [sessions, setSessions] = useState<SessionDetails[]>(mockSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('all');

  // Filter sessions based on search and status
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'completed':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      default:
        return '';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatReward = (amount: number): string => {
    return `${(amount / 100000000).toFixed(2)} APT`; // Convert octas to APT
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/training/sessions/${sessionId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Training Sessions</h1>
          <p className="text-muted-foreground">
            Discover and participate in AI training sessions
          </p>
        </div>
        <Button onClick={() => router.push('/training/create')} disabled={!connected}>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      {/* Wallet Connection Status */}
      {!connected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your wallet to create sessions and participate in training.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SessionStatus)}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sessions...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 
                'No sessions match your criteria.' : 
                'No training sessions available yet.'
              }
            </div>
            {connected && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/training/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Session
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor(session.status)}`}
              onClick={() => handleSessionClick(session.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{session.name}</CardTitle>
                  {getStatusBadge(session.status)}
                </div>
                <CardDescription className="line-clamp-3">
                  {session.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Reward and Participants */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{formatReward(session.rewardAmount)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{session.currentParticipants}/{session.maxParticipants}</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatDuration(session.duration)}</span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {session.createdAt.toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      variant={session.status === 'active' ? 'default' : 'outline'} 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session.id);
                      }}
                    >
                      {session.status === 'active' ? 'Join Session' : 'View Details'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.reduce((acc, s) => acc + s.currentParticipants, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.reduce((acc, s) => acc + s.rewardAmount, 0) / 100000000} APT
            </div>
            <div className="text-sm text-muted-foreground">Total Rewards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}