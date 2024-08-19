import { SoundclashEvent } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoSrc from "@/app/logo.png";
import Image from "next/image";

interface Props {
  event: SoundclashEvent;
}

export const EventOverview = ({ event }: Props) => {
  return (
    <div className="container mx-auto p-4 pt-8">
      <Image
        className="w-full h-48 object-cover rounded-md mb-4"
        src={logoSrc}
        alt="Soundclash"
      />
      <p className="text-3xl font-bold mb-4">{event.description}</p>
      <p className="text-lg mb-8">{event.subtitle}</p>

      <h3 className="text-xl font-semibold mb-4">Games</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {event.games.map((game, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Game {index + 1}</CardTitle>
            </CardHeader>
            <img
              className="w-full h-48 object-cover rounded-md mb-4"
              src={game.game_image}
              alt={`Game ${index + 1}`}
            />
            <CardContent>
              <div>
                <h4 className="text-lg font-semibold mb-2"></h4>
                <div className="flex items-center mb-2">
                  <img
                    className="w-4 h-4 object-cover rounded-full mr-2"
                    src={game.dj_1_id.main_image}
                    alt={game.dj_1_id.name}
                  />
                  <p className="text-sm">{game.dj_1_id.name}</p>
                </div>
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 object-cover rounded-full mr-2"
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
};
