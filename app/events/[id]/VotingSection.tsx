import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Emoji, Powerup, VotingSession } from "@/app/types";
import PowerupOverlay from "./PowerupOverlay";

interface VotingSectionProps {
  votingSessions: VotingSession[];
  lastVotedSession: string | null;
  emojiVotingDone?: boolean;
}

const VotingSection = ({
  votingSessions,
  lastVotedSession,
}: VotingSectionProps) => {
  const supabase = createClient();
  console.log(votingSessions);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);

  useEffect(() => {
    // Fetch emojis
    const fetchEmojis = async () => {
      const { data, error } = await supabase.from("emojis").select("*");
      if (error) {
        console.error("Error fetching emojis:", error);
      } else {
        setEmojis(data);
      }
    };

    // Fetch powerups
    const fetchPowerups = async () => {
      const { data, error } = await supabase.from("powerups").select("*");
      if (error) {
        console.error("Error fetching powerups:", error);
      } else {
        setPowerups(data);
      }
    };

    fetchEmojis();
    fetchPowerups();
  }, []); // Empty dependency array ensures this runs only once on component mount

  if (!votingSessions.length || lastVotedSession === votingSessions[0].id) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:h-2/5">
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold">
          Standby for the next voting session!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:h-2/5">
      {votingSessions[0].winner && (
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold">
          Click on the DJ you want to win!
        </p>
      )}
      {votingSessions[0].powerup_id && (
        <>
          <p className="text-gray-600 dark:text-gray-400 text-center font-bold">
            Which DJ should get this powerup?
          </p>
          <PowerupOverlay
            powerup={powerups.find(
              (p) => p.id === votingSessions[0].powerup_id
            )}
          />
        </>
      )}
      {votingSessions[0].emoji_id && (
        <p className="text-gray-600 dark:text-gray-400 text-center font-bold">
          Send love to your favorite DJ!
        </p>
      )}
    </div>
  );
};

export default VotingSection;
