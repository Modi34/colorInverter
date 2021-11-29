let hostname = document.location.hostname;

let styleNode = document.createElement('style')

function invertStyles(params){
	let {isEnabled, hue = 0, invert = 85} = params;
	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg); background: #fff} video,img{filter: invert(1) hue-rotate(${365-hue}deg);}`

	isEnabled ?
		document.head.appendChild(styleNode) :
		styleNode.remove()
}

chrome.storage.onChanged.addListener(changes => hostname in changes && invertStyles( changes[ hostname ].newValue ));
chrome.storage.local.get(hostname, data => invertStyles( data[ hostname ] ))