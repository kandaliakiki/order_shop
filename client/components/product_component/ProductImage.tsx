import React from "react";
import Image from "next/image";

const PRODUCT_PLACEHOLDER_SRC = "/assets/product.svg";

interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Use for card/cart; default is false (table size) */
  fill?: boolean;
  /** Extra class when showing placeholder (e.g. object-contain p-2 to keep icon smaller) */
  placeholderClassName?: string;
}

/**
 * Shows product image or a generic product placeholder when imageUrl is missing.
 * Placeholder uses product.svg to differ from category placeholder (bakeries).
 */
const ProductImage = ({
  imageUrl,
  alt,
  width = 64,
  height = 64,
  className = "h-full w-full object-cover",
  fill = false,
  placeholderClassName,
}: ProductImageProps) => {
  const isPlaceholder = !imageUrl || imageUrl.trim() === "";
  const src = isPlaceholder ? PRODUCT_PLACEHOLDER_SRC : imageUrl;
  const imageClassName = isPlaceholder && placeholderClassName
    ? placeholderClassName
    : className;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={imageClassName}
        sizes="(max-width: 768px) 100vw, 300px"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
    />
  );
};

export default ProductImage;
