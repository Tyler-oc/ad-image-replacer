// Theme assets
const THEMES: Record<string, string[]> = {
  "Lebron": [
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_5253,h_2954/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/ImagnImages/mmsport/all_lakers/01k90cyr2szk5wwnxpmr.jpg",
      "https://static01.nyt.com/images/2020/09/21/sports/21JPstreeter-sot-print/merlin_177247077_e7419310-206a-4084-990c-cd91782df8dc-articleLarge.jpg?quality=75&auto=webp&disable=upscale",
      "https://static01.nyt.com/images/2020/03/09/sports/09nba-topteams1/09nba-topteams1-mediumSquareAt3X.jpg",
      "https://a.espncdn.com/i/headshots/nba/players/full/1966.png", // LeBron
      "https://e0.365dm.com/18/07/768x432/skysports-lebron-james-nba_4351375.jpg?20180702172340",
      "https://the-talks.com/wp-content/uploads/2011/09/Lebron-James-01.jpg",
  ],
  "Van Gogh": [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Vincent_van_Gogh_%281853-1890%29_Caf%C3%A9terras_bij_nacht_%28place_du_Forum%29_Kr%C3%B6ller-M%C3%BCller_Museum_Otterlo_23-8-2016_13-35-40.JPG",
      "https://www.theparisreview.org/blog/wp-content/uploads/2015/06/vincentvangogh-women-miners-carrying-coal-1881-82.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg/1280px-Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/330px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/16/Vincent_van_Gogh_-_Garden_at_Arles_-_Google_Art_Project.jpg",
  ],
  "Yoshimoto Nara": [
      "https://cdn.sanity.io/images/dqllnil6/production/ebf28df2c88fdde7522402a96e7ad7ae45219345-1430x1600.jpg?w=3840&q=60&auto=format",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkM-Pvp1Q_rI1RXlBbfHz0lSIWuewX8fBEkQ&s",
      "https://www-images.lacma.org/s3fs-public/styles/exhibition_image/public/primary_image/2020-04/P-2019-007WEB.jpg?itok=MRrYC0kk",
      "https://artsdot.com/media/artworks/images/full/52/7d/527d1d405dd347f89dfb0bef37a2d633.jpg",
      "https://d7hftxdivxxvm.cloudfront.net/?height=220&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F5HTgmLNAqt9AHyKhXqBi9A%2Flarger.jpg&width=350",
  ],
  "Pixel_Art": [
      "https://art.pixilart.com/8c2813155827607.png", 
      "https://art.pixilart.com/sr2786733220556.png"
  ],
  "Minimalist": [
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
  ]
};

let currentTheme = 'Lebron';
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
  let source = THEMES['Lebron'];

  if (currentTheme === 'my_uploads' && userImages.length > 0) {
      source = userImages;
  } else if (THEMES[currentTheme]) {
      source = THEMES[currentTheme];
  }

  if (source.length === 0 && THEMES['Lebron']) source = THEMES['Lebron'];
  // Final fallback
  if (!source || source.length === 0) return "https://static01.nyt.com/images/2020/09/21/sports/21JPstreeter-sot-print/merlin_177247077_e7419310-206a-4084-990c-cd91782df8dc-articleLarge.jpg";
  
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
      img.alt = "Ad replaced by fun image";
      img.dataset.replaced = "true";

      img.onerror = () => {
          console.log("Ad Image Replacer: Image failed to load, using placeholder.");
          img.src = chrome.runtime.getURL('assets/placeholder.svg'); // NOTE: Vite builds assets to assets/
          img.onerror = null; 
      };

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
