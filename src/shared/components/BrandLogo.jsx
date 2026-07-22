"use client";

import { useEffect, useState } from "react";
import { useCompanyLogo } from "@/shared/hooks/useCompanyLogo";

const BrandLogo = ({
  fallbackSrc,
  alt = "Target Tours Logo",
  className,
  width,
  height,
  ...props
}) => {
  const { logoUrl } = useCompanyLogo();
  const [imgSrc, setImgSrc] = useState(fallbackSrc);

  useEffect(() => {
    setImgSrc(logoUrl || fallbackSrc);
  }, [fallbackSrc, logoUrl]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};

export default BrandLogo;
