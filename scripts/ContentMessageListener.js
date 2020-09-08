var MessageListeners;


MessageListeners = {

	Reciever: (request, sender, sendResponse) => {

		switch(request.action) {

			case `showWelcomeWindow`:
				sendResponse({ status: "success" });
				Render.WelcomeWindow();
				break;

			case `showChatWindow`:
				sendResponse({ status: "success" });
				Render.ChatBox();
				break;

			case `closeIframe`:
				sendResponse({ status: "success" });
				Remove.removeIframe();
				break;

			case `openChatBoxFrame`:
				sendResponse({ status: `success` });
				Render.ChatBoxWithUserFrame(request.user, request.messages);
				break;

			case `closeChatIframe`:
				sendResponse({ status: `success` });
				Remove.removeChatIframe(request.data.closeForUserFrame);
				break;

			case `checkUserChatBoxOnPage`:
				sendResponse({ status: `success` });

				var isExist = 0;
				if ($(`#user-chat-frame-${request.data.from}`).length > 0 || $(`#user-chat-frame-${request.data.to}`).length > 0) {
					isExist = 1;
				}
				request.data.isExist = isExist;
				Message.sendToExtension({
					action: 'userChatBoxOnPage',
					data: request.data
				});
				break;
				
			default:
				sendResponse({ status: "default case" });
		}
	},
};