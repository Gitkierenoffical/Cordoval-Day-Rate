const AD_IMAGE_URL =
  "https://raw.githubusercontent.com/Gitkierenoffical/image-store-for-cordoval/main/build%20house%20daily%20image%20ad.png";
const AD_LINK_URL = "https://buildhousedaily.beehiiv.com/";

export function BuildHouseDailyAd() {
  return (
    <aside className="build-house-daily-ad" aria-label="Sponsored">
      <a
        className="build-house-daily-ad__link"
        href={AD_LINK_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="build-house-daily-ad__img"
          src={AD_IMAGE_URL}
          alt="Build House Daily newsletter"
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
        />
      </a>
    </aside>
  );
}
