(() => {
  let youtubeLeftControls, youtubePlayer, youtubeRightControls;
  let currentVideo = "";
  let currentVideoPaused = false , currentVideoAutoPause = true;
  let currentVideoBookmarks = [];

  document.addEventListener("visibilitychange", () => {
    if (!currentVideoAutoPause) return;

    if (document.visibilityState === "hidden") {
      currentVideoPaused = youtubePlayer.paused;
      youtubePlayer.pause();
    } else if (document.visibilityState === "visible") {
      if (currentVideoPaused == false) 
        youtubePlayer.play();
    }
  });

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    // TODO:: Add a form to add a bookmark with a description
    // youtubePlayer.pause();

    // const tempCheck = document.createElement("div");
    // tempCheck.innerHTML = `
    // <form onsubmit="calls()">
    //     <input type="text" placeholder="Name">
    //     <input type="submit" value="submit this form">
    // </form>`;
    // tempCheck.style.position = "absolute";
    // tempCheck.style.zIndex = "1000";
    
    // const par = document.getElementsByClassName("ytp-player-content")[0];
    // par.appendChild(tempCheck);


    const currentTime = Math.round(youtubePlayer.currentTime);
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };
    
    currentVideoBookmarks = await fetchBookmarks();
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  const saveScreenShotEventHandler = () => {
    youtubePlayer.pause();
    captureFrame();


    // if (!captureFrame())
    //   alert("Failed to save screenshot!");
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    if (!bookmarkBtnExists) {
      youtubePlayer = document.getElementsByClassName('video-stream')[0];
      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];

      
      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";


      const autoPauseBtn = document.createElement("div");
      autoPauseBtn.className = "ytp-button autoPauseBtn-div";
      autoPauseBtn.title = "Click to turn off autopause";

      const autoPauseBtnLabel = document.createElement("label");
      autoPauseBtnLabel.innerHTML = 
        `<input type="checkbox" id="autoPauseToggle" checked="checked">
          <span class="slider"></span>`;
      autoPauseBtnLabel.className = "switch";
      autoPauseBtn.appendChild(autoPauseBtnLabel);

      // youtubeLeftControls.appendChild(bookmarkBtn);
      // youtubeLeftControls.appendChild(autoPauseBtn);

      const screenshotBtn = document.createElement("div");
      const screenshotBtnImg = document.createElement("img");

      screenshotBtn.className = "ytp-button screenshot-btn-div";
      screenshotBtnImg.src = chrome.runtime.getURL("assets/screenshot.png");
      screenshotBtnImg.className = "ytp-button screenshot-btn";
      screenshotBtn.title = "Click to take a screenshot";
      screenshotBtn.appendChild(screenshotBtnImg);
      
      
      youtubeRightControls.insertBefore(bookmarkBtn, youtubeRightControls.firstChild);
      youtubeRightControls.insertBefore(screenshotBtn, youtubeRightControls.firstChild);
      youtubeRightControls.insertBefore(autoPauseBtn, youtubeRightControls.firstChild);
      
      
      screenshotBtn.addEventListener("click", saveScreenShotEventHandler);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
      document.getElementById("autoPauseToggle").addEventListener("click", () => {
        currentVideoAutoPause = !currentVideoAutoPause;
        if (currentVideoAutoPause) {
          autoPauseBtn.title = "Click to turn off autopause";
        } else {
          autoPauseBtn.title = "Click to turn on autopause";
        }
      });

    }
  };


  const captureFrame = () => {
    if (!youtubePlayer) {
        console.error("YouTube video not found!");
        return;
    }
  
    let canvas = document.createElement("canvas");
    canvas.width = youtubePlayer.videoWidth;
    canvas.height = youtubePlayer.videoHeight;
  
    let ctx = canvas.getContext("2d");
    ctx.drawImage(youtubePlayer, 0, 0, canvas.width, canvas.height);
  
    // Convert to image
    let imageURL = canvas.toDataURL("image/png");
  
    chrome.runtime.sendMessage({ action: "saveImage", imageURL: imageURL }, (response) => {});
  }
  

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
      // if (youtubePlayer.paused) 
      //   youtubePlayer.play();
    } else if ( type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

      response(currentVideoBookmarks);
    }
  });

  newVideoLoaded();
})();

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};