import * as React from "react";
import { BlurHash } from "../src/components/BlurHash";
import { importImage, Picture } from "../src/macro";

const image1 = importImage("../assets/image.jpg");
console.log(image1);

// const picture3 = picture("../image.jpg", {
//   sizes: "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
// });

const img = (
  <BlurHash>
    <Picture id="2" src="../assets/image.jpg" alt="Flower" />
  </BlurHash>
);

export default () => (
  <div>
    <div
      style={{
        margin: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 40,
      }}
    >
      {Array.from({ length: 40 }).fill(img)}
    </div>
    <div>
      <BlurHash>
        <Picture
          id="1"
          src="https://exposure.imgix.net/production/posts/241311/cover-photo/cover-1499518139.png"
          alt="Flower"
        />
      </BlurHash>

      <BlurHash>
        <Picture id="2" src="../assets/image.jpg" alt="Flower" />
      </BlurHash>

      <BlurHash>
        <Picture id="3" src="../assets/image.png" />
      </BlurHash>

      <BlurHash>
        <Picture id="4" src="../assets/image.png" />
      </BlurHash>

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
