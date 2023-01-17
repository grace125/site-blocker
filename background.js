const rules = [ // Rules are checked in the order they appear
	{
		whitelist: [],
		blacklist: [
			/youtube\.com/,
			/twitter\.com/,
			/reddit\.com/,
			/netflix\.com/,
			/twitch\.com/
		],
		schedules: [{
			days: [1, 2, 3, 4, 5, 6], // Sunday-Saturday -- 0-6
			times: [
				{from: 0 *  3600, to: 7.5  * 3600}, // in seconds
				{from: 8 *  3600, to: 9.5  * 3600},
				{from: 10 * 3600, to: 11.5 * 3600},
				{from: 12 * 3600, to: 13.5 * 3600},
				{from: 14 * 3600, to: 15.5 * 3600},
				{from: 16 * 3600, to: 17.5 * 3600},
				{from: 18 * 3600, to: 19 * 3600},
				{from: 21.5 * 3600, to: 24 * 3600},
			]
		}],
		redirectUrl: "https://pointerpointer.com/"
	}
]

var ports = {};

function scheduleCheck(rule) {
	let date = new Date()
	let time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
	
	for (const schedule of rule.schedules) {
		if (schedule.days.indexOf(date.getDay()) != -1) {
			for (const t of schedule.times) {
				if (t.from <= time && time < t.to) {
					return true
				}
			}
		}
	}
	return false
}

function urlCheck(rule, url) {
	for (const regex of rule.whitelist) {
		if (regex.test(url)) {
			return false
		}
	}
	for (const regex of rule.blacklist) {
		if (regex.test(url)) {
			return true
		}
	}
	return false 
}


function redirectTabUrl(port) {
	return (msg) => {
		console.log(msg);
		if (msg.messageType = "urlCheck") {
			for (const rule of rules) {
				if (scheduleCheck(rule) && urlCheck(rule, msg.url)) {
					port.postMessage({ messageType: "redirectSite", url: rule.redirectUrl });
					return;
				}
			}
		}
	}
}

// Fires when a tab has been put into focus
chrome.tabs.onActivated.addListener(args => {
	chrome.tabs.query({active: true, windowId: args.windowId}).then(tabs => {
		for (const tab of tabs) {
			let port = chrome.tabs.connect(tab.id)
			port.postMessage({ messageType: "requestUrlCheck", url: tab.url });
			ports[tab.id] = port;
			port.onMessage.addListener(redirectTabUrl(port));
		}
	})
})

// Fires when a tab's url has been updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if ('url' in changeInfo) {
		let port = chrome.tabs.connect(tabId);
		port.postMessage({ messageType: "requestUrlCheck", url: changeInfo.url });
		ports[tabId] = port;
		port.onMessage.addListener(redirectTabUrl(port));
	}
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log(msg);
	if (msg.messageType = "urlCheck") {
		for (const rule of rules) {
			if (scheduleCheck(rule) && urlCheck(rule, msg.url)) {
				sendResponse({ messageType: "redirectSite", url: rule.redirectUrl });
				return;
			}
		}
	}
})
