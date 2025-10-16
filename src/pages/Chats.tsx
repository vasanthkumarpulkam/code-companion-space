import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip } from 'lucide-react';

export default function Chats() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

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

    const { data } = await supabase
      .from('messages')
      .select('job_id, jobs(title), sender_id, recipient_id, profiles!messages_sender_id_fkey(full_name), profiles!messages_recipient_id_fkey(full_name)')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      // Group by job_id and get unique threads
      const uniqueThreads = data.reduce((acc: any[], msg: any) => {
        if (!acc.find(t => t.job_id === msg.job_id)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      setThreads(uniqueThreads);
    }
  };

  const fetchMessages = async (jobId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name)')
      .eq('job_id', jobId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;

    const thread = threads.find(t => t.job_id === selectedThread);
    const recipientId = thread.sender_id === user.id ? thread.recipient_id : thread.sender_id;

    const { error } = await supabase.from('messages').insert({
      job_id: selectedThread,
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
                {threads.map((thread) => (
                  <button
                    key={thread.job_id}
                    onClick={() => setSelectedThread(thread.job_id)}
                    className={`w-full p-3 rounded-lg text-left hover:bg-accent transition-colors ${
                      selectedThread === thread.job_id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {thread.sender_id === user?.id
                            ? thread.profiles?.full_name?.[0] || 'U'
                            : thread.profiles?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{thread.jobs?.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.sender_id === user?.id
                            ? thread.profiles?.full_name
                            : thread.profiles?.full_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
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
