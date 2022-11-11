var Vote;

Vote = {

	key: `vote`,

	set: async (vote, domain) => {
		const votes = await Vote.getAll(Vote.key);
		const data = { vote: vote, voteTime: new Date() };
		if (votes === undefined) {
			Storage.setLocal(Vote.key, {
				[domain]: data
			});
			return;
		}
		votes[domain] = data;
		Storage.setLocal(Vote.key, votes);
	},

	get: async (domain) => {
		const votes = await Storage.getLocal(Vote.key);
		if (votes !== undefined && domain in votes) {
			return votes[domain];
		}
		return false;
	},

	getAll: async () => {
		return await Storage.getLocal(Vote.key);
	}
};