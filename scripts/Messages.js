var Messages;

Messages = {
	
	// key = messages
	// key : messages
	key: 'messages',

	setInit: () => {

		Storage.setLocal(Messages.key, {});
	},


	get: async () => {

		return await Storage.getLocal(Messages.key);
	},

	getChannelMessages: async (channelId) => {

		var messages = await Messages.get();
		if (messages !== undefined && channelId in messages) {

			var ret_msg = Array();
			var duplicate = Array();
			const ms = messages[channelId];
			
			for (var i=0; i < ms.length; i++) {
				const msg = btoa(ms[i].message);
				if (duplicate.indexOf(msg) == -1) ret_msg.push(ms[i]);
				duplicate.push(msg);
			}
			return ret_msg;
		}
		return false;
	},

	set: async (message) => {
		
		const code = message.channelId;
		var messages = await Messages.get();
		
		if (messages instanceof Array === false) {
			if (Object.keys(messages).length == 0) messages[code] = Array(message);
			else if ( code in messages ) messages[code].push(message);
			else messages[code] = Array(message);
		} else messages[code] = Array(message);
		Storage.setLocal(Messages.key, messages);
	},


	removeAll: () => {
		Messages.setInit();
	},


	removeChannelMessages: async (channelId) => {
		
		var messages = await Messages.get();
		if (messages !== undefined && channelId in messages) {
			delete messages[channelId];
		}
	},
	
}