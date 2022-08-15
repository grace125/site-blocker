chrome.runtime.onMessage.addListener(url => { window.location.assign(url) })
chrome.runtime.sendMessage(null).then(url => { window.location.assign(url) })
