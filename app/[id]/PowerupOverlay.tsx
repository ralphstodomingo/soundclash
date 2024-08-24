import { Powerup } from "@/app/types";

interface PowerupOverlayProps {
  powerup?: Powerup;
}

const PowerupOverlay = ({ powerup }: PowerupOverlayProps) => {
  if (!powerup) {
    return null;
  }

  return (
      <div className="flex bg-white dark:bg-zinc-800 w-full mt-4">
        <img
          src={powerup.image}
          alt={powerup.name}
          className="w-16 h-16 object-contain rounded-lg"
        />
        <div className="ml-3 flex flex-col justify-center">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">
            {powerup.name}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {powerup.description}
          </p>
        </div>
      </div>
  );
};

export default PowerupOverlay;
