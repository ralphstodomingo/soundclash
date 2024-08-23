import { Emoji, VotingSession } from "@/app/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";

interface EmojiOverlayProps {
  emojis: Emoji[];
  votingSessions: VotingSession[];
  decrementCount: () => void;
  count: number;
  djNumber: number;
}

const EmojiOverlay = ({
  emojis,
  votingSessions,
  decrementCount,
  count,
  djNumber,
}: EmojiOverlayProps) => {
  console.log("EMOJI", emojis);
  const supabase = createClient();
  const [isAnimating, setIsAnimating] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleEmojiClick = async (emojiId: number) => {
    const activeVotingSession = votingSessions.find(
      (session) => session.emoji_id === emojiId
    );
    if (!activeVotingSession || count <= 0) {
      return;
    }

    setIsAnimating((prev) => ({ ...prev, [emojiId]: true }));

    try {
      const { error } = await supabase.rpc("increment_emoji_vote", {
        emoji_id_param: emojiId,
        voting_session_id: activeVotingSession.id,
        dj_column: `dj_${djNumber}_vote_count`,
      });

      if (error) {
        console.error("Error incrementing emoji vote count:", error);
      } else {
        decrementCount(); // Decrement the count after a successful vote
      }
    } catch (error) {
      console.error("Error during the Supabase request:", error);
    }

    setTimeout(() => {
      setIsAnimating((prev) => ({ ...prev, [emojiId]: false }));
    }, 300); // Assuming 300ms is the animation duration
  };

  if (
    votingSessions.length === 0 ||
    (votingSessions.length > 0 && !votingSessions[0].emoji_id)
  ) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
      {emojis.map((emoji) => (
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white">
          <img
            key={emoji.id}
            src={emoji.image}
            alt={emoji.name}
            className={cn("w-8 h-8 cursor-pointer", {
              "animate-pulse duration-300": isAnimating[emoji.id],
              "filter grayscale": count <= 0,
            })}
            onClick={() => handleEmojiClick(emoji.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default EmojiOverlay;
