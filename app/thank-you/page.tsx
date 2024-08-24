"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import logoSrc from "@/app/logo-white.png";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

const ThankYouPage = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchAndListenForActiveGame = async () => {
      const { data: activeGames, error: activeGameError } = await supabase
        .from("event_games")
        .select("event_id, active_game")
        .not("active_game", "is", null);

      if (activeGames && activeGames.length > 0) {
        const eventId = activeGames[0].event_id;
        router.push(`/${eventId}`);
      }

      // Set up real-time subscription to listen for active game updates
      const activeGameSubscription = supabase
        .channel("event_games_channel")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "event_games",
            filter: `active_game=not.is.null`,
          },
          (payload) => {
            const updatedActiveGame = payload.new.active_game;
            const eventId = payload.new.event_id;

            if (updatedActiveGame) {
              router.push(`/${eventId}`);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(activeGameSubscription);
      };
    };

    fetchAndListenForActiveGame();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
        <div className="w-full">
          <Image
            className="w-full max-h-48 object-cover rounded-md mb-4 filter-invert"
            src={logoSrc}
            alt="Soundclash"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-200 mb-4">
          Thank you for your feedback!
        </h1>
        <p className="text-gray-400 mb-6 font-medium">
          We look forward to seeing you at the next SOUNDCLASH!
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
