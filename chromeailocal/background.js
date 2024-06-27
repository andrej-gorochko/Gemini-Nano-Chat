chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendNotification") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: request.title,
        message: request.message
      });
    }
  });
  