var SocketListener, SocketEmitter;
var socket;
var existing_online_users;
var SocketMiddleware;
var page;
var site;
var roomMessagesOld = [];


/** Wrapper function. **/
async function init() {

	const user = await Storage.getLocal('user');
	username = user.username;


	/** Same Site/page **/
	const promise = new Promise(function(resolve, reject) {
		chrome.runtime.sendMessage(null, {action: 'pageDomain'}, (response) => {
			console.log('response', response)
			resolve(response.data.page);
		});
	});

	const rawPage = await promise;
	page = Helper.removeQueryString(rawPage);
	site = Helper.extractDomain(page);
	

	/** socket init. **/
	socket = io(socket_url, {secure: true, query: {page: page}});

	/** Socket Listeners. **/
	socket.on(`connect`, SocketListener.onConnect);
	socket.on(`user disconnected`, SocketListener.onDisconnect);
	socket.on(`new user`, SocketListener.onNewUser);
	socket.on(`chat message`, SocketListener.onChatMessage);
	socket.on(`new room notify`, SocketListener.onRoomNotify);
	socket.on(`chat room message`, SocketListener.onRoomMessage);
	socket.on(`new users in room`, SocketListener.onNewUsersInRoom);
	socket.on(`confirm user disconnect`, SocketListener.confirmUserDisconnect);
	socket.on(`page_room_new_user`, SocketListener.pageRoomNewUser);

};


/**
* Emit messages on socket.
*/
SocketEmitter = {

	emitChatMessage: (socket, data) => {
		socket.emit(`chat message`, {
			message: data.message,
			from: data.from,
			to: data.to,
			time_of_message: data.time_of_message,
			channelId: data.channelId
		});
	},


	emitRoomCreateNotification: (socket, data) => {
		socket.emit(`new room`, {
			room_name: data.room_name,
			room_id: data.room_id,
			users: data.users,
			createdBy: data.room_owner
		});
	},


	emitChatRoomMessage: (socket, data) => {
		socket.emit(`chat room message`, {
			message: data.message,
			from: data.from,
			to: data.to,
			time_of_message: data.time_of_message,
			channel: data.channel
		});
	},

	emitUserAddedToRoomNotification: (socket, room_id, room, newUsers) => {
		socket.emit(`new users in room`, {
			room_name: room.name,
			room_id: room_id,
			users: room.users,
			createdBy: room.created_by,
			newUsers: newUsers
		});
	},

	emitUserDisconnect: (socket, data) => {
		
		socket.emit(`disconnect`, data.user.username);
	},

	/** Disconnect a User **/
	disconnectStatus: (socket, data) => {
		
		socket.emit(`disconnectStatus`, data);
	},


	/** Emit page room new user added. **/
	pageRoomNewUser: (socket, data) => {

		socket.emit(`page_room_new_user`, data.room);
	},
};

SocketListener = {

	onConnect: (nullSocket) => {
		
		/** Send connect status to server. **/
		socket.emit('new user', username);
	},

	onDisconnect: (userName) => {

		Render.removeOnlineUserFromList(userName);

		/** remove me from online list **/
		const my_index = existing_online_users.indexOf(userName);
		if (my_index > -1) existing_online_users.splice(my_index, 1);
	},

	onNewUser: (data) => {
		const keys = Object.keys(data);

		const my_index = keys.indexOf(username);

		/** remove my entry from list. **/
		if (my_index > -1) {
			keys.splice(my_index, 1);
			delete data[username];
		}
		
		/** Identify new users to add to list. **/
		const new_online_users = Helper.checkNewElementsInSecondArray(existing_online_users, keys);


		/** update online users list. **/
		Render.updateOnlineList(new_online_users, data);

		existing_online_users = keys;
	},

	onChatMessage: (data) => {

		const message = Helper.identifyMessage(data.channelId);
		const userWindow = document.getElementsByClassName(`user-${Helper.usernameEncode(message.to)}`);
		
		if (message.from == username) {
			Render.myMessage(data);
		} else {
			Render.userMessage(data);
		}

		// manipulate data variable.
		if (username == data.from) {
			data.channelId = btoa(`${username}-0-${data.to}`);
		} else {
			data.channelId = btoa(`${username}-0-${data.from}`);
		}
		Messages.set(data);
	},


	onRoomNotify: async (data) => {
		
		if ( data.users.indexOf(username) > -1 ) {
			
			Room.create(data);
			
			swal({
				title: "New room Notification",
				text: `Added to room: "${data.room_name}"`,
				icon: "info",
				buttons: ["Ok", "GO TO ROOM"],
				dangerMode: true,
			})
			.then((go_to_room) => {
				if (go_to_room) {
					/** Show all rooms **/
					$(`.nav-item .show-rooms`).trigger('click');
					setTimeout(() => {
						console.log($(`.room-${data.room_id}`))
						$(`.room-${data.room_id}`).trigger('click');
					}, 100);
					
				} else {
					/** Show all rooms **/
					$(`.nav-item .show-rooms`).trigger('click');
				}
			});
		}
	},


	onRoomMessage: (data) => {

		const message = data;
		const userWindow = $(`.room-chat.room-${message.to}`);
		
		if (message.from == username) {
			Render.myRoomMessage(data);
		} else {
			Render.userRoomMessage(data.to, data);
		}
	},


	onNewUsersInRoom: async (data) => {
		
		if ( data.newUsers.indexOf(username) > -1 ) {
			const old_msgs = await Database.getRoomMessages(data.room_id);
			
			if (old_msgs.status) roomMessagesOld[data.room_id] = old_msgs.messages;

			Room.create(data);

			swal({
				title: "New room Notification",
				text: `Added to room: "${data.room_name}"`,
				icon: "info",
				buttons: ["Ok", "GO TO ROOM"],
				dangerMode: true,
			})
			.then((go_to_room) => {
				if (go_to_room) {
				
					$(`.nav-item .show-rooms`).trigger('click');
					setTimeout(() => {
						$(`.room-${data.room_id}`).trigger('click');
					}, 1000);

				} else {
					/** Show all rooms **/
					$(`.nav-item .show-rooms`).trigger('click');
				}
			});
		} else {
			const room = await Room.getRoom(data.room_id);
			await Room.addMoreUsers(data.room_id, data.newUsers);			
		}
	},


	confirmUserDisconnect: (data) => {
		if (data == username) {
			SocketEmitter.disconnectStatus(socket, data);
		}
	},


	pageRoomNewUser: async (data) => {

		const room = await Room.getRoom(data.room_id);
		if (room !== false) {
			Room.updateRoom(data);
		}
	},
};



/**
* Main iframe recieve messages.
*/
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

	switch (request.action) {

		case `emitMessage`:
			sendResponse({ status: "success" });
			console.log('emit message', request.data);
			SocketEmitter.emitChatMessage(socket, request.data);
			break;

		case `userChatBoxOnPage`:
			sendResponse({ status: "success" });

			Render.chatFrameUserMessage(request.data);
			break;

		case `notifyUsersAboutRoom`:
			sendResponse({ status: "success" });

			SocketEmitter.emitRoomCreateNotification(socket, request.data);
			break;

		case `emitMessageToRoomChannel`:
			sendResponse({ status: "success" });

			SocketEmitter.emitChatRoomMessage(socket, request.data);
			break;

		case `userRoomChatBoxOnPage`:
			sendResponse({ status: "success" });

			Render.roomChatFrameUserMessage(request.data);
			break;

		case `userDisconnect`:
			sendResponse({ status: "success" });

			SocketEmitter.emitUserDisconnect(socket, request.data);
			break;

		case `errorCreatingRoom`:
			sendResponse({ status: "success" });

			Render.roomCreateError(request.data);
			break;

		case `roomCreated_N_ShowRoomWindow`:
			sendResponse({ status: `success` });

			Render.showRoomWindow(request.data);
			break;

		case `pageRoomNewUser`:
			sendResponse({ status: `success` });

			SocketEmitter.pageRoomNewUser(socket, request.data);
			break;

		default:
			// sendResponse({ status: "default case" });
			console.log('something')
	}

});


SocketMiddleware = {
	emitNotificationAddedToRoom: (room_id, room, newUsers) => {

		SocketEmitter.emitUserAddedToRoomNotification(socket, room_id, room, newUsers);
	},


	emitMessage: (data) => {
		SocketEmitter.emitChatMessage(socket, data);
	},


	emitMessageToRoom: (data) => {

		SocketEmitter.emitChatRoomMessage(socket, data);	
	},
};


