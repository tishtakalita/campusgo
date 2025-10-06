import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, UserPlus, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { usersAPI } from '../services/api';
import type { User as ApiUser } from '../services/api';

// Types

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: string;
  created_at: string;
  sender?: ApiUser;
  receiver?: ApiUser;
}

interface Friend {
  friend_id: string;
  friend_name: string;
  friend_email: string;
  friendship_created_at: string;
}

interface Message {
  message_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  friend: Friend;
  last_message: Message | null;
  unread_count: number;
}

// Use the same API base as the services layer
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const Chat: React.FC = () => {
  const { user } = useUser();
  const currentUserId = user?.id;
  
  // State
  const [activeTab, setActiveTab] = useState<'conversations' | 'search' | 'requests'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Friend | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Functions
  const fetchConversations = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${currentUserId}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations:', data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (friendId: string, markAsRead: boolean = true) => {
    if (!currentUserId) return;
    
    setLoadingMessages(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${currentUserId}/${friendId}`);
      const data = await response.json();
      
      if (response.ok) {
        const list = (data.messages || []) as Message[];
        // Ensure ascending chronological order by local time
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(list);
        // Only mark messages as read when explicitly requested (when user opens conversation)
        if (markAsRead) {
          markMessagesAsRead(friendId);
        }
      } else {
        console.error('Failed to fetch messages:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async (friendId: string) => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/mark-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          friend_id: friendId
        })
      });
      
      if (response.ok) {
        // Refresh conversations to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentUserId || !selectedConversation || !newMessage.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: selectedConversation.friend_id,
          content: newMessage.trim(),
          message_type: 'text'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.friend_id);
        fetchConversations(); // Refresh conversations to update last message
      } else {
        console.error('Failed to send message:', data);
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      // Use centralized usersAPI for consistency with Projects pattern
      const response = await usersAPI.searchUsers(searchQuery);
      if (response.data) {
        let users = (response.data.users || []) as ApiUser[];
        // Fallback: if backend returns empty, try client-side filter over full list
        if ((!users || users.length === 0) && searchQuery.length >= 1) {
          const allRes = await usersAPI.getAllUsers();
          const allUsers = (allRes.data?.users || []) as ApiUser[];
          const q = searchQuery.toLowerCase();
          users = allUsers.filter(u =>
            (u.first_name && u.first_name.toLowerCase().includes(q)) ||
            (u.last_name && u.last_name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
          );
        }
        const filteredUsers = (users || []).filter((u: ApiUser) => u.id !== currentUserId);
        setSearchResults(filteredUsers);
      } else if (response.error) {
        console.error('Failed to search users:', response.error);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    finally {
      setSearchLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/friend-requests/${currentUserId}?type=received`);
      const data = await response.json();
      
      if (response.ok) {
        setPendingRequests(data.requests || data.friend_requests || []);
      } else {
        console.error('Failed to fetch friend requests:', data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/friend-requests/sent/${currentUserId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSentRequests(data.requests || data.friend_requests || []);
      } else {
        console.error('Failed to fetch sent requests:', data);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string, message: string = '') => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/friend-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: receiverId,
          message: message || 'Hi! I would like to connect with you.'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Friend request sent successfully!');
        fetchSentRequests();
      } else {
        console.error('Failed to send friend request:', data);
        alert(`Failed to send friend request: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request');
    }
  };

  const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingRequest(requestId);
    
    try {
      // Backend expects PUT /api/friend-requests/{request_id} with body { action, user_id }
      const response = await fetch(`${API_BASE_URL}/api/friend-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: currentUserId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Friend request ${action}ed successfully!`);
        fetchFriendRequests();
        fetchConversations();
        
        if (action === 'accept' && data.friend) {
          setActiveTab('conversations');
          setSelectedConversation(data.friend);
        }
      } else {
        console.error(`Failed to ${action} friend request:`, data);
        alert(`Failed to ${action} friend request: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Network error ${action}ing friend request:`, error);
      alert('Network error: Could not connect to server');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Effects
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
      fetchFriendRequests();
      fetchSentRequests();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.friend_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        fetchConversations();
        fetchFriendRequests();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  // Auto-refresh messages every 10 seconds when a conversation is selected (without marking as read)
  useEffect(() => {
    if (selectedConversation && currentUserId) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.friend_id, false); // Don't mark as read on auto-refresh
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, currentUserId]);

  // Conversation preview timestamp (compact) and message bubble timestamp (detailed)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (sameDay) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays < 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatBubbleTime = (timestamp: string) => {
    const date = new Date(timestamp);
    // Messages: show time only
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const toLocalDateKey = (ts: string) => {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDisplayName = (user: ApiUser) => {
    if (user.name) return user.name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    return user.email.split('@')[0];
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.friend.friend_name.toLowerCase().includes(conversationSearchQuery.toLowerCase())
  );

  // Show loading if user is not available
  if (!user || !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl overflow-hidden h-[90vh] flex shadow-2xl">
          
          {/* Left Sidebar - Conversations */}
          <div className="flex-none box-border overflow-hidden border-r border-gray-700 flex flex-col bg-gray-850" style={{ width: 320, minWidth: 320, maxWidth: 320 }}>
            
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold flex items-center gap-2 select-none">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                  Messages
                </h1>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className={`p-2 rounded-full transition-colors ${
                      activeTab === 'conversations' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Messages"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`p-2 rounded-full transition-colors ${
                      activeTab === 'search' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Find new friends"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className={`p-2 rounded-full transition-colors relative ${
                      activeTab === 'requests' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Friend requests"
                  >
                    <Users className="w-5 h-5" />
                    {pendingRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="w-full bg-gray-700 border border-gray-600 rounded-full px-4 py-2 flex items-center">
                {activeTab === 'search' ? (
                  <button
                    type="button"
                    aria-label="Search users"
                    title="Search"
                    onClick={() => searchUsers()}
                    className="text-gray-300 hover:text-white focus:outline-none mr-2"
                  >
                    {searchLoading ? (
                      <span className="w-4 h-4 inline-block animate-spin border-2 border-gray-400 border-t-transparent rounded-full" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                )}
                <input
                  type="text"
                  placeholder={activeTab === 'conversations' ? "Search conversations..." : "Search users..."}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none border-0"
                  value={activeTab === 'conversations' ? conversationSearchQuery : searchQuery}
                  onChange={(e) => activeTab === 'conversations' ? setConversationSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (activeTab === 'search' && e.key === 'Enter') {
                      e.preventDefault();
                      searchUsers();
                    }
                  }}
                />
              </div>
            </div>

            {/* Content Area - Fixed height with scrolling */}
            <div className="flex-1 overflow-y-scroll min-h-0 min-w-0" style={{ scrollbarGutter: 'stable' }}>
              
              {/* Conversations Tab */}
              {activeTab === 'conversations' && (
                <div className="divide-y divide-gray-700 h-full">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg mb-2">No conversations yet</p>
                      <p className="text-sm">Find friends to start chatting!</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.friend.friend_id}
                        onClick={() => {
                          setSelectedConversation(conversation.friend);
                          setActiveTab('conversations');
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                          selectedConversation?.friend_id === conversation.friend.friend_id ? 'bg-gray-700 border-r-2 border-green-500' : ''
                        }`}
                      >
                            <div className="flex items-center space-x-3 min-w-0">
                          {/* Profile Picture Placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {conversation.friend.friend_name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between min-w-0">
                              <h3 className="font-medium text-white truncate">
                                {conversation.friend.friend_name}
                              </h3>
                              <span className="text-xs text-gray-400">
                                {conversation.last_message && formatTime(conversation.last_message.created_at)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between min-w-0">
                              <p className="flex-1 min-w-0 text-sm text-gray-400 truncate">
                                {conversation.last_message ? 
                                  (conversation.last_message.sender_id === currentUserId ? 'You: ' : '') + conversation.last_message.content
                                  : 'Start a conversation'
                                }
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Search Tab */}
              {activeTab === 'search' && (
                <div className="p-4">
                  {searchResults.length === 0 && searchQuery ? (
                    <div className="text-center text-gray-400 py-8">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Search for users to connect with</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((user) => {
                        const alreadySent = sentRequests.some(req => req.receiver_id === user.id && req.status === 'pending');
                        
                        return (
                          <div key={user.id} className="bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {getDisplayName(user).charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-medium text-white truncate">{getDisplayName(user)}</h3>
                                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => sendFriendRequest(user.id)}
                                disabled={alreadySent}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  alreadySent 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                {alreadySent ? 'Sent' : 'Add'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="p-4">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((request) => {
                        const senderName = request.sender ? getDisplayName(request.sender as any) : `User ${request.sender_id?.slice(0, 8) || ''}`;
                        const senderInitial = (request.sender?.first_name || request.sender?.email || senderName || 'U').charAt(0).toUpperCase();
                        return (
                        <div key={request.id} className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {senderInitial}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{senderName}</h3>
                              <p className="text-sm text-gray-400">wants to connect</p>
                            </div>
                          </div>
                          
                          {request.message && (
                            <p className="text-sm text-gray-300 mb-3 p-2 bg-gray-800 rounded">
                              "{request.message}"
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondToFriendRequest(request.id, 'accept')}
                              disabled={processingRequest === request.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {processingRequest === request.id ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => respondToFriendRequest(request.id, 'reject')}
                              disabled={processingRequest === request.id}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {processingRequest === request.id ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col">
            
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.friend_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-medium text-white">{selectedConversation.friend_name}</h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2"></div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-900" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.02) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.02) 2%, transparent 0%)', backgroundSize: '100px 100px' }}>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-medium mb-2 text-gray-400">Start a conversation</h3>
                        <p className="text-gray-500">Send a message to start chatting with {selectedConversation.friend_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isOwn = message.sender_id === currentUserId;
                        const isNewDay = index === 0 || toLocalDateKey(messages[index - 1].created_at) !== toLocalDateKey(message.created_at);
                        
                        return (
                          <div key={message.message_id}>
                            {isNewDay && (
                              <div className="text-center my-4">
                                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                  {new Date(message.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                            
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isOwn 
                                  ? 'bg-green-600 text-white rounded-br-sm' 
                                  : 'bg-gray-700 text-white rounded-bl-sm'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatBubbleTime(message.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-full py-3 px-4 pr-12 focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Welcome Area */
              <div className="flex-1 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 mx-auto mb-6 text-gray-600" />
                  <h3 className="text-2xl font-medium mb-4 text-gray-300">Welcome to Messages</h3>
                  <p className="text-gray-500 max-w-md">
                    Select a conversation from the sidebar or find new friends to start chatting
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;