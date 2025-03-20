"use strict";

(function () {
  let creating; // A global promise to avoid concurrency issues
  async function setupOffscreenDocument(path) {
    if (!("offscreen" in chrome)) {
      return;
    }
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });
  
    if (existingContexts.length > 0) {
      return;
    }
  
    // create offscreen document
    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
        url: path,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Enable text-to-speech functionality on any website.',
      });
      await creating;
      creating = null;
    }
  }


  // Listen for messages coming from contentScript or other scripts.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "textToSpeech") {
      setupOffscreenDocument('off_screen.html')
        .then(() => {
          if (twpConfig.get("textToSpeechService") === "bing") {
            chrome.runtime.sendMessage({ action: "offscreen_bing_textToSpeech", text: request.text, targetLanguage: request.targetLanguage }, 
              (response) => {
                sendResponse();
              });
          } else {
            chrome.runtime.sendMessage({ action: "offscreen_google_textToSpeech", text: request.text, targetLanguage: request.targetLanguage }, 
              (response) => {
                sendResponse();
              });
          }
        });

      return true;
    } else if (request.action === "stopAudio") {
      setupOffscreenDocument('off_screen.html')
        .then(() => {
          chrome.runtime.sendMessage({ action: "offscreen_google_stopAll" });
          chrome.runtime.sendMessage({ action: "offscreen_bing_stopAll" });
          // return chrome.offscreen.closeDocument();
        });
    }
  });

  // Listen for changes to the audio speed setting and apply it immediately.
  twpConfig.onReady(async () => {
    twpConfig.onChanged((name, newvalue) => {
      if (name === "ttsSpeed") {
        chrome.runtime.sendMessage({ action: "offscreen_google_ttsSpeed", speed: newvalue });
        chrome.runtime.sendMessage({ action: "offscreen_bing_ttsSpeed", speed: newvalue });
      } else if (name === "ttsVolume") {
        chrome.runtime.sendMessage({ action: "offscreen_google_ttsVolume", volume: newvalue });
        chrome.runtime.sendMessage({ action: "offscreen_bing_ttsVolume", volume: newvalue });
      } else if (name === "proxyServers") {
        // const proxyServers = newvalue;
        // if (proxyServers?.google?.ttsServer) {
        //   const url = new URL(googleService.baseURL);
        //   url.host = proxyServers.google.ttsServer;
        //   googleService.baseURL = url.toString();
        // } else {
        //   const url = new URL(googleService.baseURL);
        //   url.host = "translate.google.com";
        //   googleService.baseURL = url.toString();
        // }
      }
    });

    chrome.runtime.sendMessage({ action: "offscreen_google_ttsSpeed", speed: twpConfig.get("ttsSpeed") });
    chrome.runtime.sendMessage({ action: "offscreen_bing_ttsSpeed", speed: twpConfig.get("ttsSpeed") });
    chrome.runtime.sendMessage({ action: "offscreen_google_ttsVolume", volume: twpConfig.get("ttsVolume") });
    chrome.runtime.sendMessage({ action: "offscreen_bing_ttsVolume", volume: twpConfig.get("ttsVolume") });

    // const proxyServers = twpConfig.get("proxyServers");
    // if (proxyServers?.google?.ttsServer) {
    //   const url = new URL(googleService.baseURL);
    //   url.host = proxyServers.google.ttsServer;
    //   googleService.baseURL = url.toString();
    // }
  });
})();
