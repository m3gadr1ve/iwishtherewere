'use client'

import React, { useState, useEffect } from 'react';
import { Heart, Search, MessageSquare, DollarSign, Users, TrendingUp } from 'lucide-react';

interface Wish {
  id: number;
  text: string;
  created_at: string;
}

interface Comment {
  id: number;
  wish_id: number;
  text: string;
  founder_name: string;
  created_at: string;
}

const IWishThereWere = () => {
  const [currentView, setCurrentView] = useState('home');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState<{[key: number]: Comment[]}>({});
  const [newComment, setNewComment] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wishes for founders
  useEffect(() => {
    if (isFounder) {
      fetchWishes();
    }
  }, [isFounder]);

  const fetchWishes = async () => {
    try {
      const response = await fetch('/api/wishes');
      if (response.ok) {
        const wishesData = await response.json();
        setWishes(wishesData);
        
        // Fetch comments for each wish
        for (const wish of wishesData) {
          fetchComments(wish.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wishes:', error);
    }
  };

  const fetchComments = async (wishId: number) => {
    try {
      const response = await fetch(`/api/comments?wishId=${wishId}`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(prev => ({
          ...prev,
          [wishId]: commentsData
        }));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWish.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/wishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newWish }),
        });

        if (response.ok) {
          setNewWish('');
          setCurrentView('success');
        } else {
          console.error('Failed to submit wish');
        }
      } catch (error) {
        console.error('Error submitting wish:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleComment = async (wishId: number) => {
    if (newComment[wishId]?.trim()) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wishId,
            text: newComment[wishId],
            founderName: 'Anonymous Founder' // You can implement proper auth later
          }),
        });

        if (response.ok) {
          setNewComment({ ...newComment, [wishId]: '' });
          fetchComments(wishId); // Refresh comments
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const filteredWishes = wishes.filter(wish => 
    wish.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const totalWishes = wishes.length;
    const totalComments = Object.values(comments).reduce((sum, arr) => sum + arr.length, 0);
    const avgCommentsPerWish = totalWishes > 0 ? (totalComments / totalWishes).toFixed(1) : '0';
    
    return { totalWishes, totalComments, avgCommentsPerWish };
  };

  const stats = getStats();

  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="bg-white text-center max-w-lg w-full">
          <div className="text-8xl mb-8">✨</div>
          <h2 className="text-3xl font-light text-gray-900 mb-6">Wish Submitted</h2>
          <p className="text-lg text-gray-600 font-light mb-10 leading-relaxed">
            Thanks for sharing what you wish existed. Your idea is now part of our growing database of market opportunities.
          </p>
          <button 
            onClick={() => { setCurrentView('home'); setNewWish(''); }}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
          >
            Submit Another Wish
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'founder-login') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-light text-gray-900 mb-10 text-center">Founder Access</h2>
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="font-medium text-gray-900 mb-4">What you get:</h3>
              <ul className="text-gray-700 space-y-2 font-light">
                <li>• Access to all submitted wishes</li>
                <li>• Search and filter capabilities</li>
                <li>• Direct communication with users</li>
                <li>• Real-time market research data</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-4xl font-light text-gray-900 mb-2">$10/month</p>
              <p className="text-gray-600 font-light">Unlimited access</p>
            </div>
            <button 
              onClick={() => { setIsFounder(true); setCurrentView('dashboard'); }}
              className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Access Dashboard (Demo)
            </button>
            <button 
              onClick={() => setCurrentView('home')}
              className="w-full bg-gray-100 text-gray-800 py-4 rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard' && isFounder) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-medium text-gray-800">Founder Dashboard</h1>
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600 font-light">Subscription: Active</span>
                <button 
                  onClick={() => { setIsFounder(false); setCurrentView('home'); }}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Wishes</p>
                  <p className="text-3xl font-light text-gray-900">{stats.totalWishes}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Comments</p>
                  <p className="text-3xl font-light text-gray-900">{stats.totalComments}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Comments/Wish</p>
                  <p className="text-3xl font-light text-gray-900">{stats.avgCommentsPerWish}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search wishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-0 focus:ring-0 text-lg font-light"
              />
            </div>
          </div>

          {/* Wishes List */}
          <div className="space-y-6">
            {filteredWishes.map(wish => (
              <div key={wish.id} className="bg-white border border-gray-100 p-8 rounded-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900 leading-relaxed">
                      I wish there were {wish.text}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 font-light">
                      Submitted {new Date(wish.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {comments[wish.id]?.length || 0}
                  </div>
                </div>

                {/* Comments */}
                {comments[wish.id] && comments[wish.id].length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                    <h4 className="font-medium text-gray-700 mb-4">Comments:</h4>
                    <div className="space-y-4">
                      {comments[wish.id].map(comment => (
                        <div key={comment.id} className="bg-white p-4 rounded-xl">
                          <div className="flex justify-between items-start">
                            <p className="text-gray-800 font-light">{comment.text}</p>
                            <span className="text-xs text-gray-500 ml-4 font-medium">
                              {comment.founder_name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Ask a follow-up question..."
                    value={newComment[wish.id] || ''}
                    onChange={(e) => setNewComment({...newComment, [wish.id]: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:ring-0 focus:border-gray-400 font-light"
                  />
                  <button 
                    onClick={() => handleComment(wish.id)}
                    className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium text-gray-800 tracking-tight">I Wish There Were</h1>
            <button 
              onClick={() => setCurrentView('founder-login')}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Founder Access
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight leading-tight">
            What do you wish existed?
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Share your frustrations or what you wish existed, and our network of entrepreneurs will create it.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 mb-8">
          <div className="mb-8">
            <label className="block text-2xl font-light text-gray-700 mb-6">
              I wish there were...
            </label>
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="car cleaning services near me"
              className="w-full text-lg px-4 py-4 border-0 border-b-2 border-gray-200 focus:border-black focus:ring-0 transition-colors bg-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleWishSubmit(e)}
            />
          </div>
          
          <button 
            onClick={handleWishSubmit}
            disabled={isSubmitting || !newWish.trim()}
            className={`w-full text-lg font-medium py-4 rounded-full transition-all duration-200 transform ${
              isSubmitting || !newWish.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Share My Wish'
            )}
          </button>
        </div>

        <div className="text-center text-gray-500 space-y-2">
          <p>Your wish will be added to our database for entrepreneurs to discover.</p>
          <p>You won't be able to see other wishes unless you're a founder.</p>
        </div>

        {/* Stats for public */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-light text-gray-800 mb-8 text-center">Community Impact</h3>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-light text-black mb-2">{stats.totalWishes}</div>
              <div className="text-sm text-gray-600 font-medium">Wishes Shared</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black mb-2">{stats.totalComments}</div>
              <div className="text-sm text-gray-600 font-medium">Founder Questions</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black mb-2">12</div>
              <div className="text-sm text-gray-600 font-medium">Active Founders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IWishThereWere;
