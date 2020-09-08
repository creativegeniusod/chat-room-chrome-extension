var Request;

Request = {

	get: async (url) => {
		return await $.ajax({
			url: url,
			type: `GET`,
			headers: {},
		});
	},

	post: async (url, data={}) => {
		return await $.ajax({
			url: url,
			type: `POST`,
			headers: {},
			data: data
		});
	},
};