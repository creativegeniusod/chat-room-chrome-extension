var Remove;

Remove = {

	/**
	* submit username popoup action close button.
	*/
	removeIframe: () => {
		$(`#chat-room-frame-container`).remove();
		$(`.user-chat`).remove();
		Render.pageIcon();
	},


	removeChatIframe: (username) => {
		$(`#user-chat-frame-${username}`).remove();
	},


	RoomChatFrameWindow: (room_id) => {
		$(`#room-chat-${room_id}`).remove();
	},


	removeChatRoom: () => {
		$(`#chat-room-frame-container`).remove();
		// $(`.chat-room-open-icon`).show();

		return true;
	},


	removeEditProfile: () => {
		$(`#edit-user-frame`).remove();
		return true;
	}
};