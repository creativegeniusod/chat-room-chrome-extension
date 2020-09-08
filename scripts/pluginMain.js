/**
* Recieve messages in Content.
*/
chrome.runtime.onMessage.addListener(MessageListeners.Reciever);



/**
* Chat Room Modal close.
* Destroys the modal.
*/
$(document).on(`click`, `#chat-room-container #chatRoomModal .close`, EventListeners.showChatRoomClose);
