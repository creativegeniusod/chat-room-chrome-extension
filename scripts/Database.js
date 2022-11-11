var Database;

Database = {

	/**
	* Global request headers.
	*/
	headers: () => {

		return {
			"content-type": "application/json;charset=UTF-8"
		}
	},

	/**
	* Save room message.
	*/
	saveRoomMessage: (message) => {
		
		Request.post(`${db_app_url}api/v1/room/message`, JSON.stringify(message), Database.headers());
	},

	/**
	* Add more users to room.
	*/
	addMoreUsers: async (room_id, new_users) => {
		const data = {
			room_id: room_id,
			new_users: new_users
		};
		return await Request.post(`${db_app_url}api/v1/add/new/room/users`, JSON.stringify(data), Database.headers());
	},

	/**
	* getR room messages.
	*/
	getRoomMessages: async (room_id) => {
		const data = {
			room_id: room_id
		};
		return await Request.post(`${db_app_url}api/v1/get/room/messages`, JSON.stringify(data), Database.headers());
	},


	/**
	* Save Site Vote.
	*/
	castPageVote: async (user, vote, page) => {
		const data = {
			username: user,
			page: page
		};
		return await Request.post(`${db_app_url}api/v1/vote/${vote}`, JSON.stringify(data), Database.headers());
	},


	/**
	* Get page Score.
	*/
	getPageScore: async (page) => {
		const data = {
			page: page
		};
		return await Request.post(`${db_app_url}api/v1/vote/page/score/`, JSON.stringify(data), Database.headers());
	},
};