const {} = (() => {
  require("null-loader!!../../assets/jpeg.jpg");

  return {
    metadata: {
      width: 1,
      height: 1
    },
    img: {
      src: "/static/images/jpeg-FINGERPRINT.jpg"
    },
    sources: [
      {
        srcSet: "/static/images/jpeg-1w-FINGERPRINT.webp 1w",
        type: "image/webp"
      },
      {
        srcSet: "/static/images/jpeg-1w-FINGERPRINT.jpg 1w",
        type: "image/jpeg"
      }
    ]
  };
})();