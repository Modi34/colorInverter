let hostName = '';
let settings = {}

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

getActiveTab(tab => {
	if(!tab){return}
	console.log(tab)

	let parsedUrl = new URL(tab.url)
	if(parsedUrl.protocol == 'chrome:'){
		document.body.className = 'unsupported'
		document.body.onmousedown = e=>window.close();
		return
	}
	hostName = parsedUrl.hostname;
	reloadSettings()
})

function reloadSettings(){
	chrome.storage.local.get(hostName, data =>{
		if(!data[ hostName ]){
			data[ hostName ] = {
				isEnabled: false,
				invert: 90,
				hue: 50
			}
		}
		settings = data
		updateForm()

		if(!data[ hostName ].isEnabled){
			button_enable.click()
		}
	})
}

function updateForm(){
	let {isEnabled, hue, invert} = settings[ hostName ];

	form.classList[isEnabled ? 'add' : 'remove']('enabled')

	input_invert_range.value = invert;
	label_invert.textContent = invert;
	input_hue_range.value = hue;
	label_hue.textContent = hue;
	input_hue_range.style.filter = `invert(${invert}%)`;
}

form.onsubmit = e=>{
	e.preventDefault()
	if(e.submitter.name == 'isEnabled'){
		let isEnabled = e.submitter.value == 'true';
		settings[ hostName ].isEnabled = isEnabled;
		chrome.storage.local.set( settings )
		updateForm()

		!isEnabled && window.close()
	}
}

form.oninput = e =>{
	if(e.target.name){
		let {name, value} = e.target;
		settings[ hostName ][ name ] = value;
		chrome.storage.local.set( settings )

		updateForm()
	}
}