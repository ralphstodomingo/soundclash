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

interface EventGame {
  active_game: string | null;
  default_game: string | null;
  games: Game[];
}

export interface SoundclashEvent {
  id: string;
  description: string;
  subtitle: string;
  event_games: EventGame;
  games: Game[];
}

interface VotingSession {
  game_id: string;
  powerup_id: string | null;
  dj_1_vote: number;
  dj_2_vote: number;
  concluded: boolean;
}

interface Powerup {
  image: string;
  name: string;
  description: string;
}
