import * as React from "react";
import { importImage, Picture } from "../src/macro";

const image1 = importImage("../assets/image.jpg");
console.log(image1);

// const picture3 = picture("../image.jpg", {
//   sizes: "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
// });

export default () => (
  <div>
    <div>
      <Picture src="https://exposure.imgix.net/production/posts/241311/cover-photo/cover-1499518139.png" alt="Flower" />
      <Picture src="../assets/image.jpg" alt="Flower" />
      <Picture src="../assets/image.png" />
      {/* <SomePicture {...picture1} /> */}
      {/* <SomePicture {...picture("../image.png")} /> */}
    </div>
  </div>
);

type PictureProps = React.HTMLAttributes<HTMLElement> & {
  metadata: { width: number; height: number };
  img: React.ImgHTMLAttributes<HTMLImageElement>;
  sources: React.SourceHTMLAttributes<HTMLSourceElement>[];
};

const SomePicture = ({ metadata, sources, img, ...props }: PictureProps) => (
  <picture {...props}>
    {sources.map((props, i) => (
      <source key={i} {...props} />
    ))}
    <img {...img} />
  </picture>
);
