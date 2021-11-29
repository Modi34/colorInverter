form.onsubmit = e=>{
	e.preventDefault()
	if(e.submitter.name == 'isEnabled'){
		let isEnabled = e.submitter.value == 'true';
		settings[ hostName ].isEnabled = isEnabled;
		chrome.storage.local.set( settings )
		updateForm()
	}
}

form.oninput = e => {
	if(e.target.name){
		settings[ hostName ][ e.target.name ] = e.target.value;
		chrome.storage.local.set( settings )
	}
}

let hostName = '';
let settings = {}
chrome.tabs.query({ currentWindow: true, active: true }, tabs=>{
	if(!tabs[0]){return}
	hostName = new URL(tabs[0].url).hostname;
	reloadSettings()
})

function reloadSettings(){
	chrome.storage.local.get(hostName, data => {
		if(!data[ hostName ]){
			data[ hostName ] = {
				isEnabled: false,
				invert: 85,
				hue: 0
			}
		}
		settings = data
		updateForm()
	})
}

function updateForm(){
	let {isEnabled, hue, invert} = settings[ hostName ];

	form.classList.add(isEnabled? 'enabled' : 'disabled')
	form.classList.remove(!isEnabled? 'enabled' : 'disabled')

	input_invert_range.value = invert
	input_hue_range.value = hue
}