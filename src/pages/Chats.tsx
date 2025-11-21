import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip } from 'lucide-react';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

export default function Chats() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleMessageReceived = useCallback(() => {
    fetchThreads();
    if (selectedThread) {
      fetchMessages(selectedThread);
    }
  }, [selectedThread]);

  // Real-time message updates
  useRealtimeMessages(handleMessageReceived);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread);
    }
  }, [selectedThread]);

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
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;

    const thread = threads.find(t => (t.job_id || t.quote_request_id) === selectedThread);
    if (!thread) return;

    const recipientId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;
    const isJobThread = !!thread.job_id;

    const { error } = await supabase.from('messages').insert({
      ...(isJobThread ? { job_id: selectedThread } : { quote_request_id: selectedThread }),
      sender_id: user.id,
      recipient_id: recipientId,
      content: newMessage,
    });

    if (!error) {
      setNewMessage('');
      fetchMessages(selectedThread);
    }
  };

  return (
    <div className="container max-w-7xl py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

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
                      <Avatar>
                        <AvatarFallback>
                          {thread.otherUserName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
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
                    {messages.map((message) => (
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
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <CardContent className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage}>
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
    </div>
  );
}
