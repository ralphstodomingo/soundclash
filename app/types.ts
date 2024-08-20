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

export interface VotingSession {
  id: string;
  game_id: string;
  games: Game;
  powerup_id: string | null;
  emoji_id: number | null; // yep, made an oopsie while creating the table, it's fine.
  dj_1_vote_count: number;
  dj_2_vote_count: number;
  winner: boolean;
  concluded: boolean;
}

export interface Powerup {
  id: string;
  image: string;
  name: string;
  description: string;
}

export interface Emoji {
  id: number;
  image: string;
  name: string;
}
