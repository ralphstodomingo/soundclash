"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function TimerPage({
  params,
}: {
  params: { gameId: string; djNumber: string };
}) {
  const supabase = createClient();
  const [dj1Time, setDj1Time] = useState<Date | null>(null);
  const [dj2Time, setDj2Time] = useState<Date | null>(null);
  const [dj1Remaining, setDj1Remaining] = useState("00:00");
  const [dj2Remaining, setDj2Remaining] = useState("00:00");

  // Function to format time remaining
  const formatTimeRemaining = (endTime: Date | null) => {
    if (!endTime) return "00:00";
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const minutes = Math.max(Math.floor(diff / 60000), 0);
    const seconds = Math.max(Math.floor((diff % 60000) / 1000), 0);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Fetch the initial timer data from Supabase
  useEffect(() => {
    const fetchTimers = async () => {
      const { data, error } = await supabase
        .from("game_timers")
        .select("dj_1_end_time, dj_2_end_time")
        .eq("game_id", params.gameId)
        .single();

      if (data) {
        setDj1Time(new Date(data.dj_1_end_time));
        setDj2Time(new Date(data.dj_2_end_time));
      } else if (error) {
        console.error("Error fetching timers:", error);
      }
    };

    fetchTimers();

    // Realtime subscription for timer updates
    const timerSubscription = supabase
      .channel("game_timers_channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_timers",
          filter: `game_id=eq.${params.gameId}`,
        },
        (payload) => {
          const updatedData = payload.new;
          setDj1Time(new Date(updatedData.dj_1_end_time));
          setDj2Time(new Date(updatedData.dj_2_end_time));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(timerSubscription);
    };
  }, [params]);

  // Update the remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDj1Remaining(formatTimeRemaining(dj1Time));
      setDj2Remaining(formatTimeRemaining(dj2Time));
    }, 1000);

    return () => clearInterval(interval);
  }, [dj1Time, dj2Time]);

  // Conditional layout to ensure the larger timer is always on the same side
  const isDJ1 = params.djNumber === "1";

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen p-4 space-y-4">
      {/* Timers Display */}
      <div className="flex flex-col lg:flex-row justify-between w-full h-full space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Conditionally render timers based on the DJ number */}
        {isDJ1 ? (
          <>
            {/* DJ 1 Timer */}
            <div
              className={cn(
                "flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-700 p-8 rounded-md",
                "w-full h-3/4 lg:h-full lg:w-2/3"
              )}
            >
              <div className="text-3xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                Your Timer
              </div>
              <div className="text-8xl lg:text-9xl">{dj1Remaining}</div>
            </div>

            {/* DJ 2 Timer */}
            <div
              className={cn(
                "flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-700 p-8 rounded-md",
                "w-full h-1/4 lg:h-full lg:w-1/3"
              )}
            >
              <div className="text-lg text-gray-800 dark:text-gray-200 mb-2">
                Their Timer
              </div>
              <div className="text-4xl lg:text-6xl">{dj2Remaining}</div>
            </div>
          </>
        ) : (
          <>
            {/* DJ 2 Timer */}
            <div
              className={cn(
                "flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-700 p-8 rounded-md",
                "w-full h-3/4 lg:h-full lg:w-2/3"
              )}
            >
              <div className="text-3xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                Your Timer
              </div>
              <div className="text-8xl lg:text-9xl">{dj2Remaining}</div>
            </div>

            {/* DJ 1 Timer */}
            <div
              className={cn(
                "flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-700 p-8 rounded-md",
                "w-full h-1/4 lg:h-full lg:w-1/3"
              )}
            >
              <div className="text-lg text-gray-800 dark:text-gray-200 mb-2">
                Their Timer
              </div>
              <div className="text-4xl lg:text-6xl">{dj1Remaining}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}