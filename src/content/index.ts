// Theme assets
const THEMES: Record<string, string[]> = {
  classic_cats: [
      "https://placekitten.com/200/200",
      "https://placekitten.com/g/200/300",
      "https://placekitten.com/300/300"
  ],
  pixel_art: [
      "https://placekitten.com/g/200/200", // TODO: Replace with real pixel art
  ],
  minimalist: [
      "https://placekitten.com/200/200?image=10",
  ]
};

let currentTheme = 'classic_cats';
let userImages: string[] = [];

// Initialize state
chrome.storage.local.get(['theme', 'userImages'], (result) => {
  if (result.theme) currentTheme = result.theme;
  if (result.userImages) userImages = result.userImages;
  replaceAds();
});

// Listen for updates from Options page
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'THEME_CHANGED') {
      currentTheme = message.theme;
      if (message.images) userImages = message.images;
      console.log('Theme changed to:', currentTheme);
      
      // Force re-replacement
      // Clear all replaced flags so they get updated
      document.querySelectorAll('[data-replaced="true"]').forEach(el => {
          (el as HTMLElement).dataset.replaced = "false";
          // If it's an image we replaced, update src directly
          if (el.tagName === 'IMG' && el.classList.contains('ad-replacer-image')) {
              (el as HTMLImageElement).src = getRandomImage();
              (el as HTMLElement).dataset.replaced = "true";
          }
      });

      // Run full replacement again for containers
      replaceAds();
  }
});

function getRandomImage(): string {
  let source = THEMES['classic_cats'];

  if (currentTheme === 'my_uploads' && userImages.length > 0) {
      source = userImages;
  } else if (THEMES[currentTheme]) {
      source = THEMES[currentTheme];
  }

  if (source.length === 0) return "https://placekitten.com/200/200";
  return source[Math.floor(Math.random() * source.length)];
}

// Inject Custom CSS
const style = document.createElement('style');
style.textContent = `
  .ad-replacer-image {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
  }
  .ad-replacer-container {
      overflow: hidden !important;
      display: block !important;
  }
`;
document.head.appendChild(style);

function replaceAdsInRoot(root: Document | ShadowRoot | Element) {
  const adSelectors = [
    'iframe[src*="ads"]',
    'iframe[id*="google_ads"]',
    'div[id*="google_ads"]',
    'div[class*="ad-container"]',
    'ins.adsbygoogle',
    'a[href*="doubleclick.net"]',
    'div[id*="taboola"]',
    'div[id*="outbrain"]'
  ];

  const ads = root.querySelectorAll(adSelectors.join(','));

  ads.forEach(ad => {
      if ((ad as HTMLElement).dataset.replaced === "true") return;

      // console.log("Ad replacer: Found ad", ad);

      const img = document.createElement('img');
      img.src = getRandomImage();
      img.className = 'ad-replacer-image';
      img.title = "Replaced by Ad Image Replacer";
      img.dataset.replaced = "true";

      // If it's a wrapper, we might want to keep dimensions but clear content
      if (ad.parentNode) {
          ad.parentNode.replaceChild(img, ad);
      }
  });

  // Recursive Shadow DOM traversal
  const allElements = root.querySelectorAll('*');
  allElements.forEach(el => {
      if (el.shadowRoot) {
          replaceAdsInRoot(el.shadowRoot);
      }
  });
}

function replaceAds() {
  replaceAdsInRoot(document);
}

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

console.log("Ad Image Replacer content script loaded (React/Vite build).");
