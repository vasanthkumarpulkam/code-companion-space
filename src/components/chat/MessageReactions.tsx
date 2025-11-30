import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  reactions: {
    id: string;
    user_id: string;
    emoji: string;
  }[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '👏', '🔥', '✅'];

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const [open, setOpen] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        userIds: [],
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].userIds.push(reaction.user_id);
    return acc;
  }, {} as Record<string, { count: number; userIds: string[] }>);

  const handleEmojiClick = (emoji: string) => {
    const userReacted = groupedReactions[emoji]?.userIds.includes(currentUserId);
    
    if (userReacted) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, { count, userIds }]) => (
        <Button
          key={emoji}
          variant={userIds.includes(currentUserId) ? 'default' : 'secondary'}
          size="sm"
          className="h-6 px-2 text-xs gap-1"
          onClick={() => handleEmojiClick(emoji)}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                className="h-10 text-xl hover:bg-accent"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
