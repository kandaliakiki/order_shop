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
      <div className="h-10 w-10 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={name}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
      <Package className="h-5 w-5 text-gray-400" />
    </div>
  );
};

export default IngredientTableImage;

