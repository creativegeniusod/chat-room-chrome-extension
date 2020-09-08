var Storage;

Storage = {

	/**
	* Chrome LocalStorage set.
	*/
	setLocal: (key, value) => {		
		chrome.storage.local.set( {[key]: JSON.stringify(value)} );
	},
	

	/**
	* Chrome LocalStorage get.
	*/
	getLocal: async (key) => {
		return new Promise(function(resolve, reject) {
			chrome.storage.local.get(key, (res) => {
				const response = res[key];
				if (response !== undefined) {
					const jsonResponse = JSON.parse(response);
					resolve(jsonResponse);
					return;
				}
				resolve(response);
			});
		});		
	},


	/**
	* Chrome LocalStorage remove key.
	*/
	removeLocal: (key) => {
		chrome.storage.local.remove(key);
	}
};