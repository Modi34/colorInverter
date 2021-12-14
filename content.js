let hostName = document.location.hostname;
let xpathExpression = new XPathEvaluator().createExpression(`//*[not(contains(@data-color-inverter, 'true')) and contains(@style, 'url(')]`)
let isObserving = false;
let timeout = false;

let styleNode = document.createElement('style')
let observer = new MutationObserver( scanBackgroundImageNodes );

function invertStyles(params){
	if(!params){return}
	let {isEnabled = false, hue = 0, invert = 85} = params;

	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg); background-color: #fff}*::selection{background-color:#27b8d2}`+
				`video,img,svg,iframe,[data-color-inverter='true']{filter: invert(${invert > 50 ? 1 : 0}) hue-rotate(-${hue}grad);}`

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

chrome.storage.onChanged.addListener(changes =>{
	 if(hostName in changes){
		timeout&& clearTimeout( timeout )
		timeout = setTimeout(_=>invertStyles( changes[ hostName ].newValue ), 0)
	}
});
chrome.storage.local.get(hostName, data => invertStyles( data[ hostName ] ))

async function scanBackgroundImageNodes(){
	let iterator = xpathExpression.evaluate(document, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
	let node;
	while(node = iterator.iterateNext()){
		setTimeout(n=>n.dataset.colorInverter = true, 0, node)
	}
}