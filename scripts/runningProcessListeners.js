var Listeners;


/**
* Handlers for Background process callbacks.
*/
Listeners = {

	/**
	* Extension On Installed Listener.
	*/
	onInstalled: async (details) => {
		switch (details.reason) {

			case 'install':
				User.set();
				break;

			case 'update':
				console.log('Extension Updated.');
				const user = await User.get();
				console.log('current user:', user);
				break;
				
			default:
				console.log('Do nothing.');
		}
	},


	/**
	* Extension Icon onClick Listener.
	*/
	onExtensionIconClicked: async (tab) => {
		const key = 'user';
		const user = await User.get();
		
		
		if ('username' in user) {
			/** Show welcome window. **/
			Message.sendToWebpage(tab, {
				"action": "showChatWindow",
				"onSuccessAction": "ShowChatWindow",
				"user": user
			});
			return;
		}
		
		/** show main window. **/
		Message.sendToWebpage(tab, {
			"action": "showWelcomeWindow",
			"onSuccessAction": "showWelcomeWindow"
		});
		return;
	},



	/**
	* on Window created listener.
	*/
	onWindowCreated: (window) => {
		chrome.windows.getAll(Listeners.getAllWindows);
	},

	
	/**
	* get all windows event.
	*/
	getAllWindows: (windows) => {
		if (windows.length == 1) {
			Room.deleteAll();
		}
	},


	/**
	* Background message listener.
	*/
	onMessage: async (request, sender, sendResponse) => {

		switch(request.action) {

			case "closePopup":
				sendResponse({ status: "success" });
				Message.sendToWebpage(sender.tab, {
					action: `closeIframe`
				});

				if (request.data.rooms_delete) {
					Room.deleteAll();
				}
				break;

			case "saveUser":
				sendResponse({ status: "success" });
				User.set(request.data);
				break;

			case "showUser":
				sendResponse({ status: "success" });

				const user = await User.get();
				Message.sendToWebpage(sender.tab, {
					action: `userData`,
					user: user
				});
				break;

			case "logoutUser":
				sendResponse({ status: "success" });

				User.set(); // reset uesr fields.
				break;

			case "openChatBoxWithUser":
				sendResponse({ status: "success" });
				
				Message.sendToWebpage(sender.tab, {
					action: `openChatBoxFrame`,
					user: request.data.user,
					messages: request.data.userMessages
				});
				break;

			case "closeChatPopup":
				sendResponse({ status: "success" });
				Message.sendToWebpage(sender.tab, {
					action: `closeChatIframe`,
					data: request.data
				});
				break;

			case "checkUserChatBox":
				sendResponse({ status: "success" });

				Message.sendToWebpage(sender.tab, {
					action: `checkUserChatBoxOnPage`,
					data: request.data
				});
				break;

			case "saveRoom":
				sendResponse({ status: "success" });

				Room.create(request.data);
				break;
				
			default:
				sendResponse({ status: "default case" });
				console.log("Error 1001");
		}
	},
};