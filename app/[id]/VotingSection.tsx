import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Emoji, Powerup, VotingSession } from "@/app/types";
import PowerupOverlay from "./PowerupOverlay";
import { Badge } from "@/components/ui/badge";

interface VotingSectionProps {
  votingSessions: VotingSession[];
  lastVotedSession: string | null;
  emojiVotingDone?: boolean;
  emojiVoteCountRemaining: number;
}

const VotingSection = ({
  votingSessions,
  lastVotedSession,
  emojiVoteCountRemaining,
}: VotingSectionProps) => {
  const supabase = createClient();
  console.log(votingSessions);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);

  useEffect(() => {
    const fetchPowerups = async () => {
      const { data, error } = await supabase.from("powerups").select("*");
      if (error) {
        console.error("Error fetching powerups:", error);
      } else {
        setPowerups(data);
      }
    };

    fetchPowerups();
  }, []);

  if (votingSessions.length && lastVotedSession === votingSessions[0].id) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-1/5 flex flex-col justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold text-xl">
          Your vote has been cast!
        </p>
      </div>
    );
  }

  if (!votingSessions.length || lastVotedSession === votingSessions[0].id) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-1/5 flex flex-col justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold text-xl">
          Standby for the next voting session!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-1/5 flex flex-col justify-center">
      {votingSessions[0].winner && (
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold text-xl">
          Click on the SOUNDCLASHER you want to win!
        </p>
      )}
      {votingSessions[0].powerup_id && (
        <>
          <p className="text-gray-600 dark:text-gray-400 text-center font-bold text-xl">
            Which SOUNDCLASHER should get this powerup?
          </p>
          <PowerupOverlay
            powerup={powerups.find(
              (p) => p.id === votingSessions[0].powerup_id
            )}
          />
        </>
      )}
      {votingSessions[0].emoji_id && (
        <div className="flex flex-col justify-center">
          <p className="text-gray-600 dark:text-gray-400 text-center font-bold text-xl mb-4">
            Send love to your favorite SOUNDCLASHER!
          </p>
          <Badge className="mx-auto p-2 px-4 text-lg">
            {emojiVoteCountRemaining}{" "}
            {emojiVoteCountRemaining === 1 ? "vote" : "votes"} left
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VotingSection;
