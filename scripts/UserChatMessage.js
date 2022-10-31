/**
* Chat Window Frame messages.
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	switch (request.action) {

		case `newChatMessage-${window.chatInChannel}`:
			sendResponse({ status: "success" });

			console.log('other message', request.data);
			Render.userMessage(request.data);
			break;

		case `newChatMessage-${window.chatOutChannel}`:
			sendResponse({ status: "success" });

			console.log('my message', request.data);
			Render.myMessage(request.data);
			break;

		case `renderSavedMessages`:
			sendResponse({ status: "success" });

			Render.userMissedMessages(request.data.userMessages);
			break;

		case `newRoomChatMessage-${window.inOutChannel}`:
			sendResponse({ status: "success" });

			Render.userRoomMessage(request.data);
			break;

		case `renderRoomSavedMessages`:
			sendResponse({ status: "success" });

			Render.userRoomMissedMessage(request.data.userMessages);
			break;

		default:
			// sendResponse({ status: "default case" });
			console.log('default case');
	}

});