"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { EventOverview } from "./EventOverview";
import { ActiveGameDisplay } from "./ActiveGameDisplay";
import { SoundclashEvent } from "@/app/types";
import NotificationRequestOverlay from "./NotificationRequestOverlay";

interface Props {
  eventId: string;
  event: SoundclashEvent;
}

const ClientActiveGame = ({ eventId, event }: Props) => {
  const router = useRouter();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [emojiVoteCountRemaining, setEmojiVoteCountRemaining] = useState(10);

  const decrementVotingCount = () => {
    setEmojiVoteCountRemaining((prev) => prev - 1);
  };

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
          setActiveGame((prev) => {
            if (prev !== updatedActiveGame) {
              setEmojiVoteCountRemaining(10);
              return updatedActiveGame;
            }
            return prev;
          });
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
      supabase.removeChannel(eventSubscription);
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
        <ActiveGameDisplay
          event={event}
          activeGame={activeGame}
          emojiVoteCountRemaining={emojiVoteCountRemaining}
          decrementVotingCount={decrementVotingCount}
        />
      ) : (
        <EventOverview event={event} />
      )}
      <NotificationRequestOverlay />
    </div>
  );
};

export default ClientActiveGame;
