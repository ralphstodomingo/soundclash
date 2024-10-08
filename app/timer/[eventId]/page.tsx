"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SoundclashEvent } from "@/app/types";
import { createClient } from "@/utils/supabase/client";

export default function TimerPage({
  params,
}: {
  params: {
    eventId:
      | "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d"
      | "be937b71-7db6-4b4e-8c86-9e706a307078"
      | "91c1eb0c-1741-47d8-9e5b-f5422a00a34a"
      | "a4b45e91-8f22-4d3a-be2a-348cec412142";
  };
}) {
  const supabase = createClient();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [event, setEvent] = useState<SoundclashEvent | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isDJ1Turn, setIsDJ1Turn] = useState(true);
  const [dj1TurnCount, setDj1TurnCount] = useState(0);
  const [dj2TurnCount, setDj2TurnCount] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const config = {
    "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d": {
      games: [
        {
          id: "9fe0ea37-97d5-4fee-8ff0-5d3893722cd9",
          totalGameLength: 60 * 60, // 60 minutes
          turnLength: 5 * 60, // 5 minutes per turn
          totalTurns: 12, // 12 turns (6 per half)
          halftime: 10 * 60, // 10 minutes halftime
          soundclashers: ["Mez Mauve", "Manu Miran"],
        },
      ],
    },
    "be937b71-7db6-4b4e-8c86-9e706a307078": {
      games: [
        {
          id: "40bad8c6-d246-4110-ad17-cb76dd7efe93",
          totalGameLength: 30 * 60, // 30 minutes
          turnLength: 3 * 60, // 3 minutes per turn
          totalTurns: 10, // 10 turns
          halftime: 0, // No halftime
          soundclashers: ["LVY", "Shigecki"],
        },
        {
          id: "1c95ec09-0bbe-47f7-a0b0-43b2401ef21d",
          totalGameLength: 64 * 60, // 64 minutes
          turnLength: 4 * 60, // 4 minutes per turn
          totalTurns: 16, // 16 turns (8 per half)
          halftime: 15 * 60, // 15 minutes halftime
          soundclashers: ["Umbra Abra", "Mapa Mota"],
        },
      ],
    },
    "91c1eb0c-1741-47d8-9e5b-f5422a00a34a": {
      games: [
        {
          id: "0c069d54-045c-4d1c-9e34-2ffda76515a1",
          totalGameLength: 30 * 60, // 30 minutes
          turnLength: 3 * 60, // 3 minutes per turn
          totalTurns: 10, // 10 turns
          halftime: 0, // No halftime
          soundclashers: ["LVY", "Shigecki"],
        },
        {
          id: "5dc6b367-c67a-41d9-b5df-e93d9613c811",
          totalGameLength: null, // X minutes (calculated dynamically)
          turnLength: [8 * 60, 7 * 60, 6 * 60, 5 * 60, 4 * 60, 3 * 60, 2 * 60], // Ramped turn lengths
          totalTurns: 14, // 14 turns
          halftime: 0, // No halftime
          soundclashers: ["Dukane", "Rivussy"],
        },
      ],
    },
    "a4b45e91-8f22-4d3a-be2a-348cec412142": {
      games: [
        {
          id: "3a0fab3f-f4dc-48ba-b8e8-f35e8913a55d",
          totalGameLength: 30, // 30 seconds
          turnLength: 5, // 5 seconds per turn
          totalTurns: 6, // 6 turns
          halftime: 0, // No halftime
          soundclashers: ["LVY", "Shigecki"],
        },
        {
          id: "03c4b2f7-8db0-4771-8d53-07f12c7c85b6",
          totalGameLength: null, // X minutes (calculated dynamically)
          turnLength: [5, 4, 3, 2, 1, 1, 1], // Ramped turn lengths (5 to 1 seconds)
          totalTurns: 6, // 7 turns
          halftime: 0, // No halftime
          soundclashers: ["Dukane", "Rivussy"],
        },
      ],
    },
  };
  
  const currentGameConfig = config[params.eventId]?.games.find(
    (game) => game.id === activeGame
  );

  useEffect(() => {
    const fetchEventData = async () => {
      const { data: event } = await supabase
        .from("events")
        .select(
          "description, subtitle, games(id, game_image, dj_1_id(id, name, main_image), dj_2_id(id, name, main_image))"
        )
        .eq("id", params.eventId)
        .single<SoundclashEvent>();

      if (event) {
        setEvent(event);
        if (!activeGame && event.games.length > 0) {
          setActiveGame(event.games[0].id);
        }
      }
    };

    const fetchActiveGame = async () => {
      const { data } = await supabase
        .from("event_games")
        .select("active_game")
        .eq("event_id", params.eventId)
        .single();

      if (data && data.active_game !== activeGame) {
        setActiveGame(data.active_game);
        setDj1TurnCount(0);
        setDj2TurnCount(0);
        setIsDJ1Turn(true); // Ensure we start with DJ1's turn
        setGameFinished(false); // Reset game finished state
      }
    };

    fetchEventData();
    fetchActiveGame();

    const activeGameSubscription = supabase
      .channel("active_game_channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "event_games",
          filter: `event_id=eq.${params.eventId}`,
        },
        (payload) => {
          const updatedActiveGame = payload.new.active_game;
          if (updatedActiveGame !== activeGame) {
            setActiveGame(updatedActiveGame);
            setDj1TurnCount(0);
            setDj2TurnCount(0);
            setIsDJ1Turn(true); // Reset to DJ1's turn
            setGameFinished(false); // Reset game finished state
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activeGameSubscription);
    };
  }, [params.eventId]);

  useEffect(() => {
    if (!currentGameConfig || !activeGame || gameFinished) return;

    let interval: NodeJS.Timeout;

    const currentTurnLength = Array.isArray(currentGameConfig.turnLength)
      ? currentGameConfig.turnLength[isDJ1Turn ? dj1TurnCount : dj2TurnCount]
      : currentGameConfig.turnLength;

    if (!endTime) {
      const calculatedEndTime = Date.now() + currentTurnLength * 1000;
      setEndTime(calculatedEndTime);
    }

    const updateTimer = () => {
      if (!endTime) return;

      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);

      if (timeLeft <= 0) {
        clearInterval(interval);

        if (isDJ1Turn) {
          if (dj1TurnCount + 1 >= currentGameConfig.totalTurns / 2) {
            setGameFinished(true);
            return;
          }
          setDj1TurnCount((prev) => prev + 1);
          setIsDJ1Turn(false); // Switch to DJ2
        } else {
          if (dj2TurnCount + 1 >= currentGameConfig.totalTurns / 2) {
            setGameFinished(true);
            return;
          }
          setDj2TurnCount((prev) => prev + 1);
          setIsDJ1Turn(true); // Switch back to DJ1
        }

        setEndTime(null); // Reset the endTime for the next turn
      } else {
        setRemainingTime(timeLeft);
      }
    };

    interval = setInterval(updateTimer, 1000);
    updateTimer(); // Run initially to avoid a 1s delay

    return () => clearInterval(interval);
  }, [activeGame, dj1TurnCount, dj2TurnCount, currentGameConfig, isDJ1Turn, endTime, gameFinished]);

  const formattedTime = `${Math.floor(remainingTime / 60000)
    .toString()
    .padStart(2, "0")}:${Math.floor((remainingTime % 60000) / 1000)
    .toString()
    .padStart(2, "0")}`;

  if (!currentGameConfig) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          No active game.
        </p>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Game finished.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen p-4 space-y-4 bg-zinc-100 dark:bg-zinc-900">
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {currentGameConfig.soundclashers[0]} vs{" "}
        {currentGameConfig.soundclashers[1]}
      </div>

      <div className="flex flex-col lg:flex-row justify-between w-full h-full space-y-4 lg:space-y-0 lg:space-x-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center bg-white dark:bg-zinc-700 p-8 rounded-md shadow-lg",
            "w-full lg:w-1/2 h-1/2"
          )}
        >
          <div className="text-3xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            {currentGameConfig.soundclashers[0]}'s Timer
          </div>
          <div className="text-8xl lg:text-9xl font-bold text-green-500">
            {isDJ1Turn ? formattedTime : "00:00"}
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Turn {dj1TurnCount + 1} / {currentGameConfig.totalTurns / 2}
          </p>
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center bg-white dark:bg-zinc-700 p-8 rounded-md shadow-lg",
            "w-full lg:w-1/2 h-1/2"
          )}
        >
          <div className="text-3xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            {currentGameConfig.soundclashers[1]}'s Timer
          </div>
          <div className="text-8xl lg:text-9xl font-bold text-green-500">
            {!isDJ1Turn ? formattedTime : "00:00"}
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Turn {dj2TurnCount + 1} / {currentGameConfig.totalTurns / 2}
          </p>
        </div>
      </div>
    </div>
  );
}