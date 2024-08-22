import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import React, { useState, useEffect } from "react";

interface DashboardTimerControlProps {
  activeGame: string;
}

const DashboardTimerControl = ({ activeGame }: DashboardTimerControlProps) => {
  const supabase = createClient();

  const [minutesToAdd, setMinutesToAdd] = useState(0);
  const [secondsToAdd, setSecondsToAdd] = useState(0);
  const [dj1Time, setDj1Time] = useState<Date | null>(null);
  const [dj2Time, setDj2Time] = useState<Date | null>(null);
  const [dj1Remaining, setDj1Remaining] = useState("00:00");
  const [dj2Remaining, setDj2Remaining] = useState("00:00");

  // Fetch the initial timer data from Supabase
  useEffect(() => {
    const fetchTimers = async () => {
      const { data, error } = await supabase
        .from("game_timers")
        .select("dj_1_end_time, dj_2_end_time")
        .eq("game_id", activeGame)
        .single();

      if (data) {
        setDj1Time(new Date(data.dj_1_end_time));
        setDj2Time(new Date(data.dj_2_end_time));
      } else if (error) {
        console.error("Error fetching timers:", error);
      }
    };

    fetchTimers();
  }, [activeGame]);

  // Function to add time to the selected DJ
  const addTime = async (dj: number) => {
    const now = new Date();
    const totalMillisecondsToAdd = minutesToAdd * 60000 + secondsToAdd * 1000;
    const newEndTime = new Date(now.getTime() + totalMillisecondsToAdd);

    if (dj === 1) {
      const { error } = await supabase
        .from("game_timers")
        .update({ dj_1_end_time: newEndTime.toISOString() })
        .eq("game_id", activeGame);

      if (!error) {
        setDj1Time(newEndTime);
      } else {
        console.error("Error updating DJ 1 timer:", error);
      }
    } else if (dj === 2) {
      const { error } = await supabase
        .from("game_timers")
        .update({ dj_2_end_time: newEndTime.toISOString() })
        .eq("game_id", activeGame);

      if (!error) {
        setDj2Time(newEndTime);
      } else {
        console.error("Error updating DJ 2 timer:", error);
      }
    }
  };

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

  // Update the remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDj1Remaining(formatTimeRemaining(dj1Time));
      setDj2Remaining(formatTimeRemaining(dj2Time));
    }, 1000);

    return () => clearInterval(interval);
  }, [dj1Time, dj2Time]);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h3 className="text-2xl font-bold mb-4">Timers</h3>
      {/* Time Input */}
      <div className="flex items-center space-x-2">
        <Label className="text-gray-700 dark:text-gray-300">Set Time:</Label>
        <Input
          type="number"
          className="w-16 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          placeholder="Minutes"
          value={minutesToAdd}
          onChange={(e) => setMinutesToAdd(Number(e.target.value))}
        />
        <Input
          type="number"
          className="w-16 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          placeholder="Seconds"
          value={secondsToAdd}
          onChange={(e) => setSecondsToAdd(Number(e.target.value))}
        />
      </div>

      {/* DJ Buttons */}
      <div className="flex space-x-4">
        <Button
          className="text-white px-4 py-2 rounded-md"
          onClick={() => addTime(1)}
        >
          Set for DJ 1
        </Button>
        <Button
          className="text-white px-4 py-2 rounded-md"
          onClick={() => addTime(2)}
        >
          Set for DJ 2
        </Button>
      </div>

      {/* Timers Display */}
      <div className="flex space-x-8 mt-4">
        <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-700 p-8 rounded-md">
          <div className="text-lg text-gray-800 dark:text-gray-200 mb-2">
            DJ 1 Timer
          </div>
          <div className="text-6xl">{dj1Remaining}</div>
        </div>
        <div className="flex flex-col items-center bg-gray-200 dark:bg-gray-700 p-8 rounded-md">
          <div className="text-lg text-gray-800 dark:text-gray-200 mb-2">
            DJ 2 Timer
          </div>
          <div className="text-6xl">{dj2Remaining}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTimerControl;
