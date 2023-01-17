/* 
 * Takes a url, and adds stuff to it FIXME: rename/document
 */
function modifyUrl(url) {
	var url = url;
	if (url.match(/youtube\.com\/watch.*?/) || url.match(/youtube\.com\/\@/)) {
		url += "?channel="
		url += document.querySelector("#meta-contents #channel-name .yt-formatted-string").textContent.trim();
	}
	console.log(url)
	return url
}

chrome.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener((msg) => {
		if (msg.messageType === "requestUrlCheck") {
			setTimeout(() => {
				port.postMessage({
					messageType: "urlCheck",
					url: modifyUrl(msg.url)
				});
			}, 1000)
		}
		if (msg.messageType === "redirectSite") {
			window.location.assign(msg.url);
		}
	});
});

setTimeout(() => {
	chrome.runtime.sendMessage({
		messageType: "urlCheck",
		url: modifyUrl(window.location.href)
	}).then((msg) => {
		if (msg.messageType === "redirectSite") {
			console.log(msg.url)
			window.location.assign(msg.url); // FIXME: change to msg.url
		}
	});
}, 1000)


