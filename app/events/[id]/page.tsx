// app/events/[id]/page.tsx
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("description, subtitle, games(game_image)")
    .eq("id", params.id)
    .single(); // single() ensures we only get one event

  if (eventError || !event) {
    console.error("Error fetching event:", eventError);
    return notFound(); // Show 404 page if data is not found
  }

  return (
    <div>
      <p>{event.description}</p>
      <p>{event.subtitle}</p>
      <h3>Games</h3>
      <div>
        {event.games.map((game, index) => (
          <img key={index} src={game.game_image} alt={`Game ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}
