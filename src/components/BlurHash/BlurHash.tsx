import { decode } from "blurhash";
import React from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  children: React.ReactElement;
}

function BlurHash({ children: picture }: Props) {
  const { ["data-blur-hash"]: blurHash } = picture.props;

  const [loaded, setLoaded] = React.useState(false);
  const [pictureRef, inView] = useInView({
    rootMargin: "30%",
    triggerOnce: true,
  });
  const blurHashURL = useBlurHash(!loaded && inView ? blurHash : null);
  // console.log({
  //   imageLoaded: loaded,
  //   inView,
  //   blurHashURL,
  //   ratio: entry?.intersectionRatio,
  // });

  const imgRef = React.useCallback(
    (ref: null | HTMLImageElement) => {
      if (ref) {
        if (ref.complete) {
          setLoaded(true);
        } else {
          ref.addEventListener(
            "load",
            () => {
              setLoaded(true);
            },
            { once: true }
          );
        }
      } else {
        setLoaded(false);
      }
    },
    [setLoaded]
  );

  return React.cloneElement(
    picture,
    { ref: pictureRef, style: styles.picture },
    <div
      style={{
        ...styles.bg,
        opacity: loaded ? 0 : 1,
        backgroundImage: blurHashURL ? `url("${blurHashURL}")` : undefined,
      }}
    />,
    ...React.Children.toArray(picture.props.children).map((child) => {
      if (React.isValidElement(child) && child.type === "img") {
        return React.cloneElement(child, {
          ref: imgRef,
          loading: "lazy",
          style: { ...styles.img, opacity: loaded ? 1 : 0 },
        } as any);
      } else {
        return child;
      }
    })
  );
}

export default BlurHash;

const styles = {
  picture: {
    position: "relative",
    display: "block",
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    transition: "opacity .5s ease-out .1s",
    backgroundSize: "cover",
  },
  img: {
    display: "block",
    width: "100%",
    height: "auto",
    transition: "opacity .5s",
  },
} as const;

// modified from https://gist.github.com/WorldMaker/a3cbe0059acd827edee568198376b95a
// https://github.com/woltapp/react-blurhash/issues/3
export function useBlurHash(
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
