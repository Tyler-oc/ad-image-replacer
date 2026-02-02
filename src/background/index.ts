chrome.runtime.onInstalled.addListener(() => {
  console.log("Ad Image Replacer extension installed.");
  
  // Initialize default storage values if not present
  chrome.storage.local.get(['theme', 'userImages'], (result) => {
    if (!result.theme) {
      chrome.storage.local.set({ theme: 'classic_cats' });
    }
  });
});
