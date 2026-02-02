import React, { useEffect, useState } from 'react';
import { Upload, X, Save } from 'lucide-react';
import ThemeCard from '../components/ThemeCard';

// Defaults
const PRESETS = [
  { id: 'lebron', name: 'Lebron', preview: 'https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_5253,h_2954/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/ImagnImages/mmsport/all_lakers/01k90cyr2szk5wwnxpmr.jpg' },
  { id: 'pixel_art', name: 'Pixel Art (Premium)', preview: 'https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_5253,h_2954/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/ImagnImages/mmsport/all_lakers/01k90cyr2szk5wwnxpmr.jpg' },
  { id: 'minimalist', name: 'Minimalist (Premium)', preview: 'https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_5253,h_2954/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/ImagnImages/mmsport/all_lakers/01k90cyr2szk5wwnxpmr.jpg' }, 
];

const Options = () => {
  const [currentTheme, setCurrentTheme] = useState('lebron');
  const [userImages, setUserImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Load state
    chrome.storage.local.get(['theme', 'userImages'], (result) => {
      if (result.theme) setCurrentTheme(result.theme);
      if (result.userImages) setUserImages(result.userImages);
    });
  }, []);

  const handleThemeSelect = (id: string) => {
    setCurrentTheme(id);
    saveSettings(id, userImages);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (userImages.length + files.length > 5) {
      showStatus('Max 5 images allowed!', 'error');
      return;
    }

    const promises: Promise<string>[] = [];
    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
         showStatus(`Skipped ${file.name} (too large > 2MB)`, 'error');
         return;
      }
      
      promises.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Basic compression via canvas could go here, for now direct base64
            resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }));
    });

    Promise.all(promises).then(newImages => {
      const updated = [...userImages, ...newImages];
      setUserImages(updated);
      
      if (currentTheme === 'my_uploads') {
          saveSettings(currentTheme, updated);
      } else {
          chrome.storage.local.set({ userImages: updated });
      }
      showStatus('Images uploaded!');
    });
  };

  const removeUserImage = (index: number) => {
      const updated = userImages.filter((_, i) => i !== index);
      setUserImages(updated);
      if (currentTheme === 'my_uploads') {
          saveSettings(currentTheme, updated);
      } else {
        chrome.storage.local.set({ userImages: updated });
      }
  };

  const saveSettings = (theme: string, images: string[]) => {
    chrome.storage.local.set({ theme, userImages: images }, () => {
      try {
        chrome.runtime.sendMessage({ type: 'THEME_CHANGED', theme, images }, (response) => {
          if (chrome.runtime.lastError) {
            // Ignore connection errors if popup/content currently inactive
            console.log('Message status:', chrome.runtime.lastError.message);
          }
        });
      } catch (e) {
        console.log('Extension context invalid', e);
      }
      showStatus('Settings saved!');
    });
  };

  const showStatus = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Theme Settings</h1>
        <p className="text-gray-600">Choose what replaces the ads on your screen.</p>
      </header>

      {/* Preset Themes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Presets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PRESETS.map(theme => (
            <ThemeCard 
              key={theme.id}
              {...theme}
              previewUrl={theme.preview}
              isActive={currentTheme === theme.id}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>
      </section>

      {/* Custom Uploads */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Uploads</h2>
            <span className="text-sm text-gray-500">{userImages.length} / 5 used</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           {/* Theme Selection for Uploads */}
           <div className="mb-6">
                <ThemeCard 
                    id="my_uploads"
                    name="Use My Uploads"
                    previewUrl={userImages[0] || 'https://placehold.co/300x200?text=No+Images'}
                    isActive={currentTheme === 'my_uploads'}
                    onSelect={handleThemeSelect}
                    disabled={userImages.length === 0}
                />
           </div>

           {/* Upload Area */}
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {userImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeUserImage(idx); }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <X size={12} />
                      </button>
                  </div>
              ))}
              
              {userImages.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="text-gray-400 mb-2" />
                      <span className="text-xs text-center text-gray-500 px-2">Click to upload</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                  </label>
              )}
           </div>
           
           <p className="text-xs text-gray-400 mt-4">Max 5 images. Max 2MB per image. Local storage only.</p>
        </div>
      </section>

      {/* Status Toast */}
      {status && (
          <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in flex items-center">
              <span className="mr-2">✨</span> {status}
          </div>
      )}
    </div>
  );
};

export default Options;
