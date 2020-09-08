var EventListeners;
var newRoomUsers = Array();


EventListeners = {

	/**
	* Frame Ready.
	*/
	FrameReady: async (event) => {

		/** Initialize the script. **/
		if (typeof init === 'function') {
			init();
		}


		/**
		* assign new(empty) opened chatWindow to a user.
		*/
		if ($(`.user-chat`).length > 0) {

			Page.setChatBoxVars(location.search);
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
					username: username
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
		location.href = `${chrome.runtime.getURL('views/signup.html')}`;
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
			data: { rooms_delete: deleteRooms }
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
	startChat: (event) => {
		const ele = event.target.parentNode;
		const username = $(ele).data(`username`);

		$(`.user-${username} .notification`).hide();
		Message.sendToExtension({
			action: `openChatBoxWithUser`,
			data: {
				user: username,
				userMessages: usersMessages[username]
			}
		});

		if (usersMessages[username] !== undefined) delete usersMessages[username];
	},


	/**
	* Send message.
	*/
	sendMessage: async (event) => {
		event.preventDefault();
		const message = $(`.user-chat .message`).val();
		if (!message) {
			return;
		}

		/** Valid conditions. **/
		if (event.key === 'Enter' || event.keyCode === 13 || event.type == `click`) {

			const user = await Storage.getLocal('user');
			
			const message_to = $(`.user-chat .user-name`).html().trim();
			if (message_to === undefined || user.username === undefined) {
				alert('This is a serius issue. Please contact admin.');
				return;
			}

			$(`.user-chat .message`).val('');			
			Message.sendToExtension({
				action: `emitMessage`,
				data: {
					message: message,
					from: user.username,
					to: message_to,
					time_of_message: new Date(),
					channelId: btoa(`${user.username}-0-${message_to}`)
				}
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


		/** enable/disable elements. **/
		$(`.form-reset`).hide();
		$(`.room-heading .room-info`).show();
		$(`.room-heading .room-name`).hide();

		$(`.room-heading .create-new-room`).show();
		$(`.room-heading .create-room-submit`).hide();

		$(`.add-in-room`).hide();

		/** Add event listener class **/
		$(`#users-list`).addClass(`online-users`);
		$(`.room-name-input`).val(``);
		$(`.add-in-room i`).removeClass(`green`).addClass(`grey`);
	},


	addUserToRoom: (event) => {
		event.preventDefault();

		const element = event.target;
		const user = $(element).parent().parent().data('username');

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

		$(`.users-descriptions`).hide();
		$(`.room-descriptions`).show();
		
		$(`.tab .show-rooms`).hide();
		$(`.tab .list-users`).show();

		$(`.room-descriptions #room-list`).html(`<tr>
			<th>ROOM</th>
			<th>DESCRIPTION</th>
			<th>CREATED BY</th>
			<th>No. of USERS</th>
		</tr>`);
		
		const rooms = await Storage.getLocal(`rooms`);
		if (rooms !== undefined) {
			Render.ListRooms(rooms);
		}
	},

	listUsers: (event) => {
		event.preventDefault();

		$(`.room-descriptions`).hide();
		$(`.users-descriptions`).show();

		$(`.tab .list-users`).hide();
		$(`.tab .show-rooms`).show();
	},


	/**
	* create room Request Submit.
	*/
	createRoomSubmit: (event) => {
		event.preventDefault();

		const room_name = $(`.room-name-input`).val().trim();
		if (!room_name) {
			alert('Room Name is must.');
			return;
		} else if (newRoomUsers.length < 1) {
			alert('Please select Users from list.');
			return;
		}


		Message.sendToExtension({
			action: 'saveRoom',
			data: {
				room_name: room_name,
				users: newRoomUsers
			}
		});
		
		$(`.form-reset`).trigger(`click`);
		alert(`A new chat room "${room_name}" was created.`);
	},

};