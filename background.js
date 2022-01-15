function check() {
	getActiveTab(tab => {
		let hostName = new URL( tab.url || tab.pendingUrl ).hostname
		chrome.storage.local.get(hostName, data =>
	    		chrome.browserAction.setIcon({ 
	    			tabId: tab.id, 
	    			path: data[ hostName ]?.isEnabled ? 'enabled.png' : 'disabled.png' 
	    		})
	    	)
	})
}

function getActiveTab(callback){
	chrome.windows.getCurrent({populate: true}, function(win){
		for( let tab of win.tabs ){
			if(tab.active){
				return callback( tab )
			}
		}
		return callback( false )
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