// src/components/TherapistDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AnalyticsScreen } from './AnalyticsScreen';
import { getHourlyMoodBreakdown } from '../utils/moodAnalytics';
import { extractBuzzWords } from '../utils/sentimentAnalysis';

interface ConnectionRequest {
  id: string;
  userId: string;
  userName: string;
  therapistId: string;
  therapistName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  userNote: string;
  userMoodSummary: string;
}

interface TherapistDashboardProps {
  onBack: () => void;
  currentTherapistId?: string;
}

// Mock user data for analytics demonstration
const getMockUserData = (userId: string) => {
  return {
    journalEntries: [
      {
        id: '1',
        content: 'Feeling anxious about work presentation tomorrow. Keep overthinking what could go wrong and imagining worst case scenarios. Deadline is tomorrow.',
        date: new Date('2024-01-15T09:00:00'),
        mood: 'anxious',
        aiAnalysis: 'User expressing work-related anxiety.',
        confidence: 0.85,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '2', 
        content: 'Had a good day today. Managed to complete all my tasks at work. The team was supportive and the deadline was met.',
        date: new Date('2024-01-16T10:00:00'),
        mood: 'happy',
        aiAnalysis: 'Positive mood with sense of accomplishment.',
        confidence: 0.92,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '3',
        content: 'Meeting went better than expected. Still feeling stressed about upcoming deadlines though. Need to find better work-life balance.',
        date: new Date('2024-01-17T14:30:00'),
        mood: 'content',
        aiAnalysis: 'Mixed emotions.',
        confidence: 0.78,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '4',
        content: 'Tried meditation today for 10 minutes. It was harder than I thought but I felt calmer afterwards.',
        date: new Date('2024-01-18T20:00:00'),
        mood: 'calm',
        aiAnalysis: 'User experimenting with mindfulness.',
        confidence: 0.88,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '5',
        content: 'Had an argument with my partner about money. Feeling frustrated and misunderstood.',
        date: new Date('2024-01-19T18:15:00'),
        mood: 'frustrated',
        aiAnalysis: 'Relationship conflict.',
        confidence: 0.81,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '6',
        content: 'Late night thoughts keeping me awake. Feeling a bit lonely.',
        date: new Date('2024-01-19T23:30:00'),
        mood: 'sad',
        aiAnalysis: 'Late night insomnia patterns.',
        confidence: 0.75,
        sarcastic: false,
        fineEmotions: []
      },
      {
        id: '7',
        content: 'Morning workout made me feel so energetic! Ready to tackle the day.',
        date: new Date('2024-01-20T07:15:00'),
        mood: 'energetic',
        aiAnalysis: 'Positive impact of exercise.',
        confidence: 0.95,
        sarcastic: false,
        fineEmotions: []
      }
    ]
  };
};

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  onBack,
  currentTherapistId = 'th1'
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'clients'>('requests');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<'insights' | 'preview'>('insights');

  // Load requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindpal-therapist-requests');
    if (saved) {
      const parsedRequests = JSON.parse(saved).map((req: any) => ({
        ...req,
        timestamp: new Date(req.timestamp)
      }));
      setRequests(parsedRequests);
    }
  }, []);

  // Save requests to localStorage
  useEffect(() => {
    localStorage.setItem('mindpal-therapist-requests', JSON.stringify(requests));
  }, [requests]);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      )
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleViewAnalytics = (userId: string) => {
    setSelectedUserId(userId);
    setShowAnalytics(true);
    setAnalyticsView('insights'); // Default to insights
  };

  const getTherapistRequests = () => {
    return requests.filter(req => req.therapistId === currentTherapistId);
  };

  const getPendingRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'pending');
  };

  const getAcceptedRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'accepted');
  };

  const getRejectedRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'rejected');
  };

  if (showAnalytics && selectedUserId) {
    const userData = getMockUserData(selectedUserId);
    
    // Calculate new insights
    const hourlyReport = getHourlyMoodBreakdown(userData.journalEntries as any[]);
    const buzzWords = extractBuzzWords(userData.journalEntries.map(e => e.content));

    const downloadHourlyReport = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Hour,Count,Dominant Mood\n"
        + hourlyReport.map(h => `${h.hour}:00,${h.count},${h.dominantMood}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hourly_mood_report_${selectedUserId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="bg-slate-50 min-h-screen">
        {/* Sticky Header with Actions */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
           <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => setShowAnalytics(false)} 
                variant="ghost" 
                size="sm"
                className="rounded-full hover:bg-gray-100"
              >
                ← Back
              </Button>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg mx-2">
                <button
                    onClick={() => setAnalyticsView('insights')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${analyticsView === 'insights' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📊 Insights
                </button>
                <button
                    onClick={() => setAnalyticsView('preview')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${analyticsView === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📱 Client View
                </button>
              </div>
           </div>
           
           {analyticsView === 'insights' && (
             <Button 
               onClick={downloadHourlyReport} 
               variant="outline"
               size="sm"
               className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
             >
                📥 Download Report
             </Button>
           )}
        </div>

        {/* MODE 1: THERAPIST INSIGHTS */}
        {analyticsView === 'insights' && (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-6 space-y-6 mt-8 mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👨‍⚕️</span>
                <h2 className="text-2xl font-bold text-gray-800">Therapist Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buzz Words Section */}
                <Card className="p-6 bg-white shadow-sm border border-indigo-100 h-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span>🗣️</span> Recurring Themes
                  </h3>
                  <div className="flex flex-wrap gap-2 content-start">
                    {buzzWords.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-default">
                        {item.word} <span className="ml-1 opacity-60 font-mono">x{item.count}</span>
                      </Badge>
                    ))}
                    {buzzWords.length === 0 && <p className="text-gray-400 text-sm">Not enough data for keywords.</p>}
                  </div>
                </Card>

                {/* Hourly Activity Report */}
                <Card className="p-6 bg-white shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span>⏰</span> Activity & Mood by Hour
                  </h3>
                  
                  <div className="h-40 flex items-end space-x-1 overflow-x-auto pb-2">
                    {hourlyReport.map((hourData) => (
                      <div key={hourData.hour} className="flex flex-col items-center group relative min-w-[12px] flex-1">
                         {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] p-1.5 rounded shadow-xl z-20 whitespace-nowrap pointer-events-none">
                          {hourData.hour}:00 • {hourData.count} entries
                        </div>
                        {/* Bar */}
                        <div 
                          className={`w-full rounded-t-[2px] transition-all duration-300 ${
                            hourData.count === 0 ? 'bg-gray-100 h-1' : 
                            hourData.dominantMood === 'happy' ? 'bg-green-400' :
                            hourData.dominantMood === 'sad' ? 'bg-blue-400' :
                            hourData.dominantMood === 'anxious' ? 'bg-orange-400' :
                            hourData.dominantMood === 'energetic' ? 'bg-yellow-400' :
                            'bg-purple-400'
                          }`}
                          style={{ height: `${Math.max(hourData.count * 20, 4)}px` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 justify-center">
                     <span className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Happy</span>
                     <span className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>Sad</span>
                     <span className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>Anxious</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-8">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Client Context</h3>
                 <span className="text-xs text-gray-400">Read-only preview of client's screen</span>
              </div>
            </div>

            {/* Faded Client View for Context */}
            <div className="opacity-75 grayscale-[30%] pointer-events-none select-none">
               <AnalyticsScreen
                journalEntries={userData.journalEntries as any[]}
                onBack={() => {}}
                onCoinsUpdate={() => {}}
                coins={0}
                petName="Client's Companion"
              />
            </div>
          </div>
        )}

        {/* MODE 2: CLIENT VIEW (SIMULATION) */}
        {analyticsView === 'preview' && (
           <div className="animate-in fade-in duration-300">
             {/* Note: In a real "simulation" we might hide the therapist header entirely, 
                 but keeping it here allows easy return navigation */}
              <AnalyticsScreen
                journalEntries={userData.journalEntries as any[]}
                onBack={() => setShowAnalytics(false)}
                onCoinsUpdate={() => {}}
                coins={0}
                petName="Client's Companion"
              />
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" className="rounded-full">
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Therapist Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">Dr. Sarah Mitchell</Badge>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getPendingRequests().length}</div>
              <div className="text-sm text-blue-600">New Requests</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getAcceptedRequests().length}</div>
              <div className="text-sm text-green-600">Active Clients</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{getRejectedRequests().length}</div>
              <div className="text-sm text-orange-600">Declined</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getTherapistRequests().length}</div>
              <div className="text-sm text-purple-600">Total Requests</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'requests' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            New Requests ({getPendingRequests().length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'clients' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active Clients ({getAcceptedRequests().length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {getPendingRequests().length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">New connection requests from users will appear here.</p>
              </Card>
            ) : (
              getPendingRequests().map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {request.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.userName}</h3>
                          <p className="text-sm text-gray-600">
                            Requested: {request.timestamp.toLocaleDateString()} at {request.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">New Request</Badge>
                    </div>

                    {request.userMoodSummary && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-2">📊 Mood Summary</h4>
                        <p className="text-sm text-blue-700">{request.userMoodSummary}</p>
                      </div>
                    )}

                    {request.userNote && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <h4 className="font-medium text-gray-800 mb-2">💬 Personal Note</h4>
                        <p className="text-sm text-gray-700">"{request.userNote}"</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleViewAnalytics(request.userId)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        📊 View Full Analytics
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                      >
                        Decline
                      </Button>
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600"
                      >
                        Accept & Connect
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            {getAcceptedRequests().length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Clients</h3>
                <p className="text-gray-600">Accepted clients will appear here for ongoing therapy sessions.</p>
              </Card>
            ) : (
              getAcceptedRequests().map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {request.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.userName}</h3>
                          <p className="text-sm text-gray-600">
                            Connected since: {request.timestamp.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">✓ Active therapy relationship</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => handleViewAnalytics(request.userId)}
                          variant="outline"
                          size="sm"
                          className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          📊 View Analytics
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600"
                          onClick={() => alert('In a real app, this would open the secure chat interface')}
                        >
                          💬 Open Chat
                        </Button>
                      </div>
                    </div>

                    {/* Client Status Summary */}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Last session: 3 days ago</span>
                        <span className="text-green-700">Next scheduled: Tomorrow 2 PM</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};