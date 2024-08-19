import logoSrc from "@/app/logo.png";
import Image from "next/image";

export const ActiveGameDisplay = () => {
  return (
    <div className="container mx-auto p-4 pt-8">
      <Image
        className="w-full max-h-48 object-cover rounded-md mb-4"
        src={logoSrc}
        alt="Soundclash"
      />
      game on
    </div>
  );
};
