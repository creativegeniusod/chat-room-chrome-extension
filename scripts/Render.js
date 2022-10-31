var Render, Html, Page;
var usersMessages = {};
var dataTable;
var myMessageLastTime, userMessageLastTime, lastMessageBy;
var lastRoomMessageFrom, lastRoomMessageTime;


/**
* Render Html on Webpage.
*/
Render = {

	WelcomeWindow: () => {
		if ( $(`#chat-room-frame`).length == 0 ) {
			$(`body`).append(Html.WelcomeFrame());
		}
	},

	ChatBox: (openPageChat = false, data = {}) => {
		
		if ( $(`#chat-room-frame`).length == 0 ) {
			$(`body`).append(Html.ChatRoomHome(openPageChat, data.pageTitle));
			dragElement(document.getElementById('chat-room-frame-container'));

		} else {
			console.log("Already on Page 1.");
		}
	},


	/**
	* refresh online users list inside iframe.
	*/
	updateOnlineList: (users, usersData) => {
		var online = ``;
		var addMoreUser = ``;
		var sameSite = ``;
		var samePage = ``;
		$(users).each((index, value) => {
			addMoreUser += Html.updateAddMoreUserList(value, usersData[value]);
			online += Html.updateOnlineList(value, usersData[value]);

			console.log('site', usersData[value].site, site);
			if (usersData[value].site == site) {
				sameSite += online;
			}

			if (usersData[value].page == page) {
				samePage += online;
			}
			
		});


		$(`.online-users`).append(online);
		$(`#add-more-users-list`).append(addMoreUser);

		$(`.online-users-same-site`).append(sameSite);
		$(`.online-users-same-page`).append(samePage);
	},

	/**
	* Remove Disconnected user from online list.
	*/
	removeOnlineUserFromList: (userName) => {
		$(`.user-${userName}`).remove();
		$(`.user-add-more-${userName}`).remove();

		const userEle = document.getElementsByClassName(`user-${Helper.usernameEncode(userName)}`)[0];

		$(userEle).find(`.header .left-side-icons .fas.fa-circle`).removeClass(`green`).addClass(`grey`);
		// $(`.user-chat.user-${Helper.usernameEncode(userName)} .header .left-side-icons .fas.fa-circle`).removeClass(`green`).addClass(`grey`);
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

	oneToOneMessage: (message) => {
		console.log('message: ', message);
	},

	myMessage: (message) => {
		const userWindow = document.getElementsByClassName(`user-${Helper.usernameEncode(message.to)}`);
		const userMessageArea = $(userWindow).find(`.messages`);

		if (Render.isExpandMessage(message)) {
			Render.addExpandedMessage(userMessageArea, "user-chat-messages", "full-user-message", message);
		} else {
			userMessageArea.append(Html.myMessage(message));
		}
		if (userMessageArea[0] !== undefined) {
			userMessageArea.scrollTop(userMessageArea[0].scrollHeight);
		}
	},

	myRoomMessage: (message) => {
		const roomWindow = $(`.room-chat.room-${message.to}`);
		const roomMessageArea = roomWindow.find(`.messages`);

		const isExpanded = Render.isExpandMessage(message);
		if (isExpanded) {
			Render.addExpandedMessage(roomMessageArea, "user-chat-messages", "full-user-message", message);
		} else {
			roomMessageArea.append(Html.myMessage(message));
		}
		roomMessageArea.scrollTop(roomMessageArea[0].scrollHeight);
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

	addMessageToPending: (message) => {
		if (usersMessages[message.from] === undefined) {
			usersMessages[message.from] = Array(message);
		} else {
			usersMessages[message.from].push(message);
		}
	},

	userMessage: (message) => {
		if (username == message.to) {
			
			const userWindow = document.getElementsByClassName(`user-${Helper.usernameEncode(message.from)}`);
			const userMessageArea = $(userWindow).find(`.messages`);

			if (userMessageArea.length == 1) {
				if (Render.isExpandMessage(message)) {
					Render.addExpandedMessage(userMessageArea, "profile-chat", "full-message", message);
				} else {
					userMessageArea.append(Html.userMessage(message));
				}
				userMessageArea.scrollTop(userMessageArea[0].scrollHeight);
			} else {
				
				Render.addMessageToPending(message);
			}


			if ( !$(`#chat-tab`).hasClass(`active`) ) {
				
				$(`#users-list .user-${message.from}`).find(`.notification`).show();
			}
		}
		
	},


	userRoomMessage: (message) => {
		if (username == message.to) {
			
			const roomWindow = $(`.room-chat.room-${message.from}`);
			const roomMessageArea = roomWindow.find(`.messages`);

			if (roomMessageArea.length == 1) {
				
				roomMessageArea.append(Html.userMessage(message));
				roomMessageArea.scrollTop(roomMessageArea[0].scrollHeight);
			} else {
				
				// Render.addMessageToPending(message);
			}


			if ( !$(`#chat-tab`).hasClass(`active`) ) {
				
				$(`#room-list .room-chat.room-${message.from}`).find(`.notification`).show();
			}
		}
		
	},

	userMissedMessages: (messages) => {

		if (messages !== undefined && messages.length > 0) {

			for (var i = 0; i < messages.length; i++) {
				Render.userMessage(messages[i]);
			}
		}
	},

	roomMissedMessages: (messages) => {

		if (messages !== undefined && messages.length > 0) {

			for (var i = 0; i < messages.length; i++) {
				Render.roomMessage(messages[i]);
			}
		}
	},

	ListRooms: (rooms) => {
		const keys = Object.keys(rooms);

		if (keys.length > 0) {
			
			var tableRows = `<tbody>`;
			for (var i = 0; i < keys.length; i++) {
				tableRows += Html.ListRoom(keys[i], rooms[keys[i]]);
			}
			tableRows += `</tbody>`;
			$(`.room-descriptions #room-list`).append(tableRows);

			// First destroy the datatable and then initialize
			if (dataTable !== undefined) dataTable.destroy();
			dataTable = $('#room-list').DataTable({
				"ordering": true,
				"paging": false,
				"searching": false,
				"info": false,
				"bPaginate": false
			});
		}
	},


	/**
	* render chat room iframe on webpage.
	* do not relocate code.
	*/
	createChatRoomFrame: (data, userMessages) => {
		
		if ( $(`#room-chat-${data.room_id}`).length == 0 ) {
			$(`#chat-room-frame`).before(Html.RoomChatFrame(data.user, data.room_id));

			if (userMessages !== undefined && userMessages.length > 0) {
				setTimeout(() => {
					Message.sendToExtension({
						action: `renderRoomSavedMessages`,
						data: {
							userMessages: userMessages
						}
					});
				}, 500);
			}
		}
	},

	roomChatFrameUserMessage: (message) => {

		if (!message.isExist) {
			if (usersMessages[message.to] === undefined) {
				usersMessages[message.to] = Array(message);
			} else {
				usersMessages[message.to].push(message);
			}
			
			$(`.room-${message.to} .notification`).show();
			return;
		}

		Message.sendToExtension({
			action: `newRoomChatMessage-${message.channel}`,
			data: message
		});
	},


	userRoomMissedMessage: (room_id, messages) => {

		if (messages !== undefined && messages.length > 0) {

			for (var i = 0; i < messages.length; i++) {
				Render.userRoomMessage(room_id, Helper.fixMessageKeys(messages[i]));
			}
		}
	},

	userRoomMessage: async (room_id, message) => {
		const user = await Storage.getLocal('user');
		const appendTo = $(`.room-chat.room-${room_id} .messages`);
		var messageFull = "";
		
		if (user.username == message.from) {
			if (Render.isExpandMessage(message)) {
				Render.addExpandedMessage(appendTo, "user-chat-messages", "full-user-message", message);
			} else {
				messageFull = Html.myMessage(message);
			}
		} else {
			if (Render.isExpandMessage(message)) {
				Render.addExpandedMessage(appendTo, "profile-chat", "full-message", message);
			} else {
				messageFull = Html.userMessage(message);
			}
		}
		appendTo.append(messageFull);
		appendTo.scrollTop($(".room-chat .messages")[0].scrollHeight);
	},

	isExpandMessage: (message) => {
		var return_bool = false;
		if (message.from == lastRoomMessageFrom) {
			if(Helper.newMessageWithinOneMinute(message.time_of_message, lastRoomMessageTime)) {
				return_bool = true;
			}
		}
		lastRoomMessageFrom = message.from;
		lastRoomMessageTime = message.time_of_message;
		return return_bool;
	},


	addExpandedMessage: (ele, findClass, messageEle, message) => {
		const expand_html = `<p class="full-user-message-expanded">${message.message}</p>`;
		const expanded_messages = ele.find(`.${findClass}`).last().find(`.full-user-message-expanded`);
		if (expanded_messages.length > 0) {
			$(expanded_messages[expanded_messages.length-1]).after(expand_html);
		} else {
			ele.find(`.${findClass}`).last().find(`.${messageEle}`).after(expand_html);
		}
	},


	/**
	* only UI handeling for add-more-users-to-room.
	*/
	addMoreUsersUiHandler: async (room_id) => {

		const room = await Room.getRoom(room_id);

		$(`.room-name input`).val(room.name);
		$(`.room-name input`).attr("disabled", "disabled");
		$(`.nav-item.create-tab-wrapper a`).attr('data-room-update', "true");

		setTimeout(() => {
			$(`.nav-item.create-tab-wrapper a`).trigger('click');
		}, 100);


	},

	cancelAddMoreUsersUiHandler: () => {

		/** Show/Hide areas. **/
		$(`.add-more-users`).hide();
		$(`.room-descriptions`).show();

		/** Show control buttons. **/
		$(`.add-more-users-options`).hide();

		/** Hide list-users button. **/
		$(`.list-users`).show();

		/** reset add-more-to-room users html **/
		$(`.add-more-to-room i`).removeClass(`green`).addClass(`grey`);
	},


	/**
	* update room row. 
	*/
	updateRoomRowDataInList: (room_id, room) => {

		/** update room-users count. **/
		$(`.room-${room_id} .users-count`).html(room.users.length + 1);
	},



	/**
	* Show edit profile view.
	*/
	showEditProfile: () => {
		$(`body`).append(Html.editProfileView());
	},


	updateChatRoomUI: (status, user) => {
		const status_msg = status ? "User updated successfully" : "unable to update user";
		$(`.edit-profile-messages .message i`).html(status_msg);

		if (status) {
			$(`.edit-profile-messages .message`).removeClass('alert-danger').addClass('alert-success').show();
		} else {
			$(`.edit-profile-messages .message`).removeClass('alert-success').addClass('alert-danger').show();
		}
	},


	userChatWindow: (username, messages, channelMessages) => {

		if (username == "" || username === undefined) {
			alert(`There was an issue with the request. Please try again.`);
			return;
		}

		var showSavedMsgs = false;
		const chat = document.getElementsByClassName(`user-${Helper.usernameEncode(username)}`);
		if (chat.length == 0) {

			
			if ( $(`#chat-tab .no-content-view`).length > 0 ) {
				$(`#chat-tab`).html(Html.userChatWindow(username, messages));
			} else {
				$(`#chat-tab`).append(Html.userChatWindow(username, messages));
			}
			showSavedMsgs = true;
		}

		if (showSavedMsgs) {
			Render.userConversation(channelMessages);
		}

		if (messages !== undefined && messages.length > 0) {
			Render.userMissedMessages(messages);
		}

		$(`.user-chat`).hide();
		$(`#chat-tab .room-chat`).hide();
		$(chat[0]).show();

		// de-select all sub-nav tabs. and show one-to-one chat window.
		Render.showChatTabManually();
		// finish


		// focus on last.
		$(chat).find(`.communication-area .text-box input.message`).trigger('focus');
	},

	showChatTabManually: (chatIconClicked=false) => {
		if (chatIconClicked) $('#tabs .nav-item').css('background', 'lightgrey');
		$('#tabs .nav-item a').removeClass('active');
		$('#tabs .nav-item #users-tab').addClass('active');
		$('#nav-tabContent .tab-pane').removeClass('active');
		$('.top-bar a').removeClass('active-icon');
		$('.top-bar .icon-chat-tab').addClass('active-icon');
		$('#chat-tab').addClass('active');
	},


	roomChatWindow: (room, room_id, messages) => {
		if (room && !'name' in room) {
			alert(`There was an issue with the request. Please try again.`);
			return;
		}

		var roomChat = $(`#chat-tab .room-${room_id}`);
		var roomChatContainer = $(`#chat-tab`);
		var roomChatMenu = $(`#chat-tab`);
		if ('custom_room' in room && room.custom_room) {
			roomChat = $(`#rooms-chat-view .room-${room_id}`);
			roomChatContainer = $(`#rooms-chat-view`);
		}
		
		if (roomChat.length == 0) {
			const clean_url = ('clean_url' in room && room.clean_url != '') ? room.clean_url : '';
			const description = 'description' in room ? room.description : '';

			const charRoomWindowHtml = Html.roomChatWindow(
				username,
				room,
				room_id,
				messages,
				clean_url,
				description
			);

			if ( roomChatContainer.find(`.no-content-view`).length > 0 ) {
				roomChatContainer.html(charRoomWindowHtml);
			} else {
				roomChatContainer.append(charRoomWindowHtml);
			}
			Render.userRoomMissedMessage(room_id, messages);
			roomChat = roomChatContainer.find(`.room-${room_id}`);
		}

		$(`.user-chat`).hide();
		roomChatContainer.find(`.room-chat`).hide();
		roomChat.show();
		$(`.nav-item.chat-tab a`).trigger(`click`);

		// focus on last.
		$(roomChat).find(`.communication-area .text-box input.message`).trigger('focus');
		return true;
	},


	roomCreateError: () => {

		swal('Sorry!', 'Unable to create room. Please try again.', 'error');
	},


	userConversation: (messages) => {
		
		for (var i = 0; i < messages.length; i++) {

			var message = messages[i];
			if (username == messages[i].from) {
				const myWindow = document.getElementsByClassName(`user-${Helper.usernameEncode(message.to)}`);
				const myMessageArea = $(myWindow).find(`.messages`);
				myMessageArea.append(Html.myMessage(message));
			} else {
				const userWindow = document.getElementsByClassName(`user-${Helper.usernameEncode(message.from)}`);
				const userMessageArea = $(userWindow).find(`.messages`);
				userMessageArea.append(Html.userMessage(message));
			}
		}

	},


	/**
	* Page Icon.
	*/
	pageIcon: async (delay_time=0) => {
		if (delay_time > 0) await delay(delay_time);

		if ( $(`#chat-room-frame`).length == 0 ) {
			
			// check if launcher is turned off by user itself.
			const launcherState = await LauncherState.get();
			if (!launcherState.state) return;

			if ($(`.chat-room-open-icon`).length == 0) {
				const room_id = Helper.getSiteRoomId();
				const room = await Room.getRoom(room_id);
				var icon = defaultIcon;
				var chat_history = false;
				if (room.room_messages !== undefined && room.room_messages.length > 0) {
					icon = IconWch;
					chat_history = true;
				}

				$('body').append(`
					<div class="chat-room-launcher">
						<div class="chat-room chat-room-open-icon">
							<img src="${icon}" data-chat-history="${chat_history}" data-orig-img="${icon}" data-page-title="${window.pageTitle}" />
						</div>
						<div class="launcher-func-icons" style="display: none;">
							<i class="hide-launcher-icon"> x </i>
							<i class="chat-icon"> <img src="${chatIcon}"/> </i>
							<i class="vote-icon vote-icon-plus" data-vote="1"> <img src="${voteUp}"/> </i>
							<i class="vote-icon vote-icon-minus" data-vote="0"> <img src="${voteDown}"/> </i>
						</div>
						<div class="launcher-message" style="display: none;">
							<b class="message-notification">You already voted today! :)</b>
						</div>
					</div>
				`);
				$(document).on(`click`, `.chat-room-open-icon`, EventListeners.chatRoomOpen);
				$('.chat-room-open-icon img').hover(EventListeners.launcherIconHover);
				$('.chat-room.chat-room-open-icon > img').mouseout(EventListeners.launcherIconHoverOut);
				$('.launcher-func-icons .hide-launcher-icon').on('click', EventListeners.hideLauncherIcon);	
				$('.launcher-func-icons > .vote-icon > img').on('click', EventListeners.siteVote);
				$('.launcher-func-icons > .chat-icon > img').on('click', EventListeners.chatIconClick);
			} else {
				$(`.chat-room-open-icon`).show();
			}
		}
		return true;
	},


	hideLauncherIcon: () => {
		$('.chat-room-launcher').hide();
	},

	showLauncherIcon: () => {
		if ($('.chat-room-launcher').length > 0) {
			$('.chat-room-launcher').show();
		} else {
			Render.pageIcon();
		}
	},


	showPageScore: (pageScore) => {
		
		const interval = setInterval(() => {
			if ($('.chat-room-launcher').length > 0) {
				clearInterval(interval);
				const pageScoreHtml = $('.chat-room-launcher .page-score');
				if (pageScoreHtml.length == 0) {
					$('.chat-room-launcher').append(Html.showPageScore(pageScore));
				}
			}
		}, 1000);
	},


	refreshFrame: () => {

		$(`#chat-room-frame-container`).remove();
		Render.ChatBox();
		return;
	},


	/**
	* Find page Title.
	*/
	findPageTitle: (room_id) => {
		const title = $('head').find('title').html();
		
		if ( title !== undefined || title != "") {
			
			Message.sendToExtension({
				action: `roomDescription`,
				data: { room_id: room_id , description: title }
			});
		}
	},


	/**
	* fired when page room is created.
	*/
	showRoomWindow: async (data) => {
		
		$('.page-processing').hide();
		const ele = data.room_data.isSiteRoom ? $(`#site-view`) : $(`#web-page-view`);
		ele.append(Html.roomChatWindow(
			data.user.username,
			data.room_data,
			data.room_data.room_id,
			data.room_data.messages,
			data.room_data.clean_url,
			data.room_data.description
		));
		Render.userRoomMissedMessage(data.room_data.room_id, data.room_data.messages);

		// focus on last.
		// $(`#chat-tab .room-${data.room_data.room_id}`).find(`.communication-area .text-box input.message`).trigger('focus');
		// $(`#site-view .room-${data.room_data.room_id}`).find(`.communication-area .text-box input.message`).trigger('focus');
		ele.find(`.room-${data.room_data.room_id}`).find(`.communication-area .text-box input.message`).trigger('focus');
	},


	/**
	* Update page score after vote.
	*/
	updatePageScore: (data) => {
		var border = 'border-red';
		if (data.pageScore >= 50 && data.pageScore < 80) border = 'border-yellow';
		else if (data.pageScore >= 80) border = 'border-green';

		const ele = $(".chat-room-launcher .page-score");
		if (ele.length > 0) {
			if (data.pageScore == 0) {
				ele.removeClass('border-red border-yellow border-green').addClass('border-red');
				ele.find('span').html(data.pageScore);
				ele.animate({
					opacity: 0
				}, 1000, function() {
					ele.remove();
				});
				return;
			}
			
			// continue execution.
			ele.removeClass('border-red border-yellow border-green').addClass(border);
			ele.find('span').html(data.pageScore);
		} else {
			if (data.pageScore > 0) {
				$('.chat-room-launcher').append(Html.showPageScore(data.pageScore));
				$(".chat-room-launcher .page-score").css('opacity', 0).animate({
					opacity: 1
				}, 500);
			}
		}

		
	},

};

const delay = ms => new Promise(res => setTimeout(res, ms));


Html = {

	WelcomeFrame: () => {
		const src = chrome.runtime.getURL('views/signup.html');
		const html = `
			<iframe id="chat-room-frame" src="${src}"></iframe>
		`;
		return html;
	},

	ChatRoomHome: (openPageChat, pageTitle) => {
		const src = chrome.runtime.getURL(`views/chatRoom.html?openPageChat=${openPageChat}&pageTitle=${pageTitle}`);
		const html = `
			<div id="chat-room-frame-container">
				&nbsp;
				<div id="chat-room-frame-mover">&nbsp;</div>
				<iframe id="chat-room-frame" src="${src}" draggable="true"></iframe>
			</div>
		`;
		return html;
	},

	RoomChatFrame: (user, room_id) => {
		const src = chrome.runtime.getURL(`views/roomChatFrame.html?user=${user}&room_id=${room_id}`);
		const html = `
			<iframe id="room-chat-${room_id}" class="room-chat-iframe" src="${src}"></iframe>
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

	updateAddMoreUserList: (username) => {
		const html = `
			<tr class="user-add-more-${username}" data-username="${username}">
				<td class="add-more-to-room">
					<i class="fas fa-check-circle grey"</i>
				</td>
				<td><img src="../images/user-name.png"></td>
				<td class="user-name">${username}</td>
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
		const time = new Date(message.time_of_message);
		// const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

		const formattedTime = time.toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" });
		
	 	const html = `
		<div class="user-chat-messages">
			<label><a href="#"><img src="../images/browser-profile.png"></a></label>
			<p class="client-name">
				<span class="separater-line">You</span>
			</p>
			<p class="full-user-message">${message.message}</p>
			<p class="time-of-message">${formattedTime}</p>
		</div>`;
		myMessageLastTime = time;
		return html;
	},

	userMessage: (message) => {
		const time = new Date(message.time_of_message);
		const formattedTime = time.toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" });
		
		const html = `
		<div class="profile-chat">
			<label><a href="#"><img src="../images/browser-profile.png"></a></label>
			<p class="client-name">
				<span class="separater-line">${message.from}</span>
			</p>
			<p class="full-message">${message.message}</p>
			<p class="time-of-message">${formattedTime}</p>
		</div>`;
		userMessageLastTime = time;
		return html;
	},


	ListRoom: (id, room) => {
		console.log(room)
		var room_class = '';
		var room_url = '';
		if ('url' in room) {
			room_class = 'open-room-url';
			room_url = room.url;
		}

		var short_desc = '-';
		var long_desc = '-';
		if ('description' in room) {
			short_desc = room.description.substring(0, 15) + '...';
			long_desc = room.description;
		}

		var users_count = room.users.length;
		var room_name = 'Site';
		if (!room.isPageRoom) {
			users_count += 1;
			room_name = room.name;
		}
		const html = `
			<tr class="room-${id} room-row" data-room-id="${id}">
				<td class="${room_class}" data-room-url="${room_url}">
					<i class="fas fa-circle red notification" style="display:none;"></i>
					${room_name}
				</td>
				<td class="room-description" data-toggle="tooltip" data-placement="left" title="${long_desc}">${short_desc}</td>
				<td>${room.created_by}</td>
				<td class="users-count">${users_count}</td>
				<td class="add-more-users-to-room"><i class="fa fa-user-plus" aria-hidden="true"></i></td>
			</tr>
		`;
		return html;
	},


	/**
	* Edit Profile View.
	*/
	editProfileView: (user) => {
		const src = chrome.runtime.getURL('views/editProfile.html');
		const html = `
			<iframe id="edit-user-frame" src="${src}"></iframe>
		`;
		return html;
	},


	userChatWindow: (username, messages) => {

		const html = `
			<div class="chat user-chat user-${Helper.usernameEncode(username)}" data-userid="${Helper.usernameEncode(username)}" data-chat-type="user">
				<div class="header">
					<div class="left-side-icons frame-title">
						<i class="fas fa-circle green"></i>
						<i class="user-name">${username}</i>
					</div>
					<div class="right-side-icons frame-title">
						<a href="#" class="btn btn-danger btn-sm chat-close" data-userid="${Helper.usernameEncode(username)}"><b>Close</b></a>
					</div>
				</div>
				<div class="communication-area">
					<div class="messages">&nbsp;</div>
					<div class="text-box">
						<a class="emoji-section smiley">
							<img src="${chrome.runtime.getURL('images/smile.png')}">
						</a>
						<input class="message" data-username="${username}" type="text" placeholder="Type here..." />
						<a class="message-send emoji-section" data-username="${username}">
							<img src="${chrome.runtime.getURL('images/send-btn.png')}">
						</a>
					</div>
				</div>
			</div>
		`;
		return html;
	},


	roomChatWindow: (username, room, room_id, messages, clean_url="", description="") => {
		var room_name = 'name' in room ? room.name : room.room_name;
		const display_name = (clean_url != "") ? clean_url.substring(0, 33) + '...' : room_name.substring(0, 33);
		const desc_trimmed = description.substring(0, 40) + '...';
		
		var isLink = false;
		var room_page_url = clean_url;
		var linkClass = '';
		if ( 'isPageRoom' in room && room.isPageRoom) {
			isLink = true;
			room_page_url = room.url;
			linkClass = 'can-be-link';

		} else if ( 'isSiteRoom' in room && room.isSiteRoom) {
			isLink = true;
			room_page_url = Helper.extractDomainWithScheme(room.url);
			linkClass = 'can-be-link';

		} else if ('custom_room' in room) {
			room_page_url = '';

		}
		
		const html = `
			<div class="chat room-chat room-${room_id}" data-roomid="${room_id}" data-chat-type="room">
				<div class="header sub-nav-bar">
					<div class="sub-nav-left  frame-title">
						<i class="fas fa-circle green"></i>
						<span class="room-name" data-toggle="tooltip" data-placement="top" title="${description}">${desc_trimmed}</span>
						<div class="${linkClass}" data-isLink=${isLink} data-toggle="tooltip" data-placement="top" title="${room_page_url}">${display_name}</div>
					</div>
					<div class="sub-nav-right">
						<button class="room-chat-close">Close</button>
					</div>
				</div>
				<div class="communication-area">
					<div class="messages">&nbsp;</div>
					<div class="text-box">
						<a class="emoji-section smiley">
							<img src="${chrome.runtime.getURL('images/smile.png')}">
						</a>
						<input class="message" data-roomname="${room_name}" type="text" data-roomid="${room_id}" placeholder="Type here..." />
						<a class="message-send emoji-section" data-roomname="${room_name}">
							<img src="${chrome.runtime.getURL('images/send-btn.png')}" data-roomid="${room_id}">
						</a>
					</div>
				</div>
			</div>
		`;
		return html;
	},


	showPageScore: (pageScore) => {
		var border = 'border-red';
		if (pageScore >= 50 && pageScore < 80) border = 'border-yellow';
		else if (pageScore >= 80) border = 'border-green';
		
		return `
			<div class="page-score ${border}">
				<span>${pageScore}</span>
			</div>
		`;
	},

};

Page = {
	setChatBoxVars: async (url) => {
		
		const params = Helper.urlParamsToObj(url);
		const user = await Storage.getLocal('user');
		window.chatOutChannel = btoa(`${user.username}-0-${params.username}`);
		window.chatInChannel = btoa(`${params.username}-0-${user.username}`);
		
		if ('username' in params) {
			$(`.user-chat .user-name`).html(params.username);
		}
		$(`.user-chat .message`).focus();
	},


	setRoomChatBoxVars: async (url) => {
		const params = Helper.urlParamsToObj(url);
		window.inOutChannel = btoa(params.room_id);

		const room = await Room.getRoom(params.room_id);
		if (room) {
			$(`.room-chat .room-name`).html(room.name.toUpperCase());
		}
		$(`.room-chat .room-chat-close`).attr(`data-room-id`, params.room_id);
		$(`.room-chat .message`).focus();
	},


	setUserEditProfileData: async () => {
		const user = await Storage.getLocal('user');

		if (user !== undefined && user.username !== undefined) {

			/** set username to textfield. **/
			$(`.user-username`).val(user.username).attr('data-current-val', user.username).show('slow');
			$(`.user-email`).val(user.email).attr('data-current-val', user.email).attr('title', user.email).show('slow');
		}
		return;
	},

}