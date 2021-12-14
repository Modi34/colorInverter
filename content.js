let hostName = document.location.hostname;
let xpathExpression = new XPathEvaluator().createExpression(`//*[not(contains(@data-color-inverter, 'true')) and contains(@style, 'url(')]`)
let isObserving = false;
let timeout = false;

let styleNode = document.createElement('style')
let observer = new MutationObserver( scanBackgroundImageNodes );
let html = document.children[0]
let isBackgroundChecked = false;
let isBackgroundSet = false;

let latestParams = false

function invertStyles(params){
	if(!params){return}
	latestParams = params;

	let {isEnabled = false, hue = 0, invert = 85} = params;

	styleNode.textContent = `html{filter: invert(${invert}%) hue-rotate(${hue}deg)}`+
				`*::selection{background-color:#27b8d2}`+
				`video,img,svg,iframe,[data-color-inverter='true']{filter: invert(${invert > 50 ? 1 : 0}) hue-rotate(-${hue}grad);}`+
				`[data-color-inverter='true'] img, [data-color-inverter='true'] video, [data-color-inverter='true'] svg, [data-color-inverter='true'] iframe{filter: invert(0)}`

	if(isEnabled){
		if(!isObserving){ 
			observer.observe(document, {childList: true, subtree: true})
			isObserving = true;
		}

		document.head.appendChild( styleNode )
		scanBackgroundImageNodes()

		fixBackgroundColor()
	}else{
		observer.disconnect();
		isObserving = false

		styleNode.remove()
		if(!isBackgroundSet){
			html.style.backgroundColor=''
		}
	}

}

chrome.storage.onChanged.addListener(changes =>{
	 if(hostName in changes){
		timeout&& clearTimeout( timeout )
		timeout = setTimeout(_=>invertStyles( changes[ hostName ].newValue ), 0)
	}
});
chrome.storage.local.get(hostName, data => {
	if(data[ hostName ]){
		latestParams = data[ hostName ];
		invertStyles( latestParams )
		document.onreadystatechange = () => {
			if (document.readyState === 'complete') {
				fixBackgroundColor()
			}
		};
	}
})

async function scanBackgroundImageNodes(){
	let iterator = xpathExpression.evaluate(document, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
	let node;
	while(node = iterator.iterateNext()){
		setTimeout(n=>n.dataset.colorInverter = true, 0, node)
	}
}

function fixBackgroundColor(){
	if(!isBackgroundChecked){
		if('isBackgroundSet' in latestParams){
			isBackgroundSet = latestParams.isBackgroundSet;
			isBackgroundChecked = true
		}else if(document.readyState === 'complete') {
			html.style.backgroundColor=''
			isBackgroundSet = window.getComputedStyle(html).backgroundColor != 'rgba(0, 0, 0, 0)'
			
			let newResult = {}
			latestParams.isBackgroundSet = isBackgroundSet;
			newResult[hostName] = latestParams
			chrome.storage.local.set(newResult)

			isBackgroundChecked = true
		}
	}
	if(!isBackgroundSet){
		html.style.backgroundColor='#fffffffa'
		requestAnimationFrame(_=>html.style.backgroundColor='#fff')
	}
}