export default () => (
  <picture>
    <source
      srcSet="/static/images/jpeg-1w-FINGERPRINT.webp 1w"
      type="image/webp"
    />
    <source
      srcSet="/static/images/jpeg-1w-FINGERPRINT.jpg 1w"
      type="image/jpeg"
    />
    <img src="/static/images/jpeg-FINGERPRINT.jpg" />
  </picture>
);