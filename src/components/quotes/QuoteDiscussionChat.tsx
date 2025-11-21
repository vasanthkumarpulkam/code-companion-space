import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuoteDiscussionChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteRequest: any;
}

export function QuoteDiscussionChat({ open, onOpenChange, quoteRequest }: QuoteDiscussionChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [otherProfile, setOtherProfile] = useState<any>(null);

  const isCustomer = user?.id === quoteRequest?.customer_id;
  const otherUserId = isCustomer ? quoteRequest?.provider_id : quoteRequest?.customer_id;

  useEffect(() => {
    if (open && quoteRequest) {
      fetchMessages();
      fetchOtherProfile();
      subscribeToMessages();
    }
  }, [open, quoteRequest]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchOtherProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', otherUserId)
      .single();
    
    if (data) setOtherProfile(data);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter messages that are between these two users only
      const filteredMessages = data?.filter(
        msg => 
          (msg.sender_id === user?.id && msg.recipient_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.recipient_id === user?.id)
      ) || [];
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`quote-chat-${quoteRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !quoteRequest) return;

    setSendingMessage(true);
    try {
      // We need a job_id for messages, so we'll need to create a placeholder or use the quote_request_id
      // For now, let's create a special format job_id that references the quote
      const pseudoJobId = '00000000-0000-0000-0000-000000000000'; // We'll use a null UUID as placeholder
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: otherUserId,
          job_id: pseudoJobId, // Placeholder - messages table requires this
          content: `[Quote Discussion for "${quoteRequest.title}"]\n${newMessage}`
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      toast({ 
        title: 'Error sending message', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {otherProfile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>Chat with {otherProfile?.full_name || (isCustomer ? 'Provider' : 'Customer')}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Quote Discussion: {quoteRequest?.title}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation about this quote</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => {
                  const isMine = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card
                        className={`max-w-[70%] p-3 ${
                          isMine
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content.replace(/^\[Quote Discussion for "[^"]+"\]\n/, '')}
                        </p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="pt-4 border-t flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingMessage}
            />
            <Button 
              onClick={sendMessage} 
              disabled={sendingMessage || !newMessage.trim()}
              size="icon"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
