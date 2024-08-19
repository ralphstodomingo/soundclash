export interface DJ {
  id: string;
  name: string;
  main_image: string;
}

export interface Game {
  id: string;
  game_image: string;
  dj_1_id: DJ;
  dj_2_id: DJ;
}

export interface SoundclashEvent {
  description: string;
  subtitle: string;
  games: Game[];
}
