"use client";
import logoSrc from "@/app/logo-white.png";
import { Emoji, SoundclashEvent, VotingSession } from "@/app/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import VotingSection from "./VotingSection";
import EmojiOverlay from "./EmojiOverlay";

interface Props {
  event: SoundclashEvent;
  activeGame: string;
  decrementVotingCount: () => void;
  emojiVoteCountRemaining: number;
}

const ANIMATION_DURATION = 300;

export const ActiveGameDisplay = ({
  event,
  activeGame,
  decrementVotingCount,
  emojiVoteCountRemaining,
}: Props) => {
  const supabase = createClient();
  const [isDJ1Animating, setIsDJ1Animating] = useState(false);
  const [isDJ2Animating, setIsDJ2Animating] = useState(false);
  const [allowVoting, setAllowVoting] = useState(false);
  const [lastVotedSession, setLastVotedSession] = useState<string | null>(null); // for winner/powerups only
  const activeGameDetails = event.games.find((game) => game.id === activeGame);
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [lastVotedDJ, setLastVotedDJ] = useState<number | null>(null);

  const activeVotingSessions = useMemo(
    () => votingSessions.filter((votingSession) => !votingSession.concluded),
    [votingSessions]
  );

  useEffect(() => {
    if (activeVotingSessions.length) {
      if (!activeVotingSessions[0].emoji_id) {
        setAllowVoting(true);
      }
    } else {
      setAllowVoting(false);
    }
  }, [activeVotingSessions]);

  useEffect(() => {
    const fetchEmojis = async () => {
      const { data, error } = await supabase.from("emoji").select("*");
      if (error) {
        console.error("Error fetching emojis:", error);
      } else {
        setEmojis(data);
      }
    };

    fetchEmojis();
  }, []);

  useEffect(() => {
    if (!event) {
      return;
    }

    const fetchVotingSessions = async () => {
      const { data, error } = await supabase
        .from("voting_session")
        .select("*, games!inner(*)")
        .eq("games.id", activeGame);

      if (data) {
        setVotingSessions(data);
      }
      if (error) {
        console.error("Error fetching voting sessions:", error);
      }
    };

    fetchVotingSessions();

    const votingSessionSubscription = supabase
      .channel("voting_session_changes")
      .on<VotingSession>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "voting_session",
          filter: `game_id=eq.${activeGame}`,
        },
        (payload) => {
          setVotingSessions((prevSessions) => [...prevSessions, payload.new]);
          setLastVotedDJ(null);
        }
      )
      .on<VotingSession>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voting_session",
          filter: `game_id=eq.${activeGame}`,
        },
        (payload) => {
          setVotingSessions((prevSessions) =>
            prevSessions.map((session) =>
              session.id === payload.new.id ? payload.new : session
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votingSessionSubscription);
    };
  }, [event, activeGame]);

  const handleDJ1Click = async (event: React.MouseEvent<HTMLImageElement>) => {
    if (
      !allowVoting ||
      lastVotedSession === activeVotingSessions[0].id ||
      isDJ2Animating
    ) {
      return;
    }
    setIsDJ1Animating(true);

    try {
      const { error } = await supabase.rpc("increment_dj_1_vote", {
        voting_session_id: activeVotingSessions[0].id,
      });

      if (error) {
        console.error("Error incrementing DJ1 vote count:", error);
      } else {
        setLastVotedSession(activeVotingSessions[0].id);
        setLastVotedDJ(1);
      }
    } catch (error) {
      console.error("Error during the Supabase request:", error);
    }

    setTimeout(() => {
      setIsDJ1Animating(false);
    }, ANIMATION_DURATION);
  };

  const handleDJ2Click = async (event: React.MouseEvent<HTMLImageElement>) => {
    if (
      !allowVoting ||
      lastVotedSession === activeVotingSessions[0].id ||
      isDJ1Animating
    ) {
      return;
    }

    setIsDJ2Animating(true);

    try {
      const { error } = await supabase.rpc("increment_dj_2_vote", {
        voting_session_id: activeVotingSessions[0].id,
      });

      if (error) {
        console.error("Error incrementing DJ2 vote count:", error);
      } else {
        setLastVotedSession(activeVotingSessions[0].id);
        setLastVotedDJ(2);
      }
    } catch (error) {
      console.error("Error during the Supabase request:", error);
    }

    setTimeout(() => {
      setIsDJ2Animating(false);
    }, ANIMATION_DURATION);
  };

  if (!activeGameDetails) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-zinc-100 dark:bg-zinc-900 max-w-[600px] px-4 pb-8">
      {/* Logo at the Top */}
      <div className="w-full">
        <Image
          className="w-full max-h-48 object-cover rounded-md mb-4 filter-invert"
          src={logoSrc}
          alt="Soundclash"
        />
      </div>

      {/* Voting Section */}
      <VotingSection
        votingSessions={activeVotingSessions}
        lastVotedSession={lastVotedSession}
        emojiVoteCountRemaining={emojiVoteCountRemaining}
      />

      {/* DJ Images and Names */}
      <div className="flex-grow w-full lg:h-3/5 mt-4">
        <div className="flex justify-center h-full space-x-4">
          {/* DJ 1 */}
          <div
            className={cn(
              "relative flex flex-col items-center w-1/2 h-full p-2 bg-white rounded-lg shadow-lg border-2 border-white",
              {
                "animate-pulse duration-300": isDJ1Animating,
                "border-4 border-green-500": lastVotedDJ === 1,
              }
            )}
            onClick={handleDJ1Click}
          >
            <img
              src={activeGameDetails?.dj_1_id.main_image}
              alt="DJ 1"
              className={cn("w-full h-full object-cover rounded-lg", {
                "filter grayscale":
                  !allowVoting ||
                  activeVotingSessions.length === 0 ||
                  lastVotedSession === activeVotingSessions[0].id,
              })}
            />
            <p className="my-4 text-xl font-semibold text-gray-800">
              {activeGameDetails?.dj_1_id.name}
            </p>
            <EmojiOverlay
              emojis={emojis}
              votingSessions={activeVotingSessions}
              decrementCount={decrementVotingCount}
              count={emojiVoteCountRemaining}
              djNumber={1}
            />
          </div>

          {/* DJ 2 */}
          <div
            className={cn(
              "relative flex flex-col items-center w-1/2 h-full p-2 bg-white rounded-lg shadow-lg border-2 border-white",
              {
                "animate-pulse duration-300": isDJ2Animating,
                "border-4 border-green-500": lastVotedDJ === 2,
              }
            )}
            onClick={handleDJ2Click}
          >
            <img
              src={activeGameDetails?.dj_2_id.main_image}
              alt="DJ 2"
              className={cn("w-full h-full object-cover rounded-lg", {
                "filter grayscale":
                  !allowVoting ||
                  activeVotingSessions.length === 0 ||
                  lastVotedSession === activeVotingSessions[0].id,
              })}
            />
            <p className="my-4 text-xl font-semibold text-gray-800">
              {activeGameDetails?.dj_2_id.name}
            </p>
            <EmojiOverlay
              emojis={emojis}
              votingSessions={activeVotingSessions}
              decrementCount={decrementVotingCount}
              count={emojiVoteCountRemaining}
              djNumber={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
