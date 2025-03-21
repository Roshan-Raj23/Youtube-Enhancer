chrome.tabs.onUpdated.addListener((tabId, _ , tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    console.log(urlParameters);
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveImage") {
      chrome.downloads.download({
        url: request.imageURL,
        filename: "youtube_frame.png",
        saveAs: true
      });
      sendResponse({ status: "success" });
  }
});