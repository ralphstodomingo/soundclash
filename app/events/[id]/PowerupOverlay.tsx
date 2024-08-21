import { Powerup } from "@/app/types";

interface PowerupOverlayProps {
  powerup?: Powerup;
}

const PowerupOverlay = ({ powerup }: PowerupOverlayProps) => {
  if (!powerup) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 p-2">
      <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 w-full max-w-xs pointer-events-auto">
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
    </div>
  );
};

export default PowerupOverlay;
