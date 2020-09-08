var Render, Html, Page;
var usersMessages = {};


/**
* Render Html on Webpage.
*/
Render = {

	WelcomeWindow: () => {
		if ( $(`#chat-room-frame`).length == 0 ) {
			$(`body`).append(Html.WelcomeFrame());
		}
	},

	ChatBox: () => {
		if ( $(`#chat-room-frame`).length == 0 ) {
			$(`body`).append(Html.ChatRoomHome());
		} else {
			alert("Already on Page 1.");
		}
	},

	/**
	* refresh online users list inside iframe.
	*/
	updateOnlineList: (users) => {
		var online = ``;
		$(users).each((index, value) => {
			online += Html.updateOnlineList(value);
		});
		$(`.online-users`).append(online);
	},

	/**
	* Remove Disconnected user from online list.
	*/
	removeOnlineUserFromList: (userName) => {
		$(`.user-${userName}`).remove();
	},


	/**
	* chat with a user. (Frame).
	*/
	ChatBoxWithUserFrame: (username, userMessages) => {
		if ( $(`#user-chat-frame-${username}`).length == 0 ) {
			$(`#chat-room-frame`).before(Html.UserChatFrame(username));

			if (userMessages !== undefined && userMessages.length > 0) {
				setTimeout(() => {
					Message.sendToExtension({
						action: `renderSavedMessages`,
						data: {
							userMessages: userMessages
						}
					});
				}, 500);
			}
		}
	},

	myMessage: (message) => {
		$(`.user-chat .messages`).append(Html.myMessage(message));
		$(`.user-chat .messages`).scrollTop($(".user-chat .messages")[0].scrollHeight);
	},

	chatFrameUserMessage: (message) => {
		if (!message.isExist) {
			if (usersMessages[message.from] === undefined) {
				usersMessages[message.from] = Array(message);
			} else {
				usersMessages[message.from].push(message);
			}

			$(`.user-${message.from} .notification`).show();
			return;
		}

		Message.sendToExtension({
			action: `newChatMessage-${message.channelId}`,
			data: message
		});
	},

	userMessage: (message) => {
		$(`.user-chat .messages`).append(Html.userMessage(message));
		$(".user-chat .messages").scrollTop($(".user-chat .messages")[0].scrollHeight);
	},

	userMissedMessages: (messages) => {

		if (messages !== undefined && messages.length > 0) {

			for (var i = 0; i < messages.length; i++) {
				Render.userMessage(messages[i]);
			}
		}
	},

	ListRooms: (rooms) => {
		const keys = Object.keys(rooms);

		if (keys.length > 0) {
			for (var i = 0; i < keys.length; i++) {
				$(`.room-descriptions #room-list`).append(Html.ListRoom(keys[i], rooms[keys[i]]));
			}
		}
	},
};


Html = {

	WelcomeFrame: () => {
		const src = chrome.runtime.getURL('views/signup.html');
		const html = `
			<iframe id="chat-room-frame" src="${src}"></iframe>
		`;
		return html;
	},

	ChatRoomHome: () => {
		const src = chrome.runtime.getURL(`views/chatRoom.html`);
		const html = `
			<iframe id="chat-room-frame" src="${src}"></iframe>
		`;
		return html;
	},

	updateOnlineList: (username) => {
		const html = `
			<tr class="user-${username}" data-username="${username}">
				<td class="add-in-room" style="display: none;">
					<i class="fas fa-check-circle grey"</i>
				</td>
				<td><i class="fas fa-circle green"></i></td>
				<td><img src="../images/user-name.png"></td>
				<td><i class="fas fa-circle red notification" style="display:none;"></i> ${username}</td>
			</tr>
		`;
		return html;
	},

	UserChatFrame: (username) => {
		username = username.replace(` `, `_`);
		const src = chrome.runtime.getURL(`views/userChat.html?username=${username}`);
		var html = `
			<iframe id="user-chat-frame-${username}" src="${src}" class="user-chat"></iframe>
		`;
		return html;
	},

	myMessage: (message) => {
		const html = `
		<div class="user-chat-messages">
			<p class="client-name">You</p>
			<label><a href="#"><img src="../images/browser-profile.png"></a></label>
			<p class="full-user-message">${message.message}</p>
		</div>`;
		return html;
	},

	userMessage: (message) => {
		const time = new Date(message.time_of_message);
		const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
		
		const html = `
		<div class="profile-chat">
			<label><a href="#"><img src="../images/browser-profile.png"></a></label>
			<p class="client-name">${message.from}</p>
			<p class="full-message">${message.message}</p>
			<p class="time-of-message">${formattedTime}</p>
		</div>`;
		return html;
	},


	ListRoom: (id, room) => {
		const html = `
			<tr class="room-${id}" data-room-id="${id}">
				<td>${room.name}</td>
				<td> - </td>
				<td>${room.created_by}</td>
				<td>${room.users.length}</td>
			</tr>
		`;
		return html;
	}

};

Page = {
	setChatBoxVars: async (url) => {
		const search = url.substring(1);
		const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

		const user = await Storage.getLocal('user');
		window.chatOutChannel = btoa(`${user.username}-0-${params.username}`);
		window.chatInChannel = btoa(`${params.username}-0-${user.username}`);
		
		if ('username' in params) {
			$(`.user-chat .user-name`).html(params.username);
		}
		$(`.user-chat .message`).focus();
	},
}