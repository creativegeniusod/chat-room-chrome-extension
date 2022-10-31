var Room;

Room = {
	key: `rooms`,


	validateRoomName: (room_name) => {
		return room_name.replace(/ /g, `_`);
	},

	generateUniqueRoomId: (room_name) => {
		return Date.now() + Math.random().toString(36).substring(7) + room_name;
	},

	generateUniqueSiteRoomIdFromURL: (url) => {
		return url.split('//')[1].split('/')[0].replace(/\./g, '__');
	},

	generateUniquePageRoomIdFromURL: (url) => {
		return url.split('?')[0].replace(/[^\w\s]/gi, '_');
	},


	create: async (room) => {

		const rooms = await Room.getAll(Room.key);

		var created_by = '';
		if ('createdBy' in room) created_by = room.createdBy;
		else if ('room_owner' in room) created_by = room.room_owner;
		else created_by = room.created_by;

		var room_messages_temp = [];
		if (room.messages !== undefined && room.messages.length > 0) {
			room_messages_temp = room.messages;
		}

		var url = null;
		if ('url' in room) {
			url = room.url;
		}

		var isPageRoom = false;
		if ('isPageRoom' in room) isPageRoom = true;

		var clean_url = room.room_name;
		if ('clean_url' in room) clean_url = room.clean_url;

		var description = '';
		if ('description' in room) description = room.description;

		const roomData = Room.roomData(room.room_name, room.room_id, room.users, created_by, room_messages_temp, url, isPageRoom, clean_url, description);
		
		if (rooms === undefined) {

			/** set rooms key. and its values. **/
			Storage.setLocal(Room.key, {
				[room.room_id]: roomData
			});
			return;
		}

		/** in case of more rooms add to storage. **/
		rooms[room.room_id] = roomData;
		Storage.setLocal(Room.key, rooms);
	},

	getAll: async (room) => {
		return await Storage.getLocal(room);
	},

	getRoom: async (room_id) => {
		const rooms = await Room.getAll(Room.key);
		if (rooms !== undefined && room_id in rooms) {
			return rooms[room_id];
		}
		return false;
	},

	roomData: (name, id, roomMembers, user, roomMessages, url, isPageRoom, clean_url, description) => {
		return {
			name: name,
			users: roomMembers,
			created_by: user,
			room_messages: roomMessages,
			url: url,
			isPageRoom: isPageRoom,
			clean_url: clean_url,
			description: description
		};
	},

	deleteAll: () => {
		Storage.removeLocal(Room.key);
	},


	/**
	* This should be named "updateRoom".
	*/
	addMoreUsers: async (room_id, newUsers) => {
		const rooms = await Room.getAll(Room.key);
		const room = rooms[room_id];

		const newOnes = Helper.checkNewElementsInSecondArray(room.users, newUsers);
		
		for (var i = newUsers.length - 1; i >= 0; i--) {
			if (room.users.indexOf(newUsers[i]) == -1) {
				room.users.push(newUsers[i]);
			}
		}

		rooms[room_id] = room;
		Storage.setLocal(Room.key, rooms);

		return {
			room: room,
			newOnes: newOnes
		};
	},


	/**
	* delete temp. room messages.
	*/
	deleteTempRoomMessages: async (room_id) => {
		
		// get room.
		const rooms = await Room.getAll(Room.key);
		const room = rooms[room_id];

		// delete messages.
		delete room.messages;

		// save updated data to room.
		rooms[room_id] = room;
		Storage.setLocal(Room.key, rooms);
		
		return true;
	},


	formatMessageProperties: (messages) => {

		var output = [];
		if (messages.length > 0) {
			for (var i = 0; i < messages.length; i++) {
				output.push({
					'message': messages[i].message,
					'from': messages[i].message_from,
					'time_of_message': messages[i].sent_time
				});
			}
		}
		return output;
	},


	updateRoomDescription: async (room_id, data) => {

		var interval = setInterval(async () => {
			const rooms = await Room.getAll(Room.key);
			if (room_id in rooms) {
				clearInterval(interval);

				const room = rooms[room_id];
				if ( 'description' in data ) {
					room.description = data.description;
				}

				rooms[room_id] = room;
				Storage.setLocal(Room.key, rooms);
			}

		}, 500);
	},


	/**
	* Update Room.
	*/
	updateRoom: async (data) => {

		const room_id = 'room_id' in data ? data.room_id : data.message.to;
		var rooms = await Room.getAll(Room.key);
		if (room_id in rooms) {
			const room = rooms[room_id];
			if ( 'users' in data ) {
				room.users = data.users;
			}

			if ( 'message' in data ) {
				room.room_messages.push({
					'message': data.message.message,
					'sent_time': data.message.time_of_message,
					'message_from': data.message.from
				});
			}

			rooms[room_id] = room;
			Storage.setLocal(Room.key, rooms);
		}
	},
};