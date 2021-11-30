function check() {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs =>{
		let tab = tabs[0];
		if(tab && ~tab.url.indexOf('http')){
			let hostName = new URL( tab.url ).hostname;
		    	chrome.storage.local.get(hostName, data =>
		    		chrome.browserAction.setIcon({ 
		    			tabId: tab.id, 
		    			path: data[ hostName ]?.isEnabled ? 'enabled_38.png' : 'disabled_38.png' 
		    		})
		    	)
		}
	})
}

chrome.tabs.onUpdated.addListener( check )
chrome.tabs.onActivated.addListener( check )
chrome.storage.onChanged.addListener(changed =>{
	let hostName = Object.keys(changed)[0];
	if(changed[ hostName ]?.oldValue?.isEnabled != changed[ hostName ]?.newValue?.isEnabled){
		check()
	}
});
