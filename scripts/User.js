var User;

User = {

	key: 'user',

	/**
	* User set.
	* Recieves a data object.
	* @isLogin: true/false(default)
	* @username: String
	*/
	set: (data = {}) => {
		Storage.setLocal(User.key, data);
	},


	/**
	* Get user stored in storage.
	* No arg required. Default is 'user'.
	*/
	get: async () => {
		const user = await Storage.getLocal(User.key);
		return user;
	},
};