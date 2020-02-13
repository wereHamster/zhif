import * as React from "react";

export const importImage: (src: string) => {
  metadata: { width: number; height: number; };
  img: { src: string };
  sources: Array<{ srcSet: string, type: string }>;
};

export const Picture: React.ComponentType<{ src: string } & React.ComponentPropsWithoutRef<"img">>;
