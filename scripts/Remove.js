var Remove;

Remove = {

	/**
	* submit username popoup action close button.
	*/
	removeIframe: () => {
		$(`#chat-room-frame`).remove();
		$(`.user-chat`).remove();
	},


	removeChatIframe: (username) => {
		$(`#user-chat-frame-${username}`).remove();
	},
};