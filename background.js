function check() {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs=>{
		if(!tabs[0]){return}
		let tab = tabs[0];
		if(tab.url.indexOf('http') > -1){
			let hostname = new URL( tab.url ).hostname;
		    	chrome.storage.local.get(hostname, data => {
		    		changeIcon(tab.id, data[hostname]?.isEnabled || false)
		    	})
		}
	})
}

function changeIcon(id, isEnabled) {
    let path = isEnabled ? 'enabled_38.png' : 'disabled_38.png';
    chrome.browserAction.setIcon({ tabId: id, path })
}

chrome.tabs.onUpdated.addListener(check)
chrome.tabs.onActivated.addListener(check)
chrome.storage.onChanged.addListener(check);
