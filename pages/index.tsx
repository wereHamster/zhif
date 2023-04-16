import * as React from "react";
import { BlurHash } from "../src/components/BlurHash";
import { importImage, Picture } from "../src/macro";

const image1 = importImage("../assets/image.jpg");
console.log(image1);
const image2 = importImage("https://storage.googleapis.com/caurea.org/zhif.jpg");
console.log(image2)

// const picture3 = picture("../image.jpg", {
//   sizes: "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
// });

const img = (
  <BlurHash>
    <Picture src="../assets/image.jpg" alt="Flower" sizes="360px" />
  </BlurHash>
);

export default () => (
  <div>
    <div
      style={{
        margin: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 40,
      }}
    >
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>

      {Array.from({ length: 40 }).fill(img)}

      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
       <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
     <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://storage.googleapis.com/caurea.org/zhif.jpg" sizes="360px" />
      </BlurHash>
    </div>
    <div>
      <BlurHash>
        <Picture
          id="1"
          src="https://storage.googleapis.com/caurea.org/zhif.jpg"
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
