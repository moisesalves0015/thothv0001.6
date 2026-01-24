
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  CheckCheck,
  Plus,
  ArrowLeft,
  Users,
  BookOpen,
  Hash,
  Image as ImageIcon,
  FileText,
  Link,
  X,
  Filter,
  Pin,
  Archive,
  Bell,
  BellOff,
  Shield,
  GraduationCap,
  MessageSquare,
  FileCode,
  Calendar,
  Target,
  Star,
  Trash2,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  SendHorizonal,
  Mic,
  Video,
  Download,
  Copy,
  Share2,
  Clock,
  AtSign,
  Sparkles,
  Phone,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatService } from '../../modules/chat/chat.service';
import { ChatMessage, ChatGroup, ChatType, MessageType, Author } from '../../types';
import { useSearchParams } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: string;
  attachments: number;
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: string;
  attachments: number;
  submitted: boolean;
}

const avatarUrls = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=System",
  "https://i.pravatar.cc/100?img=32",
  "https://i.pravatar.cc/100?img=45"
];

const Mensagens: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId);
  const [selectedChatType, setSelectedChatType] = useState<ChatType>('direct'); // Update dynamically
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(!initialChatId); // Hide list on mobile if deep linked

  // UI States
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Group Creation States
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState<ChatType>('study');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableConnections, setAvailableConnections] = useState<Author[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firestore Data
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Mock Assignments
  const [assignments] = useState<Assignment[]>([
    {
      id: 'a1',
      title: 'Entrega TP1 - Análise de Algoritmos',
      description: 'Implemente o algoritmo de Dijkstra e analise complexidade',
      dueDate: '2024-12-15',
      course: 'Análise de Algoritmos',
      attachments: 3,
      submitted: false
    }
  ]);

  // Subscribe to Chats
  useEffect(() => {
    if (!user) return;
    const unsub = ChatService.subscribeToUserChats(
      user.uid,
      (data) => {
        setChats(data);
        setLoadingChats(false);

        // If we have an initialChatId but it's not selected (e.g. refresh), select it
        if (initialChatId && !selectedChatId) {
          const found = data.find(c => c.id === initialChatId);
          if (found) {
            setSelectedChatId(found.id);
            setSelectedChatType(found.type);
          }
        }
      },
      (error) => {
        console.error("Subscription error:", error);
        setLoadingChats(false); // Stop loading even on error
      }
    );
    return () => unsub();
  }, [user, initialChatId]);

  // Subscribe to Messages
  useEffect(() => {
    if (!selectedChatId) {
      setActiveMessages([]);
      return;
    }
    const unsub = ChatService.subscribeToMessages(selectedChatId, (msgs) => {
      setActiveMessages(msgs);
    });

    // Determine Type locally if not set (fallback)
    const currentChat = chats.find(c => c.id === selectedChatId);
    if (currentChat) setSelectedChatType(currentChat.type);

    return () => unsub();
  }, [selectedChatId, chats]);

  // Load connections for group/chat creation
  useEffect(() => {
    if ((showGroupCreator || showNewChat) && user) {
      ChatService.getUserConnections(user.uid).then(setAvailableConnections);
      setModalSearchQuery(''); // Reset search
    }
  }, [showGroupCreator, showNewChat, user]);

  const activeChat = useMemo(() =>
    chats.find(c => c.id === selectedChatId)
    , [chats, selectedChatId]);

  const filteredChats = useMemo(() =>
    chats.filter(chat =>
      (chat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    , [chats, searchQuery]);

  const filteredConnections = useMemo(() =>
    availableConnections.filter(c =>
      c.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
    )
    , [availableConnections, modalSearchQuery]);

  const pinnedChats = useMemo(() =>
    filteredChats.filter(c => c.pinned)
    , [filteredChats]);

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !uploadedFile) || !selectedChatId || !user) return;

    try {
      if (editingMessage) {
        await ChatService.editMessage(selectedChatId, editingMessage.id, messageText);
        setEditingMessage(null);
      } else {
        // Construct message payload safely to avoid "undefined" values rejected by Firestore
        const messagePayload: any = {
          senderId: user.uid,
          text: messageText,
          status: 'sent',
          type: uploadedFile ? 'file' : 'text',
        };

        if (uploadedFile) {
          messagePayload.attachments = [{
            url: '#', // TODO: Implement Storage Upload logic or use a placeholder URL
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
          }];
        }

        if (replyingTo?.id) {
          messagePayload.replyToId = replyingTo.id;
        }

        await ChatService.sendMessage(selectedChatId, messagePayload);
      }

      setMessageText('');
      setUploadedFile(null);
      setReplyingTo(null);
      setShowFileUpload(false);
    } catch (error) {
      console.error("Error sending/editing message:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUsers.length === 0 || !user) return;

    try {
      const groupId = await ChatService.createGroup({
        name: newGroupName,
        description: newGroupDescription,
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${newGroupName}`,
        type: selectedGroupType,
        members: [user.uid, ...selectedUsers],
        adminId: user.uid,
        tags: ['novo'],
        muted: false,
        pinned: false,
      });

      await ChatService.sendMessage(groupId, {
        senderId: 'system',
        text: `Grupo "${newGroupName}" criado.`,
        status: 'read',
        type: 'announcement'
      });

      setSelectedChatId(groupId);
      setSelectedChatType('group');
      setShowGroupCreator(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleStartDirectChat = async (targetUser: Author) => {
    if (!user) return;
    try {
      const chatId = await ChatService.getOrCreateDirectChat(user.uid, targetUser.id, targetUser);
      setSelectedChatId(chatId);
      setSelectedChatType('direct');
      setShowNewChat(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!selectedChatId || !user) return;
    const msg = activeMessages.find(m => m.id === messageId);
    if (!msg) return;

    await ChatService.addReaction(selectedChatId, messageId, emoji, user.uid, msg.reactions);
  };

  const handlePinMessage = async (messageId: string, currentStatus?: boolean) => {
    if (!selectedChatId) return;
    await ChatService.togglePinMessage(selectedChatId, messageId, !currentStatus);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChatId) return;
    if (window.confirm("Apagar mensagem?")) {
      await ChatService.deleteMessage(selectedChatId, messageId);
    }
  };

  const handleShareAssignment = async (assignment: Assignment) => {
    if (!selectedChatId || !user) return;

    const text = `📝 **${assignment.title}**\n\n${assignment.description}\n\n📅 Entrega: ${assignment.dueDate}`;
    await ChatService.sendMessage(selectedChatId, {
      senderId: user.uid,
      text: text,
      type: 'assignment',
      status: 'sent',
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowFileUpload(true);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'file':
        return (
          <div className="p-3 bg-white rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{msg.attachments?.[0].name}</h4>
                <p className="text-xs text-slate-500">{msg.attachments?.[0].size}</p>
              </div>
              <Download size={16} className="text-slate-400" />
            </div>
          </div>
        );
      case 'assignment':
        return (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-900">Trabalho Acadêmico</h4>
              </div>
            </div>
            <p className="text-sm text-emerald-800 whitespace-pre-wrap">{msg.text}</p>
          </div>
        );
      case 'announcement':
        return (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <p className="text-sm font-bold text-amber-800">{msg.text}</p>
          </div>
        );
      default:
        return <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>;
    }
  };

  // Helper to get avatar for a sender
  const getSenderAvatar = (senderId: string) => {
    if (activeChat?.type === 'direct') {
      return activeChat.avatar; // Defined by ChatService enrichment
    }
    // For groups, we might need a map of members (omitted for now to save reads, using seed)
    return `https://api.dicebear.com/7.x/initials/svg?seed=${senderId}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="thoth-page-header shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Mensagens</h1>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Comunicação Acadêmica</p>
          </div>
          <button
            onClick={() => setShowGroupCreator(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#006c55] to-[#00876a] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#006c55]/20 hover:shadow-xl hover:shadow-[#006c55]/30 transition-all"
          >
            <Users size={16} />
            <span>Novo Grupo</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">

        {/* Sidebar - Chats List */}
        <div className={`w-full lg:w-[360px] flex flex-col glass-panel rounded-2xl bg-white/40 border border-white/60 overflow-hidden shadow-xl transition-all duration-300 ${!isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/40">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversas..."
                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-100 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setMessageFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${messageFilter === 'all' ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-600'}`}>Todas</button>
              <button onClick={() => setMessageFilter('pinned')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${messageFilter === 'pinned' ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-600'}`}>Fixados</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {loadingChats ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006c55]"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare size={20} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">Nenhuma conversa encontrada</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-4 py-2 bg-[#006c55] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#006c55]/20 hover:scale-105 transition-transform"
                >
                  Iniciar Nova Mensagem
                </button>
              </div>
            ) : (
              filteredChats
                .filter(chat => messageFilter === 'pinned' ? chat.pinned : true)
                .map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setSelectedChatType(chat.type);
                      setIsMobileListVisible(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${selectedChatId === chat.id
                      ? 'bg-[#006c55] text-white shadow-lg'
                      : 'hover:bg-white/80'
                      }`}
                  >
                    <div className="relative shrink-0">
                      <img src={chat.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${chat.id}`} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm bg-white" alt={chat.name} />
                      {chat.type === 'group' && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center`}>
                          <Users size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-xs font-black truncate">{chat.name}</h4>
                        {chat.lastMessage && (
                          <span className={`text-[8px] font-bold uppercase ${selectedChatId === chat.id ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${selectedChatId === chat.id ? 'text-white/80' : 'text-slate-500'}`}>
                        {chat.lastMessage ? chat.lastMessage.text : "Nova conversa"}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col glass-panel rounded-2xl bg-white border border-white overflow-hidden shadow-xl transition-all duration-300 ${isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileListVisible(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </button>

              {activeChat ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={activeChat.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${activeChat.id}`} className="w-12 h-12 rounded-xl object-cover shadow-sm border-2 border-white bg-white" alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">{activeChat.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                      {activeChat.members?.length || 2} participantes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100/50 rounded-xl"></div>
                  <div><h3 className="text-sm font-bold text-slate-300">Selecione uma conversa</h3></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/20 to-transparent no-scrollbar">
            {!selectedChatId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Bem-vindo ao Chat</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                  Selecione uma conversa ao lado para começar.
                </p>
              </div>
            ) : (
              <>
                {activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                    {msg.senderId !== user?.uid && (
                      <img
                        src={getSenderAvatar(msg.senderId) || avatarUrls[0]}
                        className="w-6 h-6 rounded-full object-cover border border-white shadow-sm mb-1"
                        alt="Sender"
                      />
                    )}
                    <div className={`max-w-[80%] animate-in slide-in-from-bottom-2 duration-300 group relative`}>
                      {replyingTo?.id === msg.id && <div className="text-[10px] text-slate-400 mb-1">Respondendo...</div>}

                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.senderId === user?.uid
                        ? 'bg-[#006c55] text-white rounded-tr-none'
                        : msg.senderId === 'system'
                          ? 'bg-amber-50 border border-amber-200 text-amber-800 mx-auto w-full text-center'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        } ${msg.pinned ? 'ring-2 ring-amber-400' : ''}`}>
                        {renderMessageContent(msg)}

                        <div className={`flex items-center justify-between mt-2 gap-4 ${msg.senderId === user?.uid ? 'text-white/80' : 'text-slate-400'}`}>
                          <span className="text-[9px] font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setReplyingTo(msg)}><SendHorizonal size={12} /></button>
                            <button onClick={() => handlePinMessage(msg.id, msg.pinned)}><Pin size={12} className={msg.pinned ? 'fill-current' : ''} /></button>
                            {msg.senderId === user?.uid && (
                              <>
                                <button onClick={() => { setEditingMessage(msg); setMessageText(msg.text); }}><Edit2 size={12} /></button>
                                <button onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={12} /></button>
                              </>
                            )}
                            <button onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}><Smile size={12} /></button>
                          </div>

                          <div className="flex gap-0.5">
                            {msg.reactions?.map((r, i) => (
                              <span key={i} className="text-[10px] bg-black/10 px-1 rounded hover:bg-black/20 cursor-pointer" onClick={() => handleReaction(msg.id, r.emoji)}>{r.emoji} {r.userIds.length}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {showReactions === msg.id && (
                        <div className="absolute -top-8 left-0 bg-white p-1 rounded-full shadow-lg flex gap-1 animate-in zoom-in">
                          {['👍', '❤️', '😂', '😮', '😢', '👏'].map(e => (
                            <button key={e} onClick={() => { handleReaction(msg.id, e); setShowReactions(null); }} className="hover:scale-125 transition-transform">{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-50 flex items-center gap-3 shrink-0">
            {replyingTo && (
              <div className="absolute bottom-full left-0 w-full bg-slate-50 p-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Respondendo a mensagem...</span>
                <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
              </div>
            )}
            {editingMessage && (
              <div className="absolute bottom-full left-0 w-full bg-blue-50 p-2 border-t border-blue-200 flex justify-between items-center text-xs text-blue-600">
                <span>Editando mensagem...</span>
                <button onClick={() => { setEditingMessage(null); setMessageText(''); }}><X size={14} /></button>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/5 rounded-xl transition-all">
                <Paperclip size={20} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

              <button
                onClick={() => setShowAssignments(!showAssignments)}
                className={`p-2.5 rounded-xl transition-all ${showAssignments ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/5'}`}
              >
                <BookOpen size={20} />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                disabled={!selectedChatId}
                placeholder="Digite sua mensagem..."
                className="w-full min-h-[44px] max-h-32 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all resize-none disabled:opacity-50"
                rows={1}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={(!messageText.trim() && !uploadedFile) || !selectedChatId}
              className="w-12 h-12 bg-[#006c55] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale"
            >
              <Send size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Assignments Panel */}
      {showAssignments && (
        <div className="absolute bottom-20 right-4 w-72 glass-panel rounded-2xl p-4 border border-white/60 shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 z-50 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-[#006c55]" />
              Trabalhos Pendentes
            </h4>
            <button
              onClick={() => setShowAssignments(false)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {assignments.map(assignment => (
              <div key={assignment.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-[#006c55]/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">{assignment.title}</h5>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${assignment.submitted
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                    }`}>
                    {assignment.submitted ? 'Entregue' : 'Pendente'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">{assignment.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{assignment.course}</span>
                  <span>{assignment.dueDate}</span>
                </div>
                <button
                  onClick={() => {
                    handleShareAssignment(assignment);
                    setShowAssignments(false);
                  }}
                  className="w-full text-xs font-bold text-white bg-[#006c55] hover:bg-[#005a46] py-2 rounded-lg transition-all shadow-md shadow-[#006c55]/10 active:scale-95"
                >
                  Compartilhar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Chat Modal (Direct) */}
      {showNewChat && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Iniciar Nova Mensagem</h3>
                <p className="text-sm text-slate-500">Selecione uma conexão para conversar</p>
              </div>
              <button onClick={() => setShowNewChat(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Buscar conexões..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55]"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[300px]">
              {filteredConnections.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhuma conexão encontrada.</p>
              ) : (
                <div className="space-y-1">
                  {filteredConnections.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleStartDirectChat(u)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" alt={u.name} />
                      <div className="flex-1 text-left">
                        <span className="text-sm font-bold text-slate-900 block group-hover:text-[#006c55] transition-colors">{u.name}</span>
                        <span className="text-xs text-slate-500">{u.role || 'Estudante'}</span>
                      </div>
                      <SendHorizonal size={16} className="text-slate-300 group-hover:text-[#006c55] transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Creation Modal */}
      {showGroupCreator && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Criar Novo Grupo</h3>
                <p className="text-sm text-slate-500">Conecte colegas</p>
              </div>
              <button onClick={() => setShowGroupCreator(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Nome do Grupo</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Selecionar Conexões</label>

                {/* Search in Group Modal */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-lg text-base focus:outline-none focus:ring-1 focus:ring-[#006c55]"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                  {filteredConnections.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma conexão encontrada.</p>
                  ) : (
                    filteredConnections.map(u => (
                      <button
                        key={u.id}
                        onClick={() => toggleUserSelection(u.id)}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${selectedUsers.includes(u.id) ? 'bg-[#006c55] text-white' : 'hover:bg-white'}`}
                      >
                        <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} className="w-8 h-8 rounded-lg" alt={u.name} />
                        <span className="text-sm font-medium flex-1 text-left">{u.name}</span>
                        {selectedUsers.includes(u.id) && <CheckCheck size={16} />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowGroupCreator(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold">Cancelar</button>
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-[#006c55] text-white rounded-xl text-sm font-bold">Criar Grupo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensagens;