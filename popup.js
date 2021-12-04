let hostName = '';
let settings = {}

chrome.tabs.query({ currentWindow: true, active: true }, tabs=>{
	if(!tabs[0]){return}
	hostName = new URL(tabs[0].url).hostname;
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
	}
}

form.oninput = e =>{
	if(e.target.name){
		let {name, value} = e.target;
		settings[ hostName ][ name ] = value;
		chrome.storage.local.set( settings )

		if(name == 'invert'){
			input_hue_range.style.filter = `invert(${value}%)`;
			label_invert.textContent = value;
		}else if(name == 'hue'){
			label_hue.textContent = value;
		}
	}
}