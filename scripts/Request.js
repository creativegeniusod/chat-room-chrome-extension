var Request;

Request = {

	get: async (url, headers={}) => {
		return await $.ajax({
			url: url,
			type: `GET`,
			headers: headers,
		});
	},

	post: async (url, data={}, headers={}) => {
		return await $.ajax({
			url: url,
			type: `POST`,
			headers: headers,
			data: data
		});
	},
};