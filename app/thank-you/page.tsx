import logoSrc from "@/app/logo.png";
import Image from "next/image";

const ThankYouPage = () => {
  return (
    // <div className="flex flex-col items-center justify-between h-screen bg-gray-100 dark:bg-gray-900 max-w-[600px]">

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
        <div className="w-full">
          <Image
            className="w-full max-h-48 object-cover rounded-md mb-4"
            src={logoSrc}
            alt="Soundclash"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Thank you for your feedback!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
          We look forward to seeing you at the next SOUNDCLASH!
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
