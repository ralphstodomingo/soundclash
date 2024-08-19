import { SoundclashEvent } from "@/app/types";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch event details, associated games, and DJ details
  const { data: event, error: eventError } = await supabase
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
    .single<SoundclashEvent>(); // single() ensures we only get one event

  if (eventError || !event) {
    console.error("Error fetching event:", eventError);
    return notFound(); // Show 404 page if data is not found
  }

  return (
    <div className="container mx-auto p-4 pt-8">
      <p className="text-3xl font-bold mb-4">{event.description}</p>
      {/* <h2 className="text-2xl font-semibold mb-2">Event Subtitle</h2> */}
      <p className="text-lg mb-8">{event.subtitle}</p>

      <h3 className="text-xl font-semibold mb-4">Games</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {event.games.map((game, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Game {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                className="w-full h-48 object-cover rounded-md mb-4"
                src={game.game_image}
                alt={`Game ${index + 1}`}
              />
              <div>
                <h4 className="text-lg font-semibold mb-2"></h4>
                <div className="flex items-center mb-2">
                  <img
                    className="w-12 h-12 object-cover rounded-full mr-2"
                    src={game.dj_1_id.main_image}
                    alt={game.dj_1_id.name}
                  />
                  <p className="text-sm">{game.dj_1_id.name}</p>
                </div>
                <div className="flex items-center">
                  <img
                    className="w-12 h-12 object-cover rounded-full mr-2"
                    src={game.dj_2_id.main_image}
                    alt={game.dj_2_id.name}
                  />
                  <p className="text-sm">{game.dj_2_id.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
