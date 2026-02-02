const FUN_IMAGE_URL = "https://a.espncdn.com/i/headshots/nba/players/full/1966.png";

function replaceAds() {
  const adSelectors = [
      'iframe[src*="ads"]',
      'iframe[id*="google_ads"]',
      'div[id*="google_ads"]',
      'div[class*="ad-container"]',
      'ins.adsbygoogle',
      'a[href*="doubleclick.net"]'
  ];

  const ads = document.querySelectorAll(adSelectors.join(','));

  ads.forEach(ad => {
    // Avoid double replacement
    if (ad.dataset.replaced === "true") return;

    console.log("Ad replacer: Found ad", ad);

    const img = document.createElement('img');
    img.src = FUN_IMAGE_URL;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.title = "Replaced by Ad Image Replacer";
    img.dataset.replaced = "true"; // Tag the replacement itself just in case

    // Replace the ad element with the image, or append if it's a container we want to keep structure of
    // Strategy: Replace the content or the element itself. Let's try replacing the element.
    if (ad.parentNode) {
        ad.parentNode.replaceChild(img, ad);
    }
  });
}

// Initial replacement
replaceAds();

// Watch for dynamic ads
const observer = new MutationObserver((mutations) => {
  let shouldRun = false;
  for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
          shouldRun = true;
          break;
      }
  }
  if (shouldRun) {
      replaceAds();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log("Ad Image Replacer content script loaded.");
