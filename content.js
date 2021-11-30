let hostname = document.location.hostname;
let xpathExpression = new XPathEvaluator().createExpression(`//*[not(contains(@class, 'colorInverter')) and contains(@style, 'url(')]`)
let isObserving = false;

let styleNode = document.createElement('style')
let observer = new MutationObserver(scanBackgroundImageNodes);

function invertStyles(params){
	if(!params){return}
	let {isEnabled, hue = 0, invert = 85} = params;
	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg); background: #fff} video,img,svg,.colorInverter{filter: invert(${100-(100-invert)}%) hue-rotate(${365-hue}deg);}`

	if(isEnabled){
		!isObserving && observer.observe(document, {childList: true, subtree: true})
		isObserving = true;

		document.head.appendChild(styleNode)
		scanBackgroundImageNodes()
	}else{
		observer.disconnect();
		isObserving = false

		styleNode.remove()
	}

}

chrome.storage.onChanged.addListener(changes => hostname in changes && invertStyles( changes[ hostname ].newValue ));
chrome.storage.local.get(hostname, data => invertStyles( data[ hostname ] ))

async function scanBackgroundImageNodes(){
	let iterator = xpathExpression.evaluate(document, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
	let node;
	while(node = iterator.iterateNext()){
		setTimeout(n=>n.classList.add('colorInverter'), 0, node)
	}
}