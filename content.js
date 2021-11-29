let hostname = document.location.hostname;

let styleNode = document.createElement('style')

let isCurrentlyEnabled = false;
function invertStyles(params){
	if(!params){return}
	let {isEnabled, hue = 0, invert = 85} = params;
	let filter = `invert(${100-(100-invert)}%) hue-rotate(${365-hue}deg)`;
	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg); background: #fff} video,img{filter:${filter};}`

	isEnabled ?
		document.head.appendChild(styleNode) :
		styleNode.remove()

	isCurrentlyEnabled = true;
	scanBackgroundImageNodes(filter)
}

chrome.storage.onChanged.addListener(changes => hostname in changes && invertStyles( changes[ hostname ].newValue ));
chrome.storage.local.get(hostname, data => invertStyles( data[ hostname ] ))

let lastFilter = ''
let xpathExpression = new XPathEvaluator().createExpression(`//*[contains(@style, 'url(')]`)
async function scanBackgroundImageNodes(filter, parent = document){
	lastFilter = filter;
	let iterator = xpathExpression.evaluate(parent, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
	let node;
	while(node = iterator.iterateNext()){
		node.style.filter = filter
	}
}

var observer = new MutationObserver(_=>{
	if(isCurrentlyEnabled && lastFilter){
		scanBackgroundImageNodes(lastFilter)
	}
});
observer.observe(document, {childList: true, subtree: true});