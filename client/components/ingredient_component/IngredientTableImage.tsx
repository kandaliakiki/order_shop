import React from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface IngredientTableImageProps {
  imageUrl?: string;
  name: string;
}

const IngredientTableImage = ({ imageUrl, name }: IngredientTableImageProps) => {
  if (imageUrl) {
    return (
      <div className="h-8 w-8 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
      <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    </div>
  );
};

export default IngredientTableImage;

