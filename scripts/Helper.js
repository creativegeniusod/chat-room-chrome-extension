var Helper;

Helper = {

	/**
	* Find diff in two arrays
	*/
	arrayDiff: (a, b) => {
		
		if (a !== undefined) {
			const diff = Array();
			const joined = a.concat(b);
			for( i = 0; i <= joined.length; i++ ) {
				var current = joined[i];
				if( joined.indexOf(current) == joined.lastIndexOf(current) ) {
					if (current !== undefined) {
						diff.push(current);
					}
				}
			}
			return diff;
		}
		return b;
	},


	/**
	* Find diff in second array
	*/
	checkNewElementsInSecondArray: (a, b) => {
		if (a !== undefined) {
			const diff = Array();
			for (var i = 0; i < b.length; i++) {
				if (a.indexOf(b[i]) == -1) {
					diff.push(b[i]);
				}
			}
			return diff;
		}
		return b;
	},


	/**
	* Convert URL params to javascript object.
	*/
	urlParamsToObj: (url) => {
		const search = url.substring(1);
		if (search !== "") {
			return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		}
		return {};
	},



	/**
	* User-id encoded.
	*/
	usernameEncode: (username) => {
		return btoa(username);
	},


	
	identifyMessage: (channel_id) => {
		const a = atob(channel_id);
		const r = a.split('-');
		
		return {
			from: r[0],
			to: r[2]
		};
	},


	/**
	* Extract domain only from page URL.
	*/
	extractDomain: (url) => {
		if (url !== undefined || url != "") {
			return url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
		}
		return url;
	},


	/**
	* Remove Query String from Page URL.
	*/
	removeQueryString: (url) => {
		if (url !== undefined) {
			return url.split('?')[0];
		}
		return url;
	},


	/**
	* Get site room id.
	*/
	getSiteRoomId: () => {
		const domain = Helper.extractDomain(location.href).replace(/\./g, "__");
		return domain;
	},



	/**
	* Check if opened room is site page room.
	* return true/false.
	*/
	isSiteRoom: (room_id) => {

		if ( room_id == Helper.extractDomain(window.page).replace(/\./g, '__') ) return true;
		return false;
	},


	isPageRoom: (room_id) => {
		
		if ( room_id == Room.generateUniquePageRoomIdFromURL(window.page) ) return true;
		return false;
	},


	fixMessageKeys: (message) => {
		var m = {
			'time_of_message': 'sent_time' in message ? message.sent_time : message.time_of_message,
			'from': 'message_from' in message ? message.message_from : message.from,
			'message': message.message,
		};
		return m;
	},


	extractDomainWithScheme: (url) => {
		return `${url.split('://')[0]}://${url.split('://')[1].split('/')[0]}`;
	},


	newMessageWithinOneMinute: (new_message_time, last_message_time) => {
		if (last_message_time === undefined) return false;
		
		const time1 = new Date(new_message_time);
		const time2 = new Date(last_message_time);
		if ((time1 - time2) < 60000) if (time1.getMinutes() - time2.getMinutes() == 0) return true;
		return false;
	},
};