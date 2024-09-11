import Image from "next/image";
import React from "react";

interface CardComponentProps {
  colorTheme: string;
  backgroundImageSrc: string;
  title: string;
  value: string;
  iconSrc: string;
  iconBackgroundColor: string;
}

const colorThemes: { [key: string]: string } = {
  blue: "bg-gradient-to-r from-sky-400 via-sky-300 to-sky-200",
  red: "bg-gradient-to-r from-red-600 via-red-500 to-red-400",
  yellow: "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400",
  green: "bg-gradient-to-r from-green-600 via-green-500 to-green-400",
  orange: "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400",
};

const iconBackgroundColors: { [key: string]: string } = {
  blue: "bg-blue-100",
  red: "bg-red-100",
  yellow: "bg-yellow-100",
  green: "bg-green-100",
  orange: "bg-orange-100",
  white: "bg-white",
  black: "bg-black",
  purple: "bg-purple-100",
};

const CardSummary: React.FC<CardComponentProps> = ({
  colorTheme,
  backgroundImageSrc,
  title,
  value,
  iconSrc,
  iconBackgroundColor,
}) => {
  const gradientClass = colorThemes[colorTheme] || colorThemes.blue;
  const iconBgClass = iconBackgroundColors[iconBackgroundColor];

  return (
    <div
      className={`relative ${gradientClass} rounded-lg p-5 w-1/4  py-7 shadow-lg border border-neutral-200 overflow-hidden`}
    >
      <div className="absolute inset-0">
        <Image
          src={backgroundImageSrc}
          alt="background"
          className="w-full h-full object-cover"
          fill
        />
      </div>
      <div className="relative flex justify-between items-center">
        <div className="tracking-normal text-white">
          <p className="uppercase text-white   mb-5 text-lg">{title}</p>
          <h1
            className="text-5xl font-bold text-white"
            style={{ textShadow: `0 0 3px ${colorTheme}` }}
          >
            {value}
          </h1>
        </div>
        <div
          className={`aspect-square p-4 rounded-md ${iconBgClass} opacity-80`}
        >
          <Image alt="icon" src={iconSrc} width={40} height={40} />
        </div>
      </div>
    </div>
  );
};

export default CardSummary;
