/**
* Extension onInstalled Event.
*/
chrome.runtime.onInstalled.addListener(Listeners.onInstalled);


/**
* Extension icon clicked.
*/
chrome.browserAction.onClicked.addListener(Listeners.onExtensionIconClicked);


/**
* Recieve messages in Extension Background.
*/
Runtime.onMessage.addListener(Listeners.onMessage);



/**
* Remove rooms from Extension. when its launched.
*/
chrome.windows.onCreated.addListener(Listeners.onWindowCreated);