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
import { Emoji, Powerup, SoundclashEvent, VotingSession } from "@/app/types";
import { cn } from "@/lib/utils";
import DashboardTimerControl from "./DashboardTimerControl";

const sendNotification = async (message: { title: string; body: string }) => {
  try {
    const response = await fetch("/api/trigger-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send notification");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const supabase = createClient();

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<SoundclashEvent | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [powerups, setPowerups] = useState<Powerup[] | null>(null);
  const [emojis, setEmojis] = useState<Emoji[] | null>(null);
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);

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
    const getEmojis = async () => {
      const { data: emojis } = await supabase.from("emoji").select("*");

      setEmojis(emojis);
    };

    getEmojis();
  }, []);

  useEffect(() => {
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
      .channel("event_games_channel")
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
  }, []);

  useEffect(() => {
    if (!event) {
      return;
    }

    const fetchVotingSessions = async () => {
      const { data, error } = await supabase
        .from("voting_session")
        .select("*, games!inner(*)")
        .eq("games.event_id", params.id);

      if (data) {
        setVotingSessions(data);
      }
      if (error) {
        console.error("Error fetching voting sessions:", error);
      }
    };

    fetchVotingSessions();

    const gameIds = event.games.map((game) => game.id).join(",");
    const votingSessionSubscription = supabase
      .channel("voting_session_changes")
      .on<VotingSession>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "voting_session",
          filter: `game_id=in.(${gameIds})`,
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
          filter: `game_id=in.(${gameIds})`,
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
  }, [params.id, event]);

  const startEvent = async () => {
    setLoading(true);
    try {
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
      await sendNotification({
        title: "Get ready to rumble!",
        body: "The event has started. Let the Soundclash begin!",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGame = async (game_id: string) => {
    setLoading(true);
    try {
      await supabase
        .from("event_games")
        .update({ active_game: game_id })
        .eq("event_id", params.id);
      await sendNotification({
        title: "The next clash begins!",
        body: "Tune in for the next Soundclash!",
      });
    } finally {
      setLoading(false);
    }
  };

  interface VotingSessionArgs {
    powerup_id?: string;
    emoji_id?: number;
    winner?: boolean;
  }

  const createVotingSession = async (args: VotingSessionArgs) => {
    setLoading(true);
    try {
      await supabase.from("voting_session").insert({
        ...args,
        game_id: activeGame,
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
        .from("voting_session")
        .update({ concluded: true })
        .eq("game_id", activeGame);
    } finally {
      setLoading(false);
    }
  };

  const startWinnerVoting = async () => {
    setLoading(true);
    try {
      await createVotingSession({ winner: true });
      await sendNotification({
        title: "Who won?",
        body: "Vote for your Soundclash winner!",
      });
    } finally {
      setLoading(false);
    }
  };

  const startPowerupVoting = async (powerup_id: string) => {
    setLoading(true);
    try {
      await createVotingSession({ powerup_id });
      await sendNotification({
        title: "Who gets more power?",
        body: "Vote for who gets this powerup!",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEmojiVoting = async () => {
    if (!emojis || emojis.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await sendNotification({
        title: "Send some love!",
        body: "Send support for your favorite DJ with an emoji!",
      });
      await Promise.all(
        emojis.map((emoji) => createVotingSession({ emoji_id: emoji.id }))
      );
    } finally {
      setLoading(false);
    }
  };

  const endVotingAndEvent = async () => {
    setLoading(true);
    try {
      await endVoting();
      await supabase
        .from("event_games")
        .update({ active_game: null })
        .eq("event_id", params.id);
      await supabase
        .from("events")
        .update({ concluded: true })
        .eq("id", params.id);
      await sendNotification({
        title: "Until next time!",
        body: "Thanks for playing!",
      });
      // take note of below, if we really want to reset subscriptions.
      // await supabase.from("push_subscriptions").delete().neq("id", ""); // purge all subscriptions
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Event Dashboard</h1>
      <div className="space-y-4 mb-8">
        <Button onClick={startEvent} disabled={loading || Boolean(activeGame)}>
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
      <div className="flex-grow flex justify-center h-full gap-8">
        <div className="flex flex-col items-center w-2/6 h-full">
          <div className="flex flex-col items-center w-full">
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
                          disabled={
                            loading ||
                            votingSessions.some(
                              (votingSession) => !votingSession.concluded
                            )
                          }
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
          <div className="flex flex-col items-center w-full mt-8">
            <h3 className="text-2xl font-bold mb-4">Powerups</h3>
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
                          onClick={() => startPowerupVoting(powerup.id)}
                          disabled={
                            loading ||
                            !activeGame ||
                            votingSessions.some(
                              (votingSession) => !votingSession.concluded
                            )
                          }
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
          {
            activeGame && (<DashboardTimerControl activeGame={activeGame}/>)
          }
          
          
        </div>

        <div className="flex flex-col items-center w-1/2 h-full mb-4">
          <h4 className="text-2xl font-bold mb-4">Voting Sessions</h4>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={startWinnerVoting}
              disabled={
                loading ||
                !activeGame ||
                votingSessions.some((votingSession) => !votingSession.concluded)
              }
            >
              Start Winner Voting
            </Button>
            <Button
              disabled={
                loading ||
                !activeGame ||
                votingSessions.some((votingSession) => !votingSession.concluded)
              }
              onClick={startEmojiVoting}
            >
              Start Emoji Voting
            </Button>
            {votingSessions.some(
              (votingSession) => !votingSession.concluded
            ) && (
              <Button
                onClick={endVoting}
                disabled={loading}
                variant="destructive"
              >
                End Voting
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voting for...</TableHead>
                <TableHead>DJ 1 and vote count</TableHead>
                <TableHead>DJ 2 and vote count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event &&
                votingSessions &&
                votingSessions
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((votingSession, index) => {
                    const game = event.games.find(
                      (game) => game.id === votingSession.game_id
                    );
                    const powerup = powerups?.find(
                      (powerup) => powerup.id === votingSession.powerup_id
                    );
                    const emoji = emojis?.find(
                      (emoji) => emoji.id === votingSession.emoji_id
                    );
                    const higherVoteCount = Math.max(
                      votingSession.dj_1_vote_count,
                      votingSession.dj_2_vote_count
                    );

                    if (!game) {
                      return null;
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="text-right">
                          {emoji ? (
                            <div className="flex">
                              <img
                                className="w-4 h-4 object-cover mr-2"
                                src={emoji.image}
                                alt={emoji.name}
                              />
                              {emoji.name}
                            </div>
                          ) : powerup ? (
                            <div className="flex">
                              <img
                                className="w-4 h-4 object-cover mr-2"
                                src={powerup.image}
                                alt={powerup.name}
                              />
                              {powerup.name}
                            </div>
                          ) : (
                            <div className="flex">Game Winner</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn("flex", {
                              "font-bold":
                                votingSession.dj_1_vote_count &&
                                votingSession.dj_1_vote_count ===
                                  higherVoteCount,
                            })}
                          >
                            <img
                              className="w-4 h-4 object-cover mr-2"
                              src={game.dj_1_id.main_image}
                              alt={game.dj_1_id.name}
                            />
                            {`${game.dj_1_id.name}: (${votingSession.dj_1_vote_count} votes)`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn("flex", {
                              "font-bold":
                                votingSession.dj_2_vote_count &&
                                votingSession.dj_2_vote_count ===
                                  higherVoteCount,
                            })}
                          >
                            <img
                              className="w-4 h-4 object-cover mr-2"
                              src={game.dj_2_id.main_image}
                              alt={game.dj_2_id.name}
                            />
                            {`${game.dj_2_id.name}: (${votingSession.dj_2_vote_count} votes)`}
                          </div>
                        </TableCell>
                        <TableCell>
                          {votingSession.concluded ? (
                            <Badge variant="destructive">Concluded</Badge>
                          ) : (
                            <Badge>Ongoing</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
