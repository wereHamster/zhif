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
        <Picture src="https://i.picsum.photos/id/1/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/2/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/3/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/4/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/5/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/6/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/7/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/8/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/9/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/10/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/11/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/12/1200/640.jpg" sizes="360px" />
      </BlurHash>

      {Array.from({ length: 40 }).fill(img)}

      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1001/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1002/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1003/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1004/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1005/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1006/1200/640.jpg" sizes="360px" />
      </BlurHash>
       <BlurHash>
        <Picture src="https://i.picsum.photos/id/1008/1200/640.jpg" sizes="360px" />
      </BlurHash>
     <BlurHash>
        <Picture src="https://i.picsum.photos/id/1009/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1010/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1011/1200/640.jpg" sizes="360px" />
      </BlurHash>
      <BlurHash>
        <Picture src="https://i.picsum.photos/id/1012/1200/640.jpg" sizes="360px" />
      </BlurHash>
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
