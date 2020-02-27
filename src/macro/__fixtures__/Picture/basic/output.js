export default () => (
  <picture>
    <source srcSet="/images/jpeg-1w-FINGERPRINT.webp 1w" type="image/webp" />
    <source srcSet="/images/jpeg-1w-FINGERPRINT.jpg 1w" type="image/jpeg" />
    <img src="/images/jpeg-FINGERPRINT.jpg" width={1} height={1} />
  </picture>
);