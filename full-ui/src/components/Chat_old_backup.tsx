import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, UserPlus, Check, X, Users, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

// Types
interface User {
  id: string;
  name?: string; // Computed field from first_name + last_name
  first_name?: string;
  last_name?: string;
  email: string;
  student_id: string;
  department?: string;
  department_id?: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: string;
  created_at: string;
  sender?: User;
  receiver?: User;
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

const Chat: React.FC = () => {
  // Get current user from auth context
  const { user } = useUser();
  
  // State management
  const [activeTab, setActiveTab] = useState<'conversations' | 'search' | 'requests'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current user ID
  const currentUserId = user?.id;

  // API functions
  const API_BASE = 'http://localhost:8000/api';

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations for user:', currentUserId);
      const response = await fetch(`${API_BASE}/conversations/${currentUserId}`);
      
      if (!response.ok) {
        console.error('Failed to fetch conversations:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Conversations response:', data);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const response = await fetch(`${API_BASE}/messages/${currentUserId}/${friendId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: selectedConversation.friend_id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.friend_id);
        fetchConversations(); // Refresh to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      // Use the existing users endpoint and filter on frontend
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      
      if (data.users) {
        const query = searchQuery.toLowerCase().trim();
        const filtered = data.users
          .filter((user: any) => {
            if (user.id === currentUserId) return false; // Exclude current user
            
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
            const email = (user.email || '').toLowerCase();
            const studentId = (user.student_id || '').toLowerCase();
            
            return fullName.includes(query) || 
                   email.includes(query) || 
                   studentId.includes(query);
          })
          .slice(0, 20) // Limit results
          .map((user: any) => ({
            ...user,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
          }));
          
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string, message: string = '') => {
    try {
      console.log('Sending friend request:', { sender_id: currentUserId, receiver_id: receiverId, message });
      
      const response = await fetch(`${API_BASE}/friend-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: receiverId,
          message
        })
      });

      console.log('Friend request response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Friend request sent successfully:', data);
        alert('Friend request sent successfully!');
        fetchSentRequests();
      } else {
        const error = await response.json();
        console.error('Friend request error:', error);
        
        if (error.detail && error.detail.includes('row-level security policy')) {
          alert('Database permission error. Please run the RLS fix SQL script in Supabase:\n\nALTER TABLE friend_requests DISABLE ROW LEVEL SECURITY;');
        } else {
          alert(`Error: ${error.detail || 'Failed to send friend request'}`);
        }
      }
    } catch (error) {
      console.error('Network error sending friend request:', error);
      alert('Network error: Could not connect to server. Make sure the backend is running.');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      console.log('Fetching friend requests for user:', currentUserId);
      const response = await fetch(`${API_BASE}/friend-requests/${currentUserId}?type=received`);
      
      if (!response.ok) {
        console.error('Failed to fetch friend requests:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Friend requests received:', data);
      setFriendRequests(data.requests || []);
    } catch (error) {
      console.error('Network error fetching friend requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/friend-requests/${currentUserId}?type=sent`);
      const data = await response.json();
      setSentRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      // Validate inputs
      if (!currentUserId) {
        alert('Error: User not logged in');
        return;
      }
      
      if (!requestId) {
        alert('Error: Invalid request ID');
        return;
      }
      
      // Set loading state
      setProcessingRequest(requestId);
      
      console.log('Responding to friend request:', { requestId, action, user_id: currentUserId });
      
      const response = await fetch(`${API_BASE}/friend-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          user_id: currentUserId
        })
      });

      console.log('Friend request response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Friend request response:', data);
        alert(`Friend request ${action}ed successfully!`);
        fetchFriendRequests();
        if (action === 'accept') {
          fetchConversations(); // Refresh conversations if accepted
          
          // Find the friend request to get the sender's information
          const acceptedRequest = friendRequests.find(req => req.id === requestId);
          if (acceptedRequest && acceptedRequest.sender) {
            // Create a friend object for the new conversation
            const newFriend: Friend = {
              friend_id: acceptedRequest.sender.id,
              friend_name: `${acceptedRequest.sender.first_name || ''} ${acceptedRequest.sender.last_name || ''}`.trim(),
              friend_email: acceptedRequest.sender.email,
              friendship_created_at: new Date().toISOString()
            };
            
            // Switch to conversations tab and open the chat
            setActiveTab('conversations');
            setSelectedConversation(newFriend);
            
            // Show success message about opening chat
            setTimeout(() => {
              alert(`Chat opened with ${newFriend.friend_name}! You can now start messaging.`);
            }, 500);
            
            // Refresh conversations again after a short delay to ensure friendship is created
            setTimeout(() => {
              fetchConversations();
            }, 2000);
          }
        }
      } else {
        const error = await response.json();
        console.error('Friend request response error:', error);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        
        // Check if the error is actually friend request data (which shouldn't be an error)
        if (error.id && error.sender_id && error.receiver_id) {
          alert(`Unexpected response format. Status: ${response.status}. Check console for details.`);
        } else {
          alert(`Error ${action}ing friend request: ${error.detail || JSON.stringify(error)}`);
        }
      }
    } catch (error) {
      console.error('Network error responding to friend request:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Debug function to check all data
  const debugAllData = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://campusgo-backend.onrender.com' : 'http://localhost:8000';
      
      console.log('=== DEBUGGING ALL CHAT DATA ===');
      console.log('Current User ID:', currentUserId);
      
      // Test all endpoints
      const endpoints = [
        `/api/users/${currentUserId}`,
        `/api/conversations/${currentUserId}`,
        `/api/friends/${currentUserId}`, 
        `/api/friend-requests/${currentUserId}`,
        `/api/friend-requests/sent/${currentUserId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint}`);
          const data = await response.json();
          console.log(`${endpoint}:`, data);
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
        }
      }
      
      alert('Check browser console for detailed debug info');
    } catch (error) {
      console.error('Debug error:', error);
      alert('Debug failed - check console');
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

  // Auto-refresh messages every 10 seconds when a conversation is selected
  useEffect(() => {
    if (selectedConversation && currentUserId) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.friend_id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, currentUserId]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show loading if user is not available
  if (!user || !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-800 rounded-2xl overflow-hidden h-[80vh] flex">
          
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-700 flex flex-col">
            
            {/* Header with tabs */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                  Chat
                </h1>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      console.log('Current User ID:', currentUserId);
                      console.log('User object:', user);
                      alert(`User ID: ${currentUserId}\nEmail: ${user?.email || 'No email'}\nName: ${user?.first_name} ${user?.last_name}`);
                    }}
                    className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                    title="Debug current user info"
                  >
                    User
                  </button>
                  <button 
                    onClick={debugAllData}
                    className="text-xs bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded"
                    title="Debug all chat data"
                  >
                    Data
                  </button>
                </div>
              </div>
              
              <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'conversations' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Chats
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'search' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Find Friends
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors relative ${
                    activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Requests
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Conversations Tab */}
              {activeTab === 'conversations' && (
                <div className="p-4 space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Find friends to start chatting!</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.friend.friend_id}
                        onClick={() => setSelectedConversation(conversation.friend)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.friend_id === conversation.friend.friend_id
                            ? 'bg-blue-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{conversation.friend.friend_name}</h3>
                            {conversation.last_message && (
                              <p className="text-sm text-gray-300 truncate">
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-2">
                            {conversation.last_message && (
                              <p className="text-xs text-gray-400">
                                {formatTime(conversation.last_message.created_at)}
                              </p>
                            )}
                            {conversation.unread_count > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                                {conversation.unread_count}
                              </span>
                            )}
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
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or student ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.id} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-gray-400">{user.email}</p>
                              <p className="text-xs text-gray-500">{user.student_id} • {user.department}</p>
                            </div>
                            <button
                              onClick={() => sendFriendRequest(user.id, `Hi ${user.name}, I'd like to connect!`)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Friend
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="p-4">
                  <h3 className="font-medium mb-3">Received Requests</h3>
                  {friendRequests.length === 0 ? (
                    <p className="text-gray-400 text-sm mb-6">No pending requests</p>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {friendRequests.map((request) => (
                        <div key={request.id} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{request.sender?.name}</h4>
                              <p className="text-sm text-gray-400">{request.sender?.email}</p>
                              {request.message && (
                                <p className="text-sm text-gray-300 mt-1 italic">"{request.message}"</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(request.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => respondToFriendRequest(request.id, 'accept')}
                                disabled={processingRequest === request.id}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                              >
                                {processingRequest === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => respondToFriendRequest(request.id, 'reject')}
                                disabled={processingRequest === request.id}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                              >
                                {processingRequest === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <h3 className="font-medium mb-3">Sent Requests</h3>
                  {sentRequests.length === 0 ? (
                    <p className="text-gray-400 text-sm">No sent requests</p>
                  ) : (
                    <div className="space-y-2">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{request.receiver?.name}</h4>
                              <p className="text-sm text-gray-400">{request.receiver?.email}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">{selectedConversation.friend_name}</h2>
                  <p className="text-sm text-gray-400">{selectedConversation.friend_email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender_id === currentUserId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Welcome to Chat</h3>
                  <p>Select a conversation or find friends to start chatting</p>
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