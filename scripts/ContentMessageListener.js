var MessageListeners;


MessageListeners = {

	Reciever: async (request, sender, sendResponse) => {

		switch(request.action) {

			case `showWelcomeWindow`:
				sendResponse({ status: "success" });
				Render.WelcomeWindow();
				break;

			case `showChatWindow`:
				sendResponse({ status: "success" });

				Render.ChatBox(false, request.data);
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

			case `openingRoomChatWindow`:
				sendResponse({ status: `success` });

				Render.createChatRoomFrame(request.data, request.messages);
				break;

			case `closeRoomChatFrameWindow`:
				sendResponse({ status: `success` });

				Remove.RoomChatFrameWindow(request.data.room_id);
				break;

			case `checkRoomWindowOnPage`:
				sendResponse({ status: `success` });

				var isExist = 0;
				if ($(`#room-chat-${request.data.to}`).length > 0) {
					isExist = 1;
				}
				request.data.isExist = isExist;
				Message.sendToExtension({
					action: 'userRoomChatBoxOnPage',
					data: request.data
				});
				break;

			case `showEditProfileView`:
				sendResponse({ status: `success` });

				if ( Remove.removeChatRoom() ) {
					Render.showEditProfile();
				}
				break;

			case `closeEditProfileView`:
				sendResponse({ status: `success` });

				if ( Remove.removeEditProfile() ) {
					Render.ChatBox();
				}
				break;

			case `onLogoutAction`:
				sendResponse({ status: `success` });

				Remove.removeIframe();
				break;

			case `hideLauncherIcon`:
				sendResponse({ status: `success` });

				Render.hideLauncherIcon();				
				break;

			case `showLauncherIcon`:
				sendResponse({ status: `success` });

				Render.showLauncherIcon();
				break;

			case `pageScore`:
				sendResponse({ status: `success` });
				
				Render.showPageScore(request.data.pageScore);
				break;

			case `doFrameRefresh`:
				sendResponse({ status: 'success' });

				Render.refreshFrame();
				break;

			case `returnWebPageTitle`:
				sendResponse({ status: `success` });

				Render.findPageTitle(request.data.room_id);
				break;

			case `samePageChatOpen`:
				sendResponse({ status: "success" });
				
				const pageTitle = $('head title').html();
				Render.ChatBox(true, { pageTitle: pageTitle });
				break;

			case `updatePageScore`:
				sendResponse({ status: 'success' });

				Render.updatePageScore(request.data);
				break;
				
			default:
				sendResponse({ status: "default case" });
		}
	},
};