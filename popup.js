import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  // TODO: For the time being, we are only showing non repeating bookmarks
  // TODO: This should be changed to set function to set only the single time bookmark
  if (currentBookmarks.length > 0) {
    let lastBookmarkTime = -1;
    for (let i = 0; i < currentBookmarks.length; i++) {
      if (currentBookmarks[i].time === lastBookmarkTime) 
        continue;
      
      const bookmark = currentBookmarks[i];
      lastBookmarkTime = bookmark.time;
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});

const button = document.getElementsByClassName('btn')[0];
const rotate = document.getElementsByClassName('settings-btn')[0];
const autoButton = document.getElementById("autoPauseToggle")
const dislikeButton = document.getElementById("dislikeNumberToggle")

button.addEventListener('click', () => {
  const settings = document.getElementsByClassName("change-vis")[0];

  if (settings.style.display === 'block') {
    settings.style.display = 'none';
    rotate.classList.add('rotatedAntiClock');
    rotate.classList.remove('rotatedClock');
  } else {
    settings.style.display = 'block';
    rotate.classList.remove('rotatedAntiClock');
    rotate.classList.add('rotatedClock');
  }
});

let autoPause = true;
const data = await chrome.storage.sync.get(["autoPause"]);
if (data.autoPause) {
  autoPause = (data.autoPause == 1);
} else {
  await chrome.storage.sync.set({ ["autoPause"]: 1 });
}


autoButton.checked = autoPause

autoButton.addEventListener("click", async () => {
  autoPause = !autoPause;
  autoButton.checked = autoPause
  if (autoPause) {
    await chrome.storage.sync.set({ ["autoPause"]: 1 });
    autoButton.title = "Click to turn off autopause";
  } else {
    await chrome.storage.sync.set({ ["autoPause"]: -1 });
    autoButton.title = "Click to turn on autopause";
  }
});


let dislikeShow = true;
const data2 = await chrome.storage.sync.get(["dislikeNumberPreference"]);
if (data2.dislikeNumberPreference) {
  dislikeShow = (data2.dislikeNumberPreference == 1);
} else {
  await chrome.storage.sync.set({ ["dislikeNumberPreference"]: 1 });
}


dislikeButton.checked = dislikeShow

dislikeButton.addEventListener("click", async () => {
  dislikeShow = !dislikeShow;
  dislikeButton.checked = dislikeShow
  if (dislikeShow) {
    await chrome.storage.sync.set({ ["dislikeNumberPreference"]: 1 });
    autoButton.title = "Click to turn off visibility of dislike number";
  } else {
    await chrome.storage.sync.set({ ["dislikeNumberPreference"]: -1 });
    autoButton.title = "Click to turn on visibility of dislike number";
  }
});

