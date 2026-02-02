// State for ad replacement
let activeTheme = 'Lebron';
let activeImages = [];

function updateTheme(themeId, customImages) {
    console.log(`Ad Replacer: Switching to theme '${themeId}'`);
    activeTheme = themeId;
    
    if (themeId === 'my_uploads' && customImages && customImages.length > 0) {
        activeImages = customImages;
    } else if (typeof THEME_IMAGES !== 'undefined' && THEME_IMAGES[themeId]) {
        activeImages = THEME_IMAGES[themeId];
    } else {
        // Fallback or default
        if (typeof THEME_IMAGES !== 'undefined' && THEME_IMAGES['Lebron']) {
             activeImages = THEME_IMAGES['Lebron'];
        } else {
             activeImages = [];
        }
    }
    console.log(`Ad Replacer: Loaded ${activeImages.length} images for theme '${themeId}'`);
}

// Initialize theme from storage
chrome.storage.local.get(['theme', 'userImages'], (result) => {
    updateTheme(result.theme || 'Lebron', result.userImages);
    replaceAds();
});

// Listen for theme changes from Options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'THEME_CHANGED') {
        console.log("Theme changed message received:", message.theme);
        updateTheme(message.theme, message.images);
        // Force re-replacement
        replaceAds();
    }
});

function getRandomImage() {
    if (activeImages && activeImages.length > 0) {
        return activeImages[Math.floor(Math.random() * activeImages.length)];
    }
    // Fallback if no images are loaded
    return "https://static01.nyt.com/images/2020/09/21/sports/21JPstreeter-sot-print/merlin_177247077_e7419310-206a-4084-990c-cd91782df8dc-articleLarge.jpg?quality=75&auto=webp&disable=upscale"; 
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

function replaceAdsInRoot(root) {
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
        if (ad.dataset.replaced === "true") return;

        console.log("Ad replacer: Found ad", ad);

        const img = document.createElement('img');
        img.src = getRandomImage();
        img.className = 'ad-replacer-image';
        img.title = "Replaced by Ad Image Replacer";
        img.alt = "Ad replaced by fun image";
        img.dataset.replaced = "true";
        
        // Fallback to local placeholder if remote image fails
        img.onerror = () => {
            console.log("Ad Image Replacer: Image failed to load, using placeholder.");
            img.src = chrome.runtime.getURL('placeholder.svg');
            img.onerror = null; // Prevent infinite loop if placeholder fails
        };

        // If it's a wrapper, we might want to keep dimensions but clear content
        // For now, replacing the element is the main strategy
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

// Initial replacement
replaceAds();

// Watch for dynamic ads (and shadow roots)
const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            shouldRun = true;
            // Also need to observe new shadow roots if attached, but MutationObserver doesn't directly see shadow root attachment.
            // We rely on scanning added nodes.
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

console.log("Ad Image Replacer content script loaded with Shadow DOM support.");
