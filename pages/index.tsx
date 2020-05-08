import * as React from "react";
import { importImage, Picture } from "../src/macro";
import { decode } from "blurhash";

const image1 = importImage("../assets/image.jpg");
console.log(image1);

// const picture3 = picture("../image.jpg", {
//   sizes: "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
// });

export default () => (
  <div>
    <div>
      <BlurHash>
        <Picture
          src="https://exposure.imgix.net/production/posts/241311/cover-photo/cover-1499518139.png"
          alt="Flower"
        />
      </BlurHash>

      <BlurHash>
        <Picture src="../assets/image.jpg" alt="Flower" />
      </BlurHash>

      <BlurHash>
        <Picture src="../assets/image.png" />
      </BlurHash>

      <BlurHash>
        <Picture src="../assets/image.png" />
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

const BlurHash = ({ children }) => {
  const child = React.Children.only(children);
  const { ["data-blur-hash"]: blurHash } = child.props;
  // console.log({ blurHash });

  const [showBlurHash, setShowBlurHash] = React.useState(true);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  // const [ref, inView] = useInView({ rootMargin: "110%" });
  const blurUrl = useBlurhash(showBlurHash ? blurHash : null);

  const onLoad = React.useCallback(() => {
    setTimeout(() => {
      setImgLoaded(true);
      setTimeout(() => {
        setShowBlurHash(false);
      }, 500);
    }, 1000);
  }, []);

  const style = blurUrl
    ? {
        backgroundImage: `url("${blurUrl}")`,
      }
    : {};

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  });
  // console.log({ imgLoaded, mounted }, style);
  if (!mounted) {
    return null;
  }

  return React.cloneElement(
    child,
    {
      style: {
        position: "relative",
        display: "block",
        // transition: "background-image .5s",
        // backgroundSize: `cover`,
        // ...style,
      },
    },
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        // width: "100%",
        // height: "100% ",
        bottom: 0,
        right: 0,
        transition: "opacity .5s ease-out .1s",
        backgroundSize: `cover`,
        opacity: imgLoaded ? 0 : 1,
        ...style,
      }}
    />,
    ...React.Children.toArray(child.props.children).map((ch) => {
      if (React.isValidElement(ch) && ch.type === "img") {
        return React.cloneElement(ch, {
          onLoad,
          style: {
            display: "block",
            width: "100%",
            height: "auto",
            transition: "opacity .5s",
            opacity: imgLoaded ? 1 : 0,
          },
        } as any);
      } else {
        return ch;
      }
    })
  );
};

// modified from https://gist.github.com/WorldMaker/a3cbe0059acd827edee568198376b95a
// https://github.com/woltapp/react-blurhash/issues/3
export function useBlurhash(
  blurhash: string | undefined | null,
  width: number = 32,
  height: number = 32,
  punch: number = 1
) {
  const [url, setUrl] = React.useState(null as string | null);

  React.useEffect(() => {
    let isCancelled = false;

    if (!blurhash) return;

    // decode hash
    const pixels = decode(blurhash, width, height, punch);

    // temporary canvas to create a blob from decoded ImageData
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    const imageData = context!.createImageData(width, height);
    imageData.data.set(pixels);
    context!.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!isCancelled) {
        setUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          return URL.createObjectURL(blob);
        });
      }
    });

    return function cleanupBlurhash() {
      isCancelled = true;
      setUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        return null;
      });
    };
  }, [blurhash, height, width, punch]);

  return url;
}
