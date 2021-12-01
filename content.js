let hostName = document.location.hostname;
let xpathExpression = new XPathEvaluator().createExpression(`//*[not(contains(@class, 'colorInverter')) and contains(@style, 'url(')]`)
let isObserving = false;

let styleNode = document.createElement('style')
let observer = new MutationObserver( scanBackgroundImageNodes );

function invertStyles(params){
	if(!params){return}
	let {isEnabled = false, hue = 0, invert = 85} = params;

	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg); background-color: ${invert > 50 ? '#fff' : '#000'}}`+
				`video,img,svg,iframe,.colorInverter{filter: invert(${invert > 50 ? 1 : 0}) hue-rotate(-${hue}grad);}`

	if(isEnabled){
		if(!isObserving){ 
			observer.observe(document, {childList: true, subtree: true})
			isObserving = true;
		}

		document.head.appendChild( styleNode )
		scanBackgroundImageNodes()
	}else{
		observer.disconnect();
		isObserving = false

		styleNode.remove()
	}

}

chrome.storage.onChanged.addListener(changes => hostName in changes && invertStyles( changes[ hostName ].newValue ));
chrome.storage.local.get(hostName, data => invertStyles( data[ hostName ] ))

async function scanBackgroundImageNodes(){
	let iterator = xpathExpression.evaluate(document, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
	let node;
	while(node = iterator.iterateNext()){
		setTimeout(n=>n.classList.add('colorInverter'), 0, node)
	}
}