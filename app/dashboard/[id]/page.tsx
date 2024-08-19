"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const supabase = createClient();

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // done
  const startEvent = async () => {
    setLoading(true);
    try {
      // Load default game and update active_game
      const { data: event } = await supabase
        .from("event_games")
        .select("default_game")
        .eq("event_id", params.id)
        .single();

      if (event) {
        await supabase
          .from("event_games")
          .update({ active_game: event.default_game })
          .eq("event_id", params.id);
      }
    } finally {
      setLoading(false);
    }
  };

  // not done yet
  const createVotingSession = async (powerupId: string | null) => {
    setLoading(true);
    try {
      await supabase.from("voting_sessions").insert({
        game_id: selectedGame,
        powerup_id: powerupId,
        concluded: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const endVoting = async () => {
    setLoading(true);
    try {
      await supabase
        .from("voting_sessions")
        .update({ concluded: true })
        .eq("game_id", selectedGame);
    } finally {
      setLoading(false);
    }
  };

  const voteForWinner = async () => {
    setLoading(true);
    try {
      await createVotingSession(null); // Create voting session for winner
    } finally {
      setLoading(false);
    }
  };

  // done except for endVoting
  const endVotingAndEvent = async () => {
    setLoading(true);
    try {
      // await endVoting(); // End voting
      await supabase
        .from("event_games")
        .update({ active_game: null })
        .eq("event_id", params.id);
    } finally {
      setLoading(false);
    }
  };

  const changeGame = async (gameId: string) => {
    setLoading(true);
    try {
      await supabase
        .from("events")
        .update({ active_game: gameId })
        .eq("id", params.id);
      setSelectedGame(gameId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Event Dashboard</h1>
      <div className="space-y-4">
        <Button onClick={startEvent} disabled={loading}>
          Start Event
        </Button>
        <Button onClick={endVotingAndEvent} disabled={loading}>
          End Voting and Event
        </Button>
      </div>
      <div className="space-y-4">
        <Button
          onClick={() => createVotingSession("powerupId")}
          disabled={loading}
        >
          Vote for Powerups
        </Button>
        <Button onClick={endVoting} disabled={loading}>
          End Voting
        </Button>
        <Button onClick={voteForWinner} disabled={loading}>
          Vote for Winner
        </Button>
        <Input
          type="text"
          placeholder="Enter new game ID"
          onChange={(e) => setSelectedGame(e.target.value)}
        />
        <Button
          onClick={() => changeGame(selectedGame ?? "")}
          disabled={loading}
        >
          Change Game
        </Button>
      </div>
    </div>
  );
}
