import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Image as ImageIcon, X, Search, Edit2, Trash2, Check, Mic, Square } from 'lucide-react';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Chats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessageReceived = useCallback(() => {
    fetchThreads();
    if (selectedThread) {
      fetchMessages(selectedThread);
    }
    fetchUnreadCounts();
  }, [selectedThread]);

  // Real-time message updates
  useRealtimeMessages(handleMessageReceived);

  useEffect(() => {
    if (user) {
      fetchThreads();
      fetchUnreadCounts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread);
      markThreadAsRead(selectedThread);
    }
  }, [selectedThread]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up typing indicator presence
  useEffect(() => {
    if (!user || !selectedThread) return;

    const thread = threads.find(t => (t.job_id || t.quote_request_id) === selectedThread);
    if (!thread) return;

    const otherUserId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;
    const channelName = `typing:${selectedThread}`;

    const channel = supabase.channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherUserState = state[otherUserId] as any[];
        setOtherUserTyping(otherUserState?.[0]?.typing === true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread, user, threads]);

  const fetchThreads = async () => {
    if (!user) return;

    // Fetch all messages for the user
    const { data: messagesData } = await supabase
      .from('messages')
      .select('id, job_id, quote_request_id, sender_id, recipient_id, content, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!messagesData || messagesData.length === 0) {
      setThreads([]);
      return;
    }

    // Group by job_id or quote_request_id to get unique threads
    const uniqueThreads = messagesData.reduce((acc: any[], msg: any) => {
      const threadKey = msg.job_id || msg.quote_request_id;
      if (!acc.find(t => (t.job_id || t.quote_request_id) === threadKey)) {
        acc.push(msg);
      }
      return acc;
    }, []);

    // Fetch related data for each thread
    const threadsWithData = await Promise.all(
      uniqueThreads.map(async (thread) => {
        // Get other user profile
        const otherUserId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherUserId)
          .single();

        // Get job or quote title
        let title = 'Conversation';
        if (thread.job_id) {
          const { data: job } = await supabase
            .from('jobs')
            .select('title')
            .eq('id', thread.job_id)
            .single();
          title = job?.title || 'Job Discussion';
        } else if (thread.quote_request_id) {
          const { data: quote } = await supabase
            .from('quote_requests')
            .select('title')
            .eq('id', thread.quote_request_id)
            .single();
          title = quote?.title || 'Quote Discussion';
        }

        return {
          ...thread,
          otherUserName: profile?.full_name || 'User',
          title,
        };
      })
    );

    setThreads(threadsWithData);
  };

  const fetchUnreadCounts = async () => {
    if (!user) return;

    const { data: messagesData } = await supabase
      .from('messages')
      .select('job_id, quote_request_id')
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (messagesData) {
      const counts: Record<string, number> = {};
      messagesData.forEach((msg) => {
        const threadKey = msg.job_id || msg.quote_request_id;
        counts[threadKey] = (counts[threadKey] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .or(`job_id.eq.${threadId},quote_request_id.eq.${threadId}`);

    setUnreadCounts(prev => ({ ...prev, [threadId]: 0 }));
  };

  const fetchMessages = async (threadId: string) => {
    if (!user) return;

    // Find the thread to determine if it's a job or quote
    const thread = threads.find(t => (t.job_id || t.quote_request_id) === threadId);
    if (!thread) return;

    const isJobThread = !!thread.job_id;
    const { data } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name)')
      .eq(isJobThread ? 'job_id' : 'quote_request_id', threadId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const handleTyping = () => {
    if (!user || !selectedThread) return;

    setIsTyping(true);
    const channelName = `typing:${selectedThread}`;
    const channel = supabase.channel(channelName);
    
    channel.track({ typing: true, user_id: user.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      channel.untrack();
    }, 2000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || (!newMessage.trim() && !uploadedFile)) return;

    const thread = threads.find(t => (t.job_id || t.quote_request_id) === selectedThread);
    if (!thread) return;

    const recipientId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;
    const isJobThread = !!thread.job_id;

    let mediaUrl: string | null = null;
    if (uploadedFile) {
      mediaUrl = await uploadFile(uploadedFile);
      if (!mediaUrl) return; // Upload failed
    }

    const { error } = await supabase.from('messages').insert({
      ...(isJobThread ? { job_id: selectedThread } : { quote_request_id: selectedThread }),
      sender_id: user.id,
      recipient_id: recipientId,
      content: newMessage.trim() || '📎 Attachment',
      media_url: mediaUrl,
    });

    if (!error) {
      setNewMessage('');
      setUploadedFile(null);
      setUploadPreview(null);
      fetchMessages(selectedThread);
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
    }
  };

  const startEditMessage = (message: any) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const saveEdit = async (messageId: string) => {
    if (!editingContent.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const originalMessage = messages.find(m => m.id === messageId);
    
    const { error } = await supabase
      .from('messages')
      .update({
        content: editingContent.trim(),
        edited_at: new Date().toISOString(),
        original_content: originalMessage?.original_content || originalMessage?.content,
      })
      .eq('id', messageId);

    if (!error) {
      setEditingMessageId(null);
      setEditingContent('');
      if (selectedThread) {
        fetchMessages(selectedThread);
      }
      toast({
        title: 'Message updated',
        description: 'Your message has been edited',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (!error) {
      if (selectedThread) {
        fetchMessages(selectedThread);
      }
      toast({
        title: 'Message deleted',
        description: 'Your message has been removed',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
    setDeletingMessageId(null);
  };

  const filteredMessages = messages.filter(message => {
    if (!searchQuery.trim()) return true;
    return message.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Recording started',
        description: 'Speak your message',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to send voice messages',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !selectedThread) return;

    const thread = threads.find(t => (t.job_id || t.quote_request_id) === selectedThread);
    if (!thread) return;

    const recipientId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;
    const isJobThread = !!thread.job_id;

    // Upload audio file
    const fileExt = 'webm';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(fileName, audioBlob);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload voice message',
        variant: 'destructive',
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(data.path);

    // Send message with audio
    const { error } = await supabase.from('messages').insert({
      ...(isJobThread ? { job_id: selectedThread } : { quote_request_id: selectedThread }),
      sender_id: user.id,
      recipient_id: recipientId,
      content: '🎤 Voice message',
      media_url: publicUrl,
    });

    if (!error) {
      fetchMessages(selectedThread);
      toast({
        title: 'Voice message sent',
        description: `${recordingTime}s recording sent`,
      });
    } else {
      toast({
        title: 'Send failed',
        description: 'Failed to send voice message',
        variant: 'destructive',
      });
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        {selectedThread && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      <Card className="h-[600px]">
        <div className="grid grid-cols-12 h-full">
          {/* Thread List */}
          <div className="col-span-4 border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {threads.map((thread) => {
                  const threadId = thread.job_id || thread.quote_request_id;
                  const threadTitle = thread.jobs?.title || thread.quote_requests?.title || 'Conversation';
                  return (
                  <button
                    key={threadId}
                    onClick={() => setSelectedThread(threadId)}
                    className={`w-full p-3 rounded-lg text-left hover:bg-accent transition-colors ${
                      selectedThread === threadId ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            {thread.otherUserName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {unreadCounts[threadId] > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCounts[threadId] > 9 ? '9+' : unreadCounts[threadId]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{thread.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.otherUserName}
                        </p>
                      </div>
                    </div>
                  </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedThread ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.media_url && (
                            <div className="mb-2">
                              {message.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img 
                                  src={message.media_url} 
                                  alt="Shared media" 
                                  className="rounded max-h-64 w-auto"
                                />
                              ) : message.media_url.match(/\.(webm|mp3|ogg|wav|m4a)$/i) || message.content === '🎤 Voice message' ? (
                                <audio 
                                  controls 
                                  className="max-w-full"
                                  preload="metadata"
                                >
                                  <source src={message.media_url} type="audio/webm" />
                                  <source src={message.media_url} type="audio/mpeg" />
                                  Your browser does not support audio playback.
                                </audio>
                              ) : (
                                <a 
                                  href={message.media_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 underline"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  View attachment
                                </a>
                              )}
                            </div>
                          )}
                          
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    saveEdit(message.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEdit();
                                  }
                                }}
                                className="bg-background"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveEdit(message.id)}>
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <p className="flex-1">{message.content}</p>
                                {message.sender_id === user?.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 opacity-50 hover:opacity-100"
                                      >
                                        <span className="text-xs">⋮</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => startEditMessage(message)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setDeletingMessageId(message.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs opacity-70">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </p>
                                {message.edited_at && (
                                  <span className="text-xs opacity-60 italic">(edited)</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {otherUserTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <CardContent className="border-t p-4">
                  {uploadPreview && (
                    <div className="mb-3 relative inline-block">
                      <img 
                        src={uploadPreview} 
                        alt="Upload preview" 
                        className="max-h-32 rounded border"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadPreview(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {uploadedFile && !uploadPreview && (
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <Paperclip className="h-4 w-4" />
                      <span>{uploadedFile.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setUploadedFile(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {isRecording && (
                    <div className="mb-3 flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-3 w-3 bg-destructive rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording...</span>
                        <span className="text-sm text-muted-foreground">{formatRecordingTime(recordingTime)}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopRecording}
                      >
                        <Square className="h-4 w-4 mr-1 fill-current" />
                        Stop
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRecording}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'bg-destructive/10' : ''}
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? 'text-destructive' : ''}`} />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={isRecording}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={(!newMessage.trim() && !uploadedFile) || isRecording}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={!!deletingMessageId} onOpenChange={() => setDeletingMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingMessageId && deleteMessage(deletingMessageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
