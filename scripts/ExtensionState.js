var State, LauncherState, LauncherHideDuration, ExtensionMode;

State = {

	key: `open_on_navigate`,


	/**
	* Set tab_id.
	*/
	set: async (data) => {
		const stored = await State.get(State.key);

		var a = {};
		if (stored !== undefined && Object.keys(stored).length > 0) a = stored;

		a[data.tab] = data;
		Storage.setLocal(State.key, a);
		console.log('new stored: ', a);
	},


	/**
	* Get all values.
	*/
	get: async () => {
		return await Storage.getLocal(State.key);
	},


	/**
	* Get specific id value.
	*/
	getItem: async (tab_id) => {
		const x = await State.get();
		if ( x !== undefined && tab_id in x) {
			return x[tab_id];
		}
		return false;
	},


	/**
	* remove all values of this specific keyfrom storage.
	*/
	remove: () => {
		Storage.removeLocal(State.key);
	},


	/**
	* remove a particular item from.
	*/
	clearTabState: async (tab_id) => {
		const x = await Storage.getLocal(State.key);
		delete x[tab_id];

		Storage.setLocal(State.key, x);
		return true;
	},
};



/**
* Adjust Launcher Hide/Show state.
*/
LauncherState = {

	key: 'launcherIcon',

	hide: () => {
		Storage.setLocal(LauncherState.key, { state: false, turnedOffAt: Date.now() });
	},

	default: () => {
		Storage.setLocal(LauncherState.key, { state: true, turnedOffAt: null });
	},

	get: async () => {
		return await Storage.getLocal(LauncherState.key);
	},
};



/**
* Adjust launcher hide duration.
*/
LauncherHideDuration = {
	key: 'launcherHideDuration',

	set: (duration = 60) => {
		Storage.setLocal(LauncherHideDuration.key, duration);
	},

	get: async () => {
		return await Storage.getLocal(LauncherHideDuration.key);
	},
};



/**
* Extension Mode.
*/
ExtensionMode = {
	key: 'extensionMode',

	set: (mode='server') => {
		Storage.setLocal(ExtensionMode.key, mode);
	},

	get: async () => {
		return await Storage.getLocal(ExtensionMode.key);
	},
};