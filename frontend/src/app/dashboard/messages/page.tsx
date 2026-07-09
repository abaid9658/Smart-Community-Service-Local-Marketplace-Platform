'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { messageAPI } from '@/lib/api';
import { initSocket, joinConversation, emitTypingStart, emitTypingStop, emitMessage, getSocket } from '@/lib/socket';
import { Conversation, Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Send, Loader2, MessageCircle, Search, Image, X, Phone, Video, MoreVertical } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeConvRef = useRef<Conversation | null>(null);
  activeConvRef.current = activeConv;

  const loadConversations = async () => {
    try {
      const { data } = await messageAPI.conversations();
      setConversations(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadConversations();

    // Init socket
    if (accessToken) {
      const socket = initSocket(accessToken);

      socket.on('message:received', (msg: Message) => {
        if (msg.conversationId === activeConvRef.current?.id) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id || (msg.tempId && m.tempId === msg.tempId))) {
              return prev.map(m => m.tempId === msg.tempId ? msg : m);
            }
            return [...prev, msg];
          });
        }
        loadConversations();
      });

      socket.on('typing:start', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
        if (conversationId === activeConvRef.current?.id && userId !== user?.id) {
          setTypingUsers(prev => new Set([...prev, userId]));
        }
      });

      socket.on('typing:stop', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
        if (conversationId === activeConvRef.current?.id) {
          setTypingUsers(prev => { const next = new Set(prev); next.delete(userId); return next; });
        }
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('message:received');
        socket.off('typing:start');
        socket.off('typing:stop');
      }
    };
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setTypingUsers(new Set());
    joinConversation(conv.id);
    try {
      const { data } = await messageAPI.messages(conv.id);
      setMessages(data.data?.messages || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      tempId,
      conversationId: activeConv.id,
      senderId: user!.id,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: user as any,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      emitMessage({ conversationId: activeConv.id, content, tempId });
    } catch {
      await messageAPI.send(activeConv.id, content);
    }
    setSending(false);
  };

  const handleTyping = () => {
    if (!activeConv) return;
    emitTypingStart(activeConv.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(activeConv.id), 2000);
  };

  const getOtherUser = (conv: Conversation) => {
    const p = conv.participants as any[];
    const otherParticipant = p?.find(u => {
      const uId = u.id || u._id || u.userId || u.user?.id || u.user?._id;
      return uId !== user?.id;
    });
    if (!otherParticipant) return null;
    return otherParticipant.user || otherParticipant;
  };

  const filteredConvs = conversations.filter(conv => {
    const other = getOtherUser(conv);
    return !searchQuery || other?.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar flex flex-col p-0">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
          {/* Conversation List */}
          <div className={`w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-base mb-3">Messages</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search conversations..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-9 h-9 text-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-4 border-b border-gray-50">
                    <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-2/3 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                    </div>
                  </div>
                ))
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : filteredConvs.map(conv => {
                const other = getOtherUser(conv);
                const isActive = activeConv?.id === conv.id;
                return (
                  <button key={conv.id} onClick={() => openConversation(conv)}
                    className={`w-full flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${isActive ? 'bg-[#e6f4f1]' : ''}`}>
                    {other?.profile?.avatarUrl ? (
                      <img src={other.profile.avatarUrl} className="avatar avatar-sm flex-shrink-0" alt="avatar" />
                    ) : (
                      <div className="avatar avatar-sm gradient-primary text-white text-xs flex-shrink-0">
                        {other?.profile?.fullName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">{other?.profile?.fullName || other?.username}</p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-gray-400">{formatRelativeTime(conv.lastMessageAt)}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                    </div>
                    {other?.isOnline && (
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Panel */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-[#FAF9FD]">
              {/* Chat Header */}
              {(() => {
                const other = getOtherUser(activeConv);
                return (
                  <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100">
                    <button onClick={() => setActiveConv(null)} className="sm:hidden btn btn-ghost btn-icon">
                      ←
                    </button>
                    {other?.profile?.avatarUrl ? (
                      <img src={other.profile.avatarUrl} className="avatar avatar-sm" alt="avatar" />
                    ) : (
                      <div className="avatar avatar-sm gradient-primary text-white text-xs">
                        {other?.profile?.fullName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{other?.profile?.fullName}</p>
                      <p className={`text-xs ${other?.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                        {other?.isOnline ? '● Online' : 'Offline'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon" aria-label="Call"><Phone size={16} /></button>
                      <button className="btn btn-ghost btn-icon" aria-label="Video"><Video size={16} /></button>
                      <button className="btn btn-ghost btn-icon" aria-label="More"><MoreVertical size={16} /></button>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="avatar avatar-xs gradient-primary text-white text-[9px] flex-shrink-0 mb-0.5">
                          {msg.sender?.profile?.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-[#007261] text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.mediaUrl && (
                            <img src={msg.mediaUrl} alt="media" className="rounded-xl mb-2 max-w-full" />
                          )}
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {formatRelativeTime(msg.createdAt)}
                          {isMe && msg.isRead && <span className="ml-1 text-[#007261]">✓✓</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                            style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                      }}
                      placeholder="Type a message... (Enter to send)"
                      rows={1}
                      className="input resize-none py-3 pr-12 text-sm leading-relaxed"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="btn btn-primary w-12 h-12 rounded-xl flex-shrink-0"
                    aria-label="Send"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin-fast" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden sm:flex items-center justify-center text-center text-gray-400">
              <div>
                <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
