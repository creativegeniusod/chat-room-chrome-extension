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
				Messages.setInit();
				LauncherState.default();
				LauncherHideDuration.set();
				ExtensionMode.set();
				break;

			case 'update':
				console.log('Extension Updated.');
				const user = await User.get();
				console.log(user);
				// LauncherState.default();
				// LauncherHideDuration.set();
				// ExtensionMode.set();
				break;

			default:
				console.log('Do nothing.');
		}
	},


	/**
	* Extension Icon onClick Listener.
	*/
	onExtensionIconClicked: async (tab) => {
		return;
		const key = 'user';
		const user = await User.get();

		/**
		* Save extension state.
		* For navigation
		*/
		State.set({
			open: true,
			tab: tab.id
		});



		if ('username' in user) {

			/** Show welcome window. **/
			Message.sendToWebpage(tab, {
				"action": "showChatWindow",
				"onSuccessAction": "ShowChatWindow",
				"user": user
			});
			return;
		}

		chrome.tabs.create({url: `${chrome.runtime.getURL('views/loginPage.html')}`});

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

			/** Delete all rooms **/
			Room.deleteAll();

			/** Removing TabStates **/
			State.remove();

			/** Remove Messages **/
			Messages.removeAll();
		}
	},


	/**
	* Background message listener.
	*/
	onMessage: async (request, sender, sendResponse) => {
		if (request !== undefined && 'action' in request) {
			switch(request.action) {

				case "closePopup":
					sendResponse({ status: "success" });
					Message.sendToWebpage(sender.tab, {
						action: `closeIframe`
					});

					if (request.data.rooms_delete) {
						Room.deleteAll();
					}

					if (request.data.delete_tab_state) {
						State.clearTabState(sender.tab.id);
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

					Message.sendToWebpage(sender.tab, {
						action: `onLogoutAction`
					});
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

					/** this console is necessary. **/
					console.log(sender.tab.id);

					Message.sendToWebpage(sender.tab, {
						action: `checkUserChatBoxOnPage`,
						data: request.data
					});
					break;

				case "saveRoom":
					sendResponse({ status: "success" });

					const currentUser = await User.get();
					const data = {
						'room_name': request.data.room_name,
						'users': request.data.users,
						'room_id': request.data.room_id,
						'createdBy': currentUser.username
					}

					// Save to Server.
					const headers = {
						"content-type": "application/json;charset=UTF-8"
					};
					Request.post(`${db_app_url}api/v1/create/room`, JSON.stringify(data), headers)
					.then( (data) => {
						// save to LocalStorage
						console.log('room data', data.data);
						Room.create(data.data);

						Message.sendToWebpage(sender.tab, {
							action: `notifyUsersAboutRoom`,
							data: data.data
						});
					})
					.catch(error => {
						Message.sendToWebpage(sender.tab, {
							action: `errorCreatingRoom`,
							data: data.data
						});
					});
					break;

				case "openRoomChat":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `openingRoomChatWindow`,
						data: request.data,
						messages: request.data.userMessages
					});
					break;

				case "closeRoomChatWindow":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `closeRoomChatFrameWindow`,
						data: request.data
					});
					break;

				case "emitMessageToRoom":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `emitMessageToRoomChannel`,
						data: request.data
					});
					break;

				case "checkRoomWindow":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `checkRoomWindowOnPage`,
						data: request.data
					});
					break;

				case "openEditProfileView":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `showEditProfileView`,
						data: request.data
					});
					break;

				case "closeEditAndOpenMain":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `closeEditProfileView`,
						data: request.data
					});
					break;

				case "disconnectUser":
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: `userDisconnect`,
						data: request.data
					});
					break;

				case "pageDomain":
					const page_url = sender.tab.url;
					sendResponse({ status: "success", data: { page: page_url } });

					break;

				case "checkFrameOpenState":
					sendResponse({ status: "success" });

					const x = await State.getItem(sender.tab.id);
					if (x !== undefined && x.open) {

						const user = await User.get();
						if ('username' in user) {

							/** Show welcome window. **/
							Message.sendToWebpage(sender.tab, {
								"action": "showChatWindow",
								"onSuccessAction": "ShowChatWindow",
								"user": user,
								"data": request.data
							});
						} else {
							State.clearTabState(sender.tab.id);
						}
					}
					break;

				case `extensionPageIconClicked`:
					sendResponse({ status: "success" });
					let a = await User.get();
					console.log('user', a)
					pageIconClicked(sender.tab, request.data);
					break;

				case `loginSuccessOpenChat`:
					sendResponse({ status: "success" });

					/** show main window. **/
					OpenAfterLogin();
					break;

				case `closeLauncherEvent`:
					sendResponse({ status: "success" });

					const duration = await LauncherHideDuration.get();
					chrome.alarms.create('wakeUpLauncher', { delayInMinutes: duration });
					closeLauncherFromPages();
					break;

				case `CastUserVote`:
					sendResponse({ status: "success" });

					Vote.set(request.data.vote, request.data.page);
					const loginUser = await User.get();
					const voteRes = await Database.castPageVote(loginUser.username, request.data.vote, request.data.page);

					if ('pageScore' in voteRes) {
						Message.sendToWebpage(sender.tab, {
							action: 'updatePageScore',
							data: { pageScore: voteRes.pageScore }
						});
					}
					break;

				case `getPageScore`:
					sendResponse({ status: "success" });
					try {
						const score = await Database.getPageScore(request.data.page);
						if (score.pageScore > 0) {
							Message.sendToWebpage(sender.tab, {
								action: 'pageScore',
								data: { pageScore: score.pageScore }
							});
						}
					} catch (exc) {
						console.log("Exception fetching data: ", exc);
					}
					break;

				case `refreshFrame`:
					sendResponse({ status: "success" });

					Message.sendToWebpage(sender.tab, {
						action: 'doFrameRefresh'
					});
					break;

				case `roomDescription`:
					sendResponse({ status: "success" });

					Room.updateRoomDescription(request.data.room_id, {
						description: request.data.description
					});
					break;

				case `checkAndCreateSiteRoom`:
					sendResponse({ status: 'success' });

					checkAndCreateSiteRoom(sender.tab, request.data);
					break;

				case `openSamePageChat`:
					sendResponse({ status: 'success' });

					var current_user = await User.get();

					Message.sendToWebpage(sender.tab, {
						"action": "samePageChatOpen",
						"user": current_user
					});
					// Message.sendToWebpage(sender.tab, {
					// 	action: 'openSamePageChat'
					// });
					break;

				case `checkAndCreatePageRoom`:
					sendResponse({ status: 'success' });

					checkAndCreatePageRoom(sender.tab, request.data);
					break;
			}; //switch close.
		} // if close.

	},


	/**
	* On alarm wakeUp.
	*/
	onAlarmNotification: (alarm) => {

		switch(alarm.name) {

			case "wakeUpLauncher":

				launcherAwake();
				break;

			default:
				console.log("Error 1001");
		};
	},

};


/**
* Function Definition.
*/
pageIconClicked = async (tab, msg_data) => {
	const key = 'user';
	const user = await User.get();

	// console.log('user:', user);
	// return;

	/**
	* Save extension state.
	* For navigation
	*/
	State.set({
		open: true,
		tab: tab.id
	});


	if ('username' in user) {
		/** Check user exists in db or not **/
		const headers = {
			"content-type": "application/json;charset=UTF-8"
		};
		console.log('user', user);
		Request.post(`${db_app_url}api/v1/search/user`, JSON.stringify({username: user.username}), headers)
		.then( (data) => {
			/** Show welcome window. **/
			Message.sendToWebpage(tab, {
				"action": "showChatWindow",
				"onSuccessAction": "ShowChatWindow",
				"user": user,
				"data": { 'pageTitle': msg_data.pageTitle }
			});
		})
		.catch(error => {
			User.set();
			chrome.tabs.create({url: `${chrome.runtime.getURL('views/loginPage.html')}`});
		});
		return;
	}

	chrome.tabs.create({url: `${chrome.runtime.getURL(`views/loginPage.html`)}`});
	return;
};


/**
* Open window after success login.
*/
OpenAfterLogin = () => {
	chrome.tabs.query({  active: true, currentWindow: true }, async (tabs) => {
		const user = await User.get();
		console.log('tid', tabs[0].id);
		Message.sendToWebpage(tabs[0], {
			"action": "showChatWindow",
			"onSuccessAction": "ShowChatWindow",
			"user": user
		});
	});
};


/**
* Close Launcher on All pages.
*/
closeLauncherFromPages = () => {
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			if (!tab.url.includes('chrome://')) {
				Message.sendToWebpage(tab, {
					'action': 'hideLauncherIcon'
				});
			}
		}
	});
};


/**
* Reset Launcher state and show on all pages.
*/
launcherAwake = () => {
	LauncherState.default();
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			if (!tab.url.includes('chrome://')) {
				Message.sendToWebpage(tab, {
					'action': 'showLauncherIcon'
				});
			}
		}
	});
};


/**
* Create a new tab with setting page url.
*/
openSettingsPage = () => {
	chrome.tabs.create({
		url: chrome.runtime.getURL('views/settings.html')
	});
};



/**
* On web navigation completed.
*/
checkAndCreateSiteRoom = async (tab, data) => {

	const tabId = tab.id;
	const url = tab.url;
	const onlyUrl = url.split('?')[0];
	const user = await User.get();
	const room_id = Room.generateUniqueSiteRoomIdFromURL(url);
	const pageTitle = data.pageTitle;

	const isRoom = await Room.getRoom(room_id);
	if ('username' in user && isRoom == false) {
		const headers = {
			"content-type": "application/json;charset=UTF-8"
		};

		Request.post(`${db_app_url}api/v1/page/room/`, JSON.stringify({url: url, user: user, isSiteRoom: true}), headers)
		.then( async (data) => {

			var room = await Room.getRoom(data.room_id);
			if (!room && data.room.name != "new-tab-page") {

				// Message.sendToWebpage(tab, {
				// 	action: 'returnWebPageTitle',
				// 	data: { room_id: data.room.room_id }
				// });

				const room_data = {
					'room_name': data.room.name.replace(/_/g, "."),
					'room_id': data.room.room_id,
					'room_owner': data.room.owner,
					'users': data.room.users,
					'messages': data.room.messages,
					'url': url,
					'isPageRoom': true,
					'isSiteRoom': data.isSiteRoom,
					'clean_url': data.room.clean_url,
					'description': pageTitle
				};
				Room.create(room_data);

				Message.sendToWebpage(tab, {
					action: 'roomCreated_N_ShowRoomWindow',
					data: { room_data: room_data, user: await User.get() }
				});

				if ('new_user_added' in data && data.new_user_added) {
					Message.sendToWebpage(tab, {
						action: 'pageRoomNewUser',
						data: { room: data.room }
					});
				}

			}
		})
		.catch(error => {
			console.log('Some api error. Please check.');
		});
		return;
	} else {
		// console.log('room: ', isRoom);
		const room_data = {
			'room_name': isRoom.name.replace(/_/g, "."),
			'room_id': room_id,
			'room_owner': isRoom.owner,
			'users': [],
			'messages': isRoom.room_messages,
			'url': url,
			'clean_url': isRoom.clean_url,
			'isSiteRoom': true,
			'description': isRoom.description
		};

		Message.sendToWebpage(tab, {
			action: 'roomCreated_N_ShowRoomWindow',
			data: { room_data: room_data, user: await User.get() }
		});
	}
	return;

};



/**
* Create Page URl specific Room
*/
checkAndCreatePageRoom = async (tab, data) => {

	const tabId = tab.id;
	const url = tab.url;
	const onlyUrl = url.split('?')[0];
	const user = await User.get();
	const room_id = data.room_id;
	const pageTitle = data.pageTitle;

	const isRoom = await Room.getRoom(room_id);
	if ('username' in user && isRoom == false) {
		const headers = {
			"content-type": "application/json;charset=UTF-8"
		};

		Request.post(`${db_app_url}api/v1/page/room/`, JSON.stringify({url: url, user: user, isSiteRoom: false, room_id: room_id}), headers)
		.then( async (data) => {

			var room = await Room.getRoom(data.room.room_id);

			if (!room && data.room.name != "new-tab-page") {

				// Message.sendToWebpage(tab, {
				// 	action: 'returnWebPageTitle',
				// 	data: { room_id: data.room.room_id }
				// });

				const room_data = {
					'room_name': data.room.name.replace(/_/g, "."),
					'room_id': data.room.room_id,
					'room_owner': data.room.owner,
					'users': data.room.users,
					'messages': data.room.messages,
					'url': url,
					'isPageRoom': true,
					'isSiteRoom': data.isSiteRoom,
					'clean_url': data.room.clean_url,
					'description': pageTitle
				};
				Room.create(room_data);

				Message.sendToWebpage(tab, {
					action: 'roomCreated_N_ShowRoomWindow',
					data: { room_data: room_data, user: await User.get() }
				});

				if ('new_user_added' in data && data.new_user_added) {
					Message.sendToWebpage(tab, {
						action: 'pageRoomNewUser',
						data: { room: data.room }
					});
				}

			}
		})
		.catch(error => {
			console.log('Some api error. Please check.');
		});
		return;
	} else {
		// console.log('room: ', isRoom);
		const room_data = {
			'room_name': isRoom.name.replace(/_/g, "."),
			'room_id': room_id,
			'room_owner': isRoom.owner,
			'users': [],
			'messages': isRoom.room_messages,
			'url': url,
			'clean_url': isRoom.clean_url,
			'isSiteRoom': false,
			'description': isRoom.description,
			'isPageRoom': true,
		};

		Message.sendToWebpage(tab, {
			action: 'roomCreated_N_ShowRoomWindow',
			data: { room_data: room_data, user: await User.get() }
		});
	}
	return;

};
