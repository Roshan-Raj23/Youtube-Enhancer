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

// chrome.runtime.onMessage.addListener((request , sendResponse) => {
//   if (request.action === "setData") {
//       chrome.storage.local.set({ myData: request.data }, () => {
//           sendResponse({ status: "success", message: "Data saved!" });
//       });
//       return true; // Keeps sendResponse active
//   }

//   if (request.action === "getData") {
//       chrome.storage.local.get(["myData"], (result) => {
//           sendResponse({ status: "success", data: result.myData || "No data found!" });
//       });
//       return true;
//   }
// });