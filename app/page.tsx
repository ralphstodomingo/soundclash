import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function EventRedirectPage() {
  const supabase = createClient();
  const eventIds = [
    "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d",
    "be937b71-7db6-4b4e-8c86-9e706a307078",
    "91c1eb0c-1741-47d8-9e5b-f5422a00a34a",
  ];

  // First, check for any event with an active game, regardless of the list
  const { data: activeGames, error: activeGameError } = await supabase
    .from("event_games")
    .select("event_id, active_game")
    .not("active_game", "is", null);

  if (activeGames && activeGames.length > 0) {
    const activeGame = activeGames[0].active_game;
    const eventId = activeGames[0].event_id;

    if (activeGame) {
      // Redirect to the active game
      redirect(`/${eventId}`);
    }
  }

  // If no active game is found, check the prioritized list for an event that has not concluded
  for (const eventId of eventIds) {
    const { data: event, error } = await supabase
      .from("events")
      .select("id, concluded")
      .eq("id", eventId)
      .single();

    if (event && !event.concluded) {
      // Redirect to the first non-concluded event in the prioritized list
      redirect(`/${event.id}`);
    }
  }

  // If no valid event is found, return a 404 page
  return notFound();
}