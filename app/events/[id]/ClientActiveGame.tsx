"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { EventOverview } from "./EventOverview";
import { ActiveGameDisplay } from "./ActiveGameDisplay";
import { SoundclashEvent } from "@/app/types";
import NotificationPrompt from "./NotificationButton";

interface Props {
  eventId: string;
  event: SoundclashEvent;
}

const ClientActiveGame = ({ eventId, event }: Props) => {
  const router = useRouter();
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
      .channel("active_game_channel")
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

    const eventSubscription = supabase
      .channel("event_channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          // only trigger if the page is open when the event concludes.
          if (payload.new.concluded) {
            router.push(`/survey/${eventId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activeGameSubscription);
    };
  }, [eventId]);

  useEffect(() => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) =>
        console.log(
          "Service Worker registration successful with scope: ",
          registration.scope
        )
      )
      .catch((err) => console.log("Service Worker registration failed: ", err));
  }, []);

  return (
    <div>
      {activeGame ? (
        <ActiveGameDisplay event={event} activeGame={activeGame} />
      ) : (
        <EventOverview event={event} />
      )}
      <NotificationPrompt />
    </div>
  );
};

export default ClientActiveGame;
