/**
* Chat Window Frame messages.
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	switch (request.action) {

		case `newChatMessage-${window.chatInChannel}`:
			sendResponse({ status: "success" });

			Render.userMessage(request.data);
			break;

		case `newChatMessage-${window.chatOutChannel}`:
			sendResponse({ status: "success" });

			Render.myMessage(request.data);
			break;

		case `renderSavedMessages`:
			sendResponse({ status: "success" });

			Render.userMissedMessages(request.data.userMessages);
			break;

		default:
			sendResponse({ status: "default case" });
	}

});