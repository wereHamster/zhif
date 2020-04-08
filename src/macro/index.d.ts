import * as React from "react";

interface Metadata {
  width: number;
  height: number;
}

export interface Image {
  metadata: Metadata;
  img: { src: string };
  sources: Array<{ srcSet: string; type: string }>;
}

/**
 * Import an image. The returned object contains all infomration about the image and
 * the generated (resized) versions so that you can create a proper <picture> element
 * (or something else, such as generate CSS).
 *
 * @param src Relative path to the source image.
 */
export const importImage: (src: string) => Image;

/**
 * The <Picture> component is replaced by the <picture> element, which references
 * the given image. The 'src' prop is required and must be a (relative) path to the
 * image. All additional props are forwarded to the <img> element inside the
 * <picture>.
 */
export const Picture: React.ComponentType<{ src: string } & JSX.IntrinsicElements["img"]>;
