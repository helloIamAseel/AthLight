import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FALLBACK_AVATAR } from "./constants";

interface AthleteAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

const AthleteAvatar = React.memo(function AthleteAvatar({ src, alt, className = "h-12 w-12" }: AthleteAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Avatar className={`${className} ring-2 ring-secondary/20`}>
      <AvatarImage src={imgSrc} alt={alt} onError={() => setImgSrc(FALLBACK_AVATAR)} />
      <AvatarFallback className="gradient-brand text-primary-foreground font-bold">
        {alt.split(" ").map(n => n[0]).join("")}
      </AvatarFallback>
    </Avatar>
  );
});

export default AthleteAvatar;
