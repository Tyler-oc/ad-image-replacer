// FUN_IMAGES is defined in ad_images.js

// Listen for theme changes from Options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'THEME_CHANGED') {
        console.log("Theme changed:", message.theme);
        // Force a re-run of ad replacement with new settings
        // In a real implementation this would update the global FUN_IMAGES
        // For now, we'll just reload to pick up changes is the simplest reliable way
        // or we could re-trigger replaceAds() if we had the new images passed in message
        if (message.images && message.images.length > 0) {
            // Update local state if we were using it (mock)
        }
        replaceAds();
    }
});

function getRandomImage() {
    if (typeof FUN_IMAGES !== 'undefined' && FUN_IMAGES.length > 0) {
        return FUN_IMAGES[Math.floor(Math.random() * FUN_IMAGES.length)];
    }
    return "https://placekitten.com/200/200"; // Fallback
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
        img.dataset.replaced = "true";

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
