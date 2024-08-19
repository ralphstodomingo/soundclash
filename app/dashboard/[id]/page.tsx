"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Powerup, SoundclashEvent } from "@/app/types";

const supabase = createClient();

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<SoundclashEvent | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [powerups, setPowerups] = useState<Powerup[] | null>(null);

  useEffect(() => {
    const getEventData = async () => {
      const { data: event } = await supabase
        .from("events")
        .select(
          `
      description, 
      subtitle, 
      games(
        id, 
        game_image, 
        dj_1_id(id, name, main_image), 
        dj_2_id(id, name, main_image)
      )
    `
        )
        .eq("id", params.id)
        .single<SoundclashEvent>();

      setEvent(event);
    };

    getEventData();
  }, []);

  useEffect(() => {
    const getPowerups = async () => {
      const { data: powerups } = await supabase.from("powerups").select("*");

      setPowerups(powerups);
    };

    getPowerups();
  }, []);

  useEffect(() => {
    if (!event) {
      return;
    }

    const fetchActiveGame = async () => {
      const { data, error } = await supabase
        .from("event_games")
        .select("active_game")
        .eq("event_id", params.id)
        .single();

      if (data) {
        setActiveGame(data.active_game);
      }
      if (error) {
        console.error("Error fetching active game:", error);
      }
    };

    fetchActiveGame();

    const activeGameSubscription = supabase
      .channel("event_channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "event_games",
          filter: `event_id=eq.${params.id}`,
        },
        (payload) => {
          const updatedActiveGame = payload.new.active_game;
          setActiveGame(updatedActiveGame);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activeGameSubscription);
    };
  }, [event]);

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

  // done
  const loadGame = async (game_id: string) => {
    setLoading(true);
    try {
      await supabase
        .from("event_games")
        .update({ active_game: game_id })
        .eq("event_id", params.id);
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
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Event Dashboard</h1>
      <div className="space-y-4 mb-8">
        <Button onClick={startEvent} disabled={loading}>
          Start Event
        </Button>
        <Button
          variant="destructive"
          onClick={endVotingAndEvent}
          disabled={loading}
          className="ml-2"
        >
          End Voting and Event
        </Button>
      </div>
      <div className="flex-grow flex justify-center h-full gap-4">
        <div className="flex flex-col items-center w-1/3 h-full">
          <h3 className="text-2xl font-bold mb-6">Games</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DJ 1</TableHead>
                <TableHead>DJ 2</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event?.games.map((game, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex">
                      <img
                        className="w-4 h-4 object-cover mr-2"
                        src={game.dj_1_id.main_image}
                        alt={game.dj_1_id.name}
                      />
                      {game.dj_1_id.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      <img
                        className="w-4 h-4 object-cover mr-2"
                        src={game.dj_2_id.main_image}
                        alt={game.dj_2_id.name}
                      />
                      {game.dj_2_id.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {activeGame === game.id ? <Badge>Ongoing</Badge> : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {activeGame !== game.id ? (
                      <Button
                        onClick={() => loadGame(game.id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        Load Game
                      </Button>
                    ) : (
                      ""
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col items-center w-1/3 h-full">
          <h3 className="text-2xl font-bold mb-4">Voting</h3>
          <h4 className="text-1xl font-bold mb-4">Powerups</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {powerups &&
                powerups.map((powerup, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex">
                        <img
                          className="w-4 h-4 object-cover mr-2"
                          src={powerup.image}
                          alt={powerup.name}
                        />
                        {powerup.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {powerup.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        // onClick={() => loadGame(game.id)}
                        disabled={loading || !activeGame}
                        size="sm"
                        variant="outline"
                      >
                        Start Voting
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col items-center w-1/3 h-full">
          <h4 className="text-1xl font-bold mb-4">Voting Sessions</h4>
        </div>
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
