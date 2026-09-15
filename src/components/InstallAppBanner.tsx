"use client";

import { useState } from "react";
import { ChevronRight, Download, X } from "lucide-react";

/**
 * "Install MiMaji App" banner plus the how-to-install popup it opens.
 * Shared by the dashboard and the home page, so the instructions only
 * exist in one place.
 */
export default function InstallAppBanner() {
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInstallPopup(true)}
        className="w-full bg-gradient-to-r from-primary to-[#1a5a9a] rounded-xl p-4 mb-3 flex items-center gap-3 text-left hover:shadow-card transition-shadow"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Download size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-white">Install MiMaji App</p>
          <p className="text-white/70 text-xs">Add to your home screen for quick access</p>
        </div>
        <ChevronRight size={20} className="text-white/60" />
      </button>

      {/* Install App Popup */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-text-primary">Install MiMaji</h3>
              <button onClick={() => setShowInstallPopup(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-text-secondary text-sm mb-4">
                MiMaji works like an app! Add it to your home screen for instant access.
              </p>

              {/* iPhone Instructions */}
              <div className="mb-5">
                <h4 className="font-bold text-sm text-text-primary mb-2">iPhone (Safari)</h4>
                <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
                  <li>Open <span className="font-semibold text-text-primary">mimaji.co.ke</span> in Safari</li>
                  <li>Tap the <span className="font-semibold text-text-primary">Share</span> button (square with arrow)</li>
                  <li>Scroll down and tap <span className="font-semibold text-text-primary">&quot;Add to Home Screen&quot;</span></li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add&quot;</span> to confirm</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="mb-5">
                <h4 className="font-bold text-sm text-text-primary mb-2">Android (Chrome)</h4>
                <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
                  <li>Open <span className="font-semibold text-text-primary">mimaji.co.ke</span> in Chrome</li>
                  <li>Tap the <span className="font-semibold text-text-primary">three dots menu</span> (top right)</li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add to Home Screen&quot;</span> or <span className="font-semibold text-text-primary">&quot;Install App&quot;</span></li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add&quot;</span> to confirm</li>
                </ol>
              </div>

              <div className="bg-primary-light rounded-xl p-3">
                <p className="text-primary text-xs font-medium text-center">
                  Once installed, MiMaji will appear as an app icon on your home screen!
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowInstallPopup(false)}
                className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
