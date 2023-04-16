import React from "react";
import { useInView } from "react-intersection-observer";
import { useBlurHash } from "./useBlurHash";

interface Props {
  children: React.ReactElement;
}

/*

<BlurHash>
  <Picture />
</BlurHash>

*/

function BlurHash({ children: picture }: Props) {
  const { ["data-blur-hash"]: blurHash } = picture.props;

  const [loaded, setLoaded] = React.useState(false);
  const [pictureRef, inView] = useInView({ triggerOnce: true });
  const blurHashURL = useBlurHash(!loaded && inView ? blurHash : null);

  const imgRef = React.useCallback((ref: null | HTMLImageElement) => {
    if (ref) {
      if (ref.complete) {
        setLoaded(true);
      } else {
        ref.addEventListener("load", () => setLoaded(true), { once: true });
      }
    } else {
      setLoaded(false);
    }
  }, []);

  return React.cloneElement(
    picture,
    {
      ["data-blur-hash"]: undefined,
      ref: pictureRef,
      style: styles.picture,
    },
    blurHashURL && (
      <div
        style={{
          ...styles.bg,
          opacity: loaded ? 0 : 1,
          backgroundImage: `url("${blurHashURL}")`,
        }}
      />
    ),
    ...React.Children.toArray(picture.props.children).map((child) => {
      if (React.isValidElement(child)) {
        if (child.type === "img" || child.props.originalType === "img") {
          return React.cloneElement(child as React.ReactElement<React.ComponentProps<"img">>, {
            ref: imgRef,
            style: {
              ...styles.img,
              opacity: loaded ? 1 : 0,
              ...child.props.style,
            },
          });
        } else {
          return child;
        }
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
    pointerEvents: "none",
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
