import { Link } from "react-router-dom";
import { gameBoxArt, type HelixGame } from "../lib/twitch/helix";
import "./GameGrid.css";

interface GameGridProps {
  games: HelixGame[];
}

export function GameGrid({ games }: GameGridProps) {
  return (
    <div className="game-grid">
      {games.map((game) => (
        <Link key={game.id} to={`/games/${game.id}`} className="game-card">
          <img
            src={gameBoxArt(game.box_art_url)}
            alt=""
            className="game-card__art"
            loading="lazy"
          />
          <span className="game-card__name">{game.name}</span>
        </Link>
      ))}
    </div>
  );
}
