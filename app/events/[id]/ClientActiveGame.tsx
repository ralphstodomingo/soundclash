"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { EventOverview } from "./EventOverview";
import { ActiveGameDisplay } from "./ActiveGameDisplay";
import { SoundclashEvent } from "@/app/types";

interface Props {
  eventId: string;
  event: SoundclashEvent;
}

const ClientActiveGame = ({ eventId, event }: Props) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchActiveGame = async () => {
      const { data, error } = await supabase
        .from("event_games")
        .select("active_game")
        .eq("event_id", eventId)
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
          filter: `event_id=eq.${eventId}`,
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
  }, [eventId]);

  return (
    <div>
      {activeGame ? <ActiveGameDisplay /> : <EventOverview event={event} />}
    </div>
  );
};

export default ClientActiveGame;
