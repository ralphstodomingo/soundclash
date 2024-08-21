"use client";
import logoSrc from "@/app/logo.png";
import { SoundclashEvent, VotingSession } from "@/app/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  event: SoundclashEvent;
  activeGame: string;
}

const ANIMATION_DURATION = 300;

export const ActiveGameDisplay = ({ event, activeGame }: Props) => {
  const [isDJ1Animating, setIsDJ1Animating] = useState(false);
  const [isDJ2Animating, setIsDJ2Animating] = useState(false);
  const [allowVoting, setAllowVoting] = useState(false);
  const activeGameDetails = event.games.find((game) => game.id === activeGame);
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);

  console.log(event.id, votingSessions);

  useEffect(() => {
    if (!event) {
      return;
    }
    const supabase = createClient();

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

  const handleDJ1Click = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!allowVoting) {
      return;
    }

    setIsDJ1Animating(true);

    // Remove the class after the animation completes
    setTimeout(() => {
      setIsDJ1Animating(false);
    }, ANIMATION_DURATION); // Duration should match the transition time in your CSS
  };

  const handleDJ2Click = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!allowVoting) {
      return;
    }

    setIsDJ2Animating(true);

    // Remove the class after the animation completes
    setTimeout(() => {
      setIsDJ2Animating(false);
    }, ANIMATION_DURATION); // Duration should match the transition time in your CSS
  };

  if (!activeGameDetails) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gray-100 dark:bg-gray-900 max-w-[600px]">
      {/* Logo at the Top */}
      <div className="w-full">
        <Image
          className="w-full max-h-48 object-cover rounded-md mb-4"
          src={logoSrc}
          alt="Soundclash"
        />
      </div>

      {/* DJ Images and Names */}
      <div className="flex-grow w-full lg:h-3/5">
        <div className="flex justify-center h-full">
          {/* DJ 1 */}
          <div
            className={cn("flex flex-col items-center w-1/2 h-full", {
              "animate-pulse duration-300": isDJ1Animating,
            })}
            onClick={handleDJ1Click}
          >
            <img
              src={activeGameDetails?.dj_1_id.main_image}
              alt="DJ 1"
              className="w-full h-full object-cover"
            />
            <p className="mt-4 mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
              {activeGameDetails?.dj_1_id.name}
            </p>
          </div>

          {/* DJ 2 */}
          <div
            className={cn("flex flex-col items-center w-1/2 h-full", {
              "animate-pulse duration-300": isDJ2Animating,
            })}
            onClick={handleDJ2Click}
          >
            <img
              src={activeGameDetails?.dj_2_id.main_image}
              alt="DJ 2"
              className="w-full h-full object-cover"
            />
            <p className="mt-4 mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
              {activeGameDetails?.dj_2_id.name}
            </p>
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:h-2/5">
        <p className="text-gray-600 dark:text-gray-400">
          Standby for the next voting session!
        </p>
      </div>
    </div>
  );
};
