var Room;

Room = {
	key: `rooms`,


	validateRoomName: (room_name) => {
		return room_name.replace(` `, `_`);
	},

	generateUniqueRoomId: (room_name) => {
		return Date.now() + Math.random().toString(36).substring(7) + room_name;
	},


	create: async (room) => {
		const room_name = Room.validateRoomName(room.room_name);
		const room_id = Room.generateUniqueRoomId(room_name);

		const rooms = await Room.getAll(Room.key);
		const user = await User.get();

		console.log('rooms', rooms);

		const roomData = Room.roomData(room_name, room_id, room.users, user.username);
		
		if (rooms === undefined) {

			/** set rooms key. and its values. **/
			Storage.setLocal(Room.key, {
				[room_id]: roomData
			});
			return;
		}

		/** in case of more rooms add to storage. **/
		rooms[room_id] = roomData;
		Storage.setLocal(Room.key, rooms);
	},

	getAll: async (room) => {
		return await Storage.getLocal(room);
	},

	roomData: (name, id, roomMembers, user) => {
		return {
			name: name,
			users: roomMembers,
			created_by: user
		};
	},

	deleteAll: () => {
		Storage.removeLocal(Room.key);
	},
};