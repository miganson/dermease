import { Box, type SxProps, type Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { getFallbackProductImage } from "../../lib/images";

export function ProductImage({
  src,
  alt,
  label,
  sx
}: {
  src: string;
  alt: string;
  label: string;
  sx?: SxProps<Theme>;
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(getFallbackProductImage(label))}
      sx={sx}
    />
  );
}
