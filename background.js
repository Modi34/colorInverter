function check() {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs =>{
		let tab = tabs[0];
		if(tab && ~tab.url.indexOf('http')){
			let hostName = new URL( tab.url ).hostname;
		    	chrome.storage.local.get(hostName, data =>{
		    		changeIcon(tab.id, data[ hostName ]?.isEnabled || false)
		    	})
		}
	})
}

function changeIcon(id, isEnabled) {
    let path = isEnabled ? 'enabled_38.png' : 'disabled_38.png';
    chrome.browserAction.setIcon({ tabId: id, path })
}

chrome.tabs.onUpdated.addListener( check )
chrome.tabs.onActivated.addListener( check )
chrome.storage.onChanged.addListener(changed =>{
	let hostName = Object.keys(changed)[0];
	if(changed[ hostName ]?.oldValue?.isEnabled != changed[ hostName ]?.newValue?.isEnabled){
		check()
	}
});
