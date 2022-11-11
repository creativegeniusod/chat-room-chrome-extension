var EventListeners;
var newRoomUsers = Array();
var addUsersToExistingRoom = Array();
var addingToRoom = null;


EventListeners = {

	/**
	* Frame Ready.
	*/
	FrameReady: async (event) => {

		/**
		* Initialize the script.
		*/
		if (typeof init === 'function') {
			init();
		}


		/**
		* assign new(empty) opened chatWindow to a user.
		*/
		if ($(`.user-chat`).length > 0) {
			Page.setChatBoxVars(location.search);
		}


		/**
		* check if a room-chat window opened by user.
		* if yes: Set Vars;
		*/
		if ($(`.room-chat`).length > 0) {
			Page.setRoomChatBoxVars(location.search);
		}


		if ($(`.edit-profile-body`).length > 0) {
			Page.setUserEditProfileData();
		}


		/**
		* Load all rooms and render.
		*/
		$(`#tabs .show-rooms`).trigger('click');


		/**
		* Click on Page Button.
		*/
		const params = Helper.urlParamsToObj(location.search);
		window.pageTitle = params.pageTitle; // this is not in main document frame. This is in iframe document.
		if (params.openPageChat == 'true') {
			setTimeout(() => {
				$('#tabs #web-page-tab').trigger('click');
			}, 50);
		}
	},

	/**
	* Submit Username.
	*/
	submitUsername: async (event) => {
		event.preventDefault();

		const username = $('#ask-username #username').val();
		if ( username === undefined || username === "" ) {
			alert(`Please provide a username`);
			return;
		}

		/** Send request **/
		const url = `${app_url}users/create/`;
		Request.post(url, { username: username })
		.then( (data) => {
			$(`.message i`).html('User created.');
			$(`.message`).removeClass('alert-danger').addClass('alert alert-success').show();


			/** change user login state **/
			Message.sendToExtension({
				action: 'saveUser',
				data: {
					isLogin: true,
					username: username
				}
			});
			location.href = `${chrome.runtime.getURL('views/chatRoom.html')}`;
		})
		.catch(error => {
			if (error.responseJSON !== undefined && error.responseJSON.data !== undefined) {
				$(`.message i`).html('Username already exist in database.');
				$(`.message`).removeClass('alert-success').addClass('alert-danger').show();
			}
		});
	},


	/**
	* User Login.
	*/
	userLogin: () => {
		event.preventDefault();

		const username = $('#ask-username #username').val();
		if ( username === undefined || username === "" ) {
			alert(`Please provide a username`);
			return;
		}

		/** Send request **/
		const url = `${app_url}users/login/`;
		Request.post(url, { username: username })
		.then( (data) => {
			$(`.message i`).html('Login Success.');
			$(`.message`).removeClass('alert-danger').addClass('alert alert-success').show();

			/** change user login state **/
			Message.sendToExtension({
				action: 'saveUser',
				data: {
					isLogin: true,
					username: data.username,
					id: data._id
				}
			});

			location.href = `${chrome.runtime.getURL('views/chatRoom.html')}`;

		})
		.catch(error => {

			if (error.responseJSON !== undefined && error.responseJSON.data !== undefined) {
				$(`.message i`).html('Wrong Login. Please check credentials.');
				$(`.message`).removeClass('alert-success').addClass('alert-danger').show();
			}
		});
	},


	/**
	* User Logout.
	*/
	userLogout: () => {
		Message.sendToExtension({ action: 'logoutUser' });
	},


	/**
	* Close button listener for show chat room modal.
	*/
	showChatRoomClose: (event) => {
		event.preventDefault();
		$(`#chat-room-container`).remove();
	},


	/**
	* Popup Close.
	*/
	popupClose: (event) => {
		event.preventDefault();

		var deleteRooms = false;
		if ( $(event.target).parent().attr('id') == 'main_frame_window' ) {
			deleteRooms = true;
		}

		Message.sendToExtension({
			action: `closePopup`,
			data: { rooms_delete: deleteRooms, delete_tab_state: true }
		});

	},

	chatClose: (event) => {
		const closeUserBox = $(`.user-chat .user-name`).html().trim();
		Message.sendToExtension({
			action: `closeChatPopup`,
			data: { closeForUserFrame: closeUserBox }
		});
	},

	/**
	* start Chat with user.
	*/
	startChat: async (event) => {
		var ele = event.target.parentNode;

		if (ele.tagName == "TD") {
			ele = ele.parentNode;
		}

		const username = $(ele).data(`username`);
		$(`.user-${username} .notification`).hide();

		const user = await Storage.getLocal('user');
		const channelId = btoa(`${user.username}-0-${username}`);
		const channelMessages = await Messages.getChannelMessages(channelId);

		Render.userChatWindow(username, usersMessages[username], channelMessages);


		if (usersMessages[username] !== undefined) delete usersMessages[username];
	},


	/**
	* Send message.
	*/
	sendMessage: async (event) => {
		event.preventDefault();

		/** Valid conditions. **/
		if (event.key === 'Enter' || event.keyCode === 13 || event.type == `click`) {
			var ele = event.target;

			if (ele.tagName == `IMG`) {
				ele = ele.parentNode;
			}

			const message_to = $(ele).attr(`data-username`).trim();

			const recipient_encode = Helper.usernameEncode(message_to);
			const activeWindow = document.getElementsByClassName(`user-${recipient_encode}`)[0];

			const message = $(activeWindow).find(`.message`).val();
			if (!message) {
				return;
			}

			const user = await Storage.getLocal('user');

			if (message_to === undefined || user.username === undefined) {
				alert('This is a serius issue. Please contact admin.');
				return;
			}

			$(`.user-chat .message`).val('');
			SocketMiddleware.emitMessage({
				message: message,
				from: user.username,
				to: message_to,
				time_of_message: new Date(),
				channelId: btoa(`${user.username}-0-${message_to}`)
			});
		}
	},


	/**
	* create room.
	*/
	createRoom: (event) => {
		event.preventDefault();

		/** reset users list. **/
		newRoomUsers = Array();


		/** enable/disable elements. **/
		$(`.form-reset`).show();
		$(`.room-heading .room-info`).hide();
		$(`.room-heading .room-name`).show();

		$(`.room-heading .create-new-room`).hide();
		$(`.room-heading .create-room-submit`).show();

		$(`.add-in-room`).show();

		/** Remove event listener class **/
		$(`#users-list`).removeClass(`online-users`);

		$(`.room-name-input`).focus();

	},


	/**
	* create room Form Reset.
	*/
	createRoomReset: (event) => {
		event.preventDefault();

		/** reset users list. **/
		newRoomUsers = Array();


		/** Add event listener class **/
		$(`#users-list`).addClass(`online-users`);
		$(`.room-name-input`).val(``);
		$(`.add-more-to-room i`).removeClass(`green`).addClass(`grey`);
	},


	addUserToRoom: (event) => {
		event.preventDefault();

		const element = event.target;
		const user = $(element).parent().parent().data('username');
		console.log(element, user)
		if ( $(element).hasClass(`grey`) ) {
			$(element).removeClass(`grey`).addClass(`green`);

			/** push user to list. **/
			newRoomUsers.push(user);

		} else {
			$(element).removeClass(`green`).addClass(`grey`);

			/** remove user from list **/
			newRoomUsers.splice(newRoomUsers.indexOf(user), 1);
		}
	},

	/**
	* Show rooms.
	*/
	showRooms: async (event) => {
		event.preventDefault();

		$(`.top-bar.left-side-icons a`).removeClass('active-icon');
		$(`.icon-show-chat-rooms`).addClass('active-icon');

		$(`.room-descriptions #room-list`).html(`<thead>
			<tr>
				<th>ROOM</th>
				<th>DESCRIPTION</th>
				<th>CREATED BY</th>
				<th>No. of USERS</th>
				<th>@</th>
			</tr>
		</thead>`);

		const rooms = await Storage.getLocal(`rooms`);
		if (rooms !== undefined) {
			Render.ListRooms(rooms);
		}
	},


	/**
	* create room Request Submit.
	*/
	createRoomSubmit: (event) => {
		event.preventDefault();

		const ele = event.target;
		const room_update = $(ele).attr('data-room-update');

		if ( (typeof room_update == "string" && room_update == "true") || (typeof room_update == "boolean" && room_update) ) {

			EventListeners.updateRoom(event);
			return;
		}


		var room_name = $(`.room-name-input`).val().trim();
		if (!room_name) {
			alert('Room Name is must.');
			return;
		} else if (newRoomUsers.length < 1) {
			// alert('Please select Users from list.');
			// return;
		}


		room_name = Room.validateRoomName(room_name);
		const room_id = Room.generateUniqueRoomId(room_name);

		Message.sendToExtension({
			action: 'saveRoom',
			data: {
				room_name: room_name,
				room_id: room_id,
				users: newRoomUsers
			}
		});

		$(`.form-reset`).trigger(`click`);

		swal({
			title: "New room Notification",
			text: `"${room_name}" was created.`,
			icon: "info",
			buttons: ["Ok", "GO TO ROOM"],
			dangerMode: true,
		})
		.then((go_to_room) => {
			if (go_to_room) {

				/** Show all rooms **/
				$(`.nav-item .show-rooms`).trigger('click');
				setTimeout(() => {
					console.log($(`.room-${room_id}`))
					$(`.room-${room_id}`).trigger('click');
				}, 100);
			} else {
				/** Show all rooms **/
				$(`.nav-item .show-rooms`).trigger('click');
			}
		});
	},


	/**
	* Start a new room chat.
	*/
	openRoomChat: async (event) => {
		var ele = event.target.parentNode;

		/** if clicked on addMoreUsers. Do not proceed. **/
		if( $(ele).hasClass(`add-more-users-to-room`) ) {
			return;
		} else if (ele.tagName == `TABLE`) {
			ele = event.target;
		}


		/** if clicked room is page room. Open room in "Site" tab instead of page tab. */
		const room_id = $(ele).attr(`data-room-id`);
		if ( Helper.isSiteRoom(room_id) ) {

			$('#tabs #site-tab').trigger('click');
			return;
		} else if ( Helper.isPageRoom(room_id) ) {

			$('#tabs #web-page-tab').trigger('click');
			return;
		}

		// continue. if above condition is false.
		const room = await Room.getRoom(room_id);
		const user = await Storage.getLocal('user');
		room.custom_room = true; // in case room is not site/page room.

		if (room.room_messages !== undefined && room.room_messages.length > 0) {

			roomMessagesOld[room_id] = await Room.formatMessageProperties(room.room_messages);
			Room.deleteTempRoomMessages(room_id);
		}

		// Activate chat icon.
		$(`.top-bar.left-side-icons a`).removeClass('active-icon');
		$('.icon-chat-tab').addClass('active-icon');
		// ****

		$(`.room-${room_id} .notification`).hide();
		if (roomMessagesOld[room_id] !== undefined && roomMessagesOld[room_id].length > 0) {

			const tempMsg = roomMessagesOld[room_id];
			const deleteMsgs = Render.roomChatWindow(room, room_id, tempMsg);
			if (deleteMsgs) {

				delete usersMessages[room_id];
			}
		} else {

			Render.roomChatWindow(room, room_id, usersMessages[room_id]);
		}

		// if (usersMessages[room_id] !== undefined) delete usersMessages[room_id];
	},

	roomChatClose: (event) => {
		event.preventDefault();

		const ele = event.target.parentNode;
		const room_id = $(ele).data(`room-id`);
		Message.sendToExtension({
			action: `closeRoomChatWindow`,
			data: {
				room_id: room_id
			}
		});
	},


	/**
	* Send Message to Room.
	*/
	sendMessageToRoom: async (event) => {
		event.preventDefault();

		/** Valid conditions. **/
		if (event.key === 'Enter' || event.keyCode === 13 || event.type == `click`) {

			const ele = event.target;
			const room_id = $(ele).attr('data-roomid');


			const message = $(`.room-${room_id} .message`).val();
			if (!message) {
				return;
			}

			const user = await Storage.getLocal('user');
			const room_channel = room_id;

			if (room_id === undefined || room_channel === undefined || user.username === undefined) {
				alert('This is a serius issue. Please contact admin.');
				return;
			}

			$(`.room-chat .message`).val('');
			const room_message = {
				message: message,
				from: user.username,
				to: room_id,
				time_of_message: new Date(),
				channel: room_channel
			};
			Database.saveRoomMessage(room_message);
			Room.updateRoom({ 'message': room_message });
			SocketMiddleware.emitMessageToRoom(room_message);
		}
	},


	addMoreUsers: (event) => {
		event.preventDefault();

		const ele = event.target.parentNode;
		const parent = ele.parentNode;
		const room_id = $(parent).data(`room-id`);

		/** available in all functions in this file. **/
		addingToRoom = room_id;
		/** ---------------------------------------- **/

		addUsersToExistingRoom = Array();

		/** UI changes. **/
		Render.addMoreUsersUiHandler(addingToRoom);

	},


	/**
	* cancel adding more users to room.
	*/
	cancelAddMoreUsers: (event) => {
		event.preventDefault();

		/** clear variables. **/
		addUsersToExistingRoom = Array();
		addingToRoom = null;

		/** reset UI **/
		Render.cancelAddMoreUsersUiHandler();
	},


	/**
	* Update room users.
	*/
	updateRoom: async (event) => {
		event.preventDefault();

		/** Don't query if no users are selected. **/
		// if (addUsersToExistingRoom.length > 0) {
		if (newRoomUsers.length > 0) {

			const req_status = await Database.addMoreUsers(addingToRoom, newRoomUsers);
			if (req_status.status && req_status.users_added > 0) {
				const roomData = await Room.addMoreUsers(addingToRoom, newRoomUsers);
				const room = roomData.room;
				swal(`Yayy !!!`, `${req_status.users_added} out of ${req_status.users_requested} users are added to the room.`, `success`);

				/** Show all rooms **/
				$(`.nav-item .show-rooms`).trigger('click');

				/** reset UI **/
				const render = Render.cancelAddMoreUsersUiHandler();

				/** Re-render room row in list. **/
				Render.updateRoomRowDataInList(addingToRoom, room);

				/** send notification to users. **/
				SocketMiddleware.emitNotificationAddedToRoom(addingToRoom, room, roomData.newOnes);
			} else {
				swal(`Sorry !!!`, `No users are added to the room.`, `error`);
			}

		} else {
			swal(`Sorry !!!`, `You haven't selected any users from list.`, `error`);
		}

		/** at last clear these. **/
		addUsersToExistingRoom = Array();
		newRoomUsers = Array();
		addingToRoom = null;
	},


	/**
	* add more users to room. user select handler.
	*/
	addMoreToRoom: (event) => {
		event.preventDefault();

		const element = event.target;
		const user = $(element).parent().parent().data('username');

		if ( $(element).hasClass(`grey`) ) {
			$(element).removeClass(`grey`).addClass(`green`);

			/** push user to list. **/
			// addUsersToExistingRoom.push(user);
			newRoomUsers.push(user);

		} else {
			$(element).removeClass(`green`).addClass(`grey`);

			/** remove user from list **/
			// addUsersToExistingRoom.splice(addUsersToExistingRoom.indexOf(user), 1);
			newRoomUsers.splice(newRoomUsers.indexOf(user), 1);
		}
	},


	/**
	* open Edit Profile.
	*/
	openEditProfileView: async (event) => {
		event.preventDefault();

		const user = await Storage.getLocal('user');

		Message.sendToExtension({
			action: 'openEditProfileView'
		});
	},

	editProfileSaveChanges: (event) => {
		event.preventDefault();

		const username_ele = $(`.edit-profile-body .user-username`);
		const email_ele = $(`.edit-profile-body .user-email`);
		var data = {};
		var send_request = false;

		data.filter = { username: username_ele.data('current-val') };

		if (username_ele.val() !== "" && username_ele.val() !== username_ele.data('current-val')) {
			data.username = username_ele.val();
			send_request = true;
		}

		if (email_ele.val() !== "" && email_ele.val() !== email_ele.data('current-val')) {
			data.email = email_ele.val();
			send_request = true;
		}

		if (send_request) {
			const url = `${app_url}users/update/`;
			Request.post(url, data)
			.then( (data) => {
				const user = data.user;
				User.set(user);

				Render.updateChatRoomUI(true, user);

				setTimeout(() => {
					Message.sendToExtension({
						action: "closeEditAndOpenMain"
					});
				}, 2000);
			})
			.catch(error => {
				if (error.responseJSON !== undefined && error.responseJSON.data !== undefined) {
					$(`.message i`).html('Username already exist in database.');
					$(`.message`).removeClass('alert-success').addClass('alert-danger').show();
				}
			});
		} else {
			alert('no changes detected');
		}

	},



	editProfileWindowGoBack: (event) => {
		event.preventDefault();

		Message.sendToExtension({
			action: "closeEditAndOpenMain"
		});
	},


	tabsClick: (event) => {
		event.preventDefault();

		var ele = event.target;

		if (ele.tagName == "IMG") {
			ele = ele.parentNode;
		}


		const room_update = $(ele).attr("data-room-update");

		if ($(ele).attr('id') == "create-tab" && (room_update == true || room_update == "true")) {

			$(`.create-tab-wrapper a`).html('Update Room');
			$(`.tab-content #create .create-room-submit`).html('Update').attr("data-room-update", "true");

		} else {

			$(`.room-name input`).val('').removeAttr("disabled");
			$(`.nav-item.create-tab-wrapper a`).attr('data-room-update', "false");
			$(`.nav-item.create-tab-wrapper #create-tab`).html('New Room');
			$(`.tab-content #create .create-room-submit`).html('Create').attr("data-room-update", "false");
		}

		// trigger default sub-menu click.
		// $(`.nav-link.all-online-users`).trigger(`click`);


		$(ele).tab('show');

		// On "Page" tab click. hide sub-nav bar.
		$('.top-bar.left-side-icons a').removeClass('active-icon');
		if ($(ele).attr('id') == "chatting-tab") {

			$(`#tabs`).hide();
			var active_content = '';
			$('#chat-tab .chat').each(function(index, value) {
				if (!$(this).attr('style').includes('display:')) {
					active_content = $(this).attr('data-chat-type');
					return;
				}
			});

			if ( active_content == 'user' ) $('.icon-chat-tab').addClass('active-icon');
			else $('.icon-show-chat-rooms').addClass('active-icon');


		} else if ($(ele).attr('id') == "site-tab") {

			$('.icon-show-chat-rooms').addClass('active-icon');

			// check if page room is already created.
			const room_id = Room.generateUniqueSiteRoomIdFromURL(window.page);
			if ( $(`.room-chat.room-${room_id}`).length > 0 ) {

			} else {

				$('#site-view .page-processing').show();

				// also create a room for containingtabsC page.
				Message.sendToExtension({
					action: 'checkAndCreateSiteRoom',
					data: { pageTitle: window.pageTitle }
				});
			}
		} else if ($(ele).attr('id') == "rooms-tab") {
			$(`#tabs`).show();
			$('.icon-show-chat-rooms').addClass('active-icon');
		} else if ($(ele).attr('id') == "users-tab") {

			$('.icon-show-chat-rooms').addClass('active-icon');
			setTimeout(() => {
				$('#online-users-tabs #all-users-tab').trigger('click');
			}, 50);
		} else if ($(ele).attr('id') == "web-page-tab") {

			$('.icon-show-chat-rooms').addClass('active-icon');
			const room_id = Room.generateUniquePageRoomIdFromURL(window.page);
			if ( $(`#web-page-view .room-chat.room-${room_id}`).length > 0 ) {

			} else {
				$('#web-page-view .page-processing').show();
				Message.sendToExtension({
					action: 'checkAndCreatePageRoom',
					data: { 'room_id': room_id, pageTitle: window.pageTitle }
				});
			}
		} else if ( $(ele).attr('id') == "room-chat-tab" ) {
			$('.icon-show-chat-rooms').addClass('active-icon');
		}

		/** Custom handeling **/
		$(`.nav-item`).removeClass(`active`).css('background', 'lightgrey');
		$(`.nav-item a`).removeClass(`active`);
		$(ele).addClass(`active`);

		if ($(ele).attr('id') != "create-tab") {
			$(ele).parent().css('background', '#FFF');
		}
	},


	showRoomsA: async (event) => {
		event.preventDefault();

		$(`.nav-item .show-rooms`).trigger('click');
		// $(`.icon-show-chat-rooms`).addClass('active');
	},


	showChatTab: async (event) => {
		event.preventDefault();

		// $(`.nav-item.chat-tab a`).trigger('click');
		Render.showChatTabManually(true);
	},


	subTabsClick: (event) => {
		event.preventDefault();

		var ele = event.target;
		$(ele).tab('show');

		/** Custom handeling **/
		$(`.users-category .nav-item`).removeClass(`active`).css('background', '#f6f6f7');
		$(`.users-category .nav-item a`).removeClass(`active`);
		$(ele).addClass(`active`);

		$(ele).parent().css('background', '#FFF');
	},



	/**
	* Chat Close new.
	*/
	chatCloseNew: (event) => {
		event.preventDefault();

		const ele = event.target;
		const userid = $(ele).attr(`data-userid`);
		const targetEle = document.getElementsByClassName(`user-${userid}`);
		$(targetEle[0]).remove();

		$(`#tabs`).show(); // maybe not.
		$(`.nav-link.list-users`).trigger(`click`);
	},


	/**
	* Page ready event.
	*/
	pageReady: async (event) => {

		if ( $('head title').length > 0 ) window.pageTitle = $('head title').html();

		Message.sendToExtension({
			action: `checkFrameOpenState`,
			data: { pageTitle: window.pageTitle }
		});

		// Render Page Icon.
		const pageIcon = Render.pageIcon(2000);
		if (pageIcon) {

			const user = await User.get();

			const url = `${app_url}users/online`;
			Request.post(url, { site: Helper.extractDomain(location.href), user: user.username })
			.then( (data) => {
				setTimeout(function () {
					var chat_history = $('.chat-room-open-icon img').attr('data-chat-history');
					var icon = defaultIcon;

					if (chat_history == "true") icon = IconWch;
					else if (data == 'true' || data == true) icon = IconWou;
					else if (chat_history == "true" && data == "true") icon = IconWchnAu;

					$('.chat-room-open-icon img').attr('src', icon).attr('data-orig-img', icon).attr('data-page-title', pageTitle);
				}, 2000);
			})
			.catch(error => {
				console.log('Error: ', error);
			});

			Message.sendToExtension({
				action: 'getPageScore',
				data: { page: location.href.split('?')[0].replace(/[^\w\s]/gi, '_') }
			});
		}
	},



	/**
	* Facebook Login.
	*/
	fbLogin: (event) => {
		const extension_id = location.href.replace('chrome-extension://', '').split('/')[0];
		location.href = `${app_url}extension-login?channel=fb&id=${extension_id}`;
	},


	/**
	* Twitter Login.
	*/
	twLogin: (event) => {
		const extension_id = location.href.replace('chrome-extension://', '').split('/')[0];
		location.href = `${app_url}extension-login?channel=tw&id=${extension_id}`;
	},

	mmLogin: (event) => {
		const extension_id = location.href.replace('chrome-extension://', '').split('/')[0];
		location.href = `${app_url}users/web3-page?channel=tw&id=${extension_id}`;
	},
	wcLogin: (event) => {
		const extension_id = location.href.replace('chrome-extension://', '').split('/')[0];
		location.href = `${app_url}users/web3-wc-page?channel=tw&id=${extension_id}`;
	},


	/**
	* Chat Room Open Icon.
	*/
	chatRoomOpen: (event) => {
		$(`.chat-room-open-icon`).hide();
		$(`.launcher-func-icons`).hide();

		Message.sendToExtension({
			action: `extensionPageIconClicked`,
			data: { 'pageTitle': window.pageTitle }
		});
	},

	/**
	* Plugin Launcher Icon Hover.
	*/
	launcherIconHover: (event) => {
		$('.chat-room-open-icon img').attr('src', defaultIcon);

		// show x, +, - buttons on hover.
		$('.launcher-func-icons').show();
	},

	launcherIconHoverOut: (event) => {
		setTimeout(function() {
			$('.chat-room-open-icon img').attr('src', $('.chat-room-open-icon img').attr('data-orig-img'));

			// hide x, +, - buttons on hover.
			$('.launcher-func-icons').hide();
		}, 3000);
	},

	/**
	* Hide Launcher Icon for specified Time.
	*/
	hideLauncherIcon: (event) => {
		LauncherState.hide();
		$('.chat-room-launcher').remove();

		Message.sendToExtension({
			action: `closeLauncherEvent`
		});
	},


	/**
	* Site Vote.
	*/
	siteVote: async (event) => {
		event.preventDefault();

		const ele = event.target.parentNode;
		const vote = parseInt($(ele).attr('data-vote'));
		// const domain = Helper.extractDomain(location.href).replace(/\./g, '_');
		const page = location.href.split('?')[0].replace(/[^\w\s]/gi, '_');

		const myVote = await Vote.get(page);
		if (myVote !== false) {

			if ( (Math.abs(new Date().getTime() - new Date(myVote.voteTime).getTime()) / 36e5) <= 24 ) {

				$(`.chat-room-launcher .launcher-message .message-notification`).html(`You already voted today! :)`);
				$(`.chat-room-launcher .launcher-message`).show();

				setTimeout(() => {
					$(`.chat-room-launcher .launcher-message`).hide('slow');
				}, 3000);
				return;
			}
		}

		Message.sendToExtension({
			action: 'CastUserVote',
			data: { vote: vote, page: page }
		});

		// Show little animation.
		$(ele).animate({opacity: 0.5}, 100, function() {
			$(ele).animate({opacity: 1});
		});

		// Show page score calculating text...
		$(".chat-room-launcher .page-score span").html('...');

	},


	/**
	* Room chat close.
	*/
	roomChatCloseOne: (event) => {
		event.preventDefault();

		$('#tabs .nav-link.show-rooms').trigger('click');
		$(`#tabs`).show();
		$('.icon-chat-tab').removeClass('active');
	},


	/**
	* Top Bar. Left side Icon click Handler.
	*/
	iconClick: (event) => {
		event.preventDefault();

		if (event.target.parentNode.tagName == "A") {
			$(`.top-bar.left-side-icons a`).removeClass('active-icon');
			$(event.target.parentNode).addClass('active-icon');
		}

	},


	/**
	* Frame Refresh Icon Click.
	*/
	frameRefresh: async (event) => {
		event.preventDefault();

		Message.sendToExtension({
			action: 'refreshFrame'
		});
	},


	/**
	* A launcher's chat icon click event.
	*/
	chatIconClick: (event) => {
		event.preventDefault();

		Message.sendToExtension({
			action: 'openSamePageChat'
		});
	},


	/**
	* Open room page url.
	*/
	openRoomPageUrl: (event) => {
		const ele = event.target;

		if ( $(ele).attr('data-isLink') == "true" ) {
			chrome.tabs.create({ url: $(ele).attr('title') });
		}
	}

};
