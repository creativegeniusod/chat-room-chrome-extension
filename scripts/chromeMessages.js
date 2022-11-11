var Message;


const Runtime = chrome.runtime;
const Tabs = chrome.tabs;


/**
* All extensions of message should handle from here.
*/
Message = {

	/**
	* Send message from background/popup to Content/Web page.
	*/
	sendToWebpage: (sendToTab, data = {}) => {
		chrome.tabs.sendMessage(sendToTab.id, data);
	},


	/**
	* Send messages to extension background.
	*/
	sendToExtension: (data = {}) => {
		Runtime.sendMessage(null, data);
	},
};


/**
* Chrome extension sent/recieved message listeners.
*/
// MessageListeners = {
//
// 	Handle: (response) => {
// 		console.log("message send response: ", response);
// 	},
// };
