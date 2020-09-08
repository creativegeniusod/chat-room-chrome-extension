var SocketListener, SocketEmitter;
var socket;
var existing_online_users;

/** Wrapper function. **/
async function init() {

	const user = await Storage.getLocal('user');
	username = user.username;

	/** socket init. **/
	socket = io(socket_url, {secure: true});

	/** Socket Listeners. **/
	socket.on(`connect`, SocketListener.onConnect);
	socket.on(`user disconnected`, SocketListener.onDisconnect);
	socket.on(`new user`, SocketListener.onNewUser);
	socket.on(`chat message`, SocketListener.onChatMessage);

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

		const my_index = data.indexOf(username);

		/** remove my entry from list. **/
		if (my_index > -1) data.splice(my_index, 1);
		
		/** Identify new users to add to list. **/
		const new_online_users = Helper.checkNewElementsInSecondArray(existing_online_users, data);

		/** update online users list. **/
		Render.updateOnlineList(new_online_users);

		existing_online_users = data;
	},

	onChatMessage: (data) => {

		/** check that user chat frame exist on page. **/
		Message.sendToExtension({
			action: 'checkUserChatBox',
			data: data
		});
	},
};



/**
* Main iframe recieve messages.
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	switch (request.action) {

		case `emitMessage`:
			sendResponse({ status: "success" });

			SocketEmitter.emitChatMessage(socket, request.data);
			break;

		case `userChatBoxOnPage`:
			sendResponse({ status: "success" });

			Render.chatFrameUserMessage(request.data);
			break;

		default:
			sendResponse({ status: "default case" });
	}

});