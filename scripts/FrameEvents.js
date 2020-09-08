$(document).ready(EventListeners.FrameReady);

$(document).on(`click`, `.popup-close`, EventListeners.popupClose);

$(document).on(`click`, `.chat-close`, EventListeners.chatClose);

$(document).on(`click`, `#ask-username .submit-button.signup a`, EventListeners.submitUsername);

$(document).on(`click`, `#ask-username .submit-button.login a`, EventListeners.userLogin);

$(document).on(`click`, `.online-users tr`, EventListeners.startChat);

$(document).on(`click`, `.user-logout`, EventListeners.userLogout);

$(document).on(`keyup`, `.user-chat .text-box .message`, EventListeners.sendMessage);

$(document).on(`click`, `.user-chat .text-box .message-send`, EventListeners.sendMessage);

$(document).on(`click`, `.create-new-room`, EventListeners.createRoom);

$(document).on(`click`, `.form-reset`, EventListeners.createRoomReset);

$(document).on(`click`, `.create-room-submit`, EventListeners.createRoomSubmit);

$(document).on(`click`, `.add-in-room i`, EventListeners.addUserToRoom);

$(document).on(`click`, `.tab .show-rooms`, EventListeners.showRooms);

$(document).on(`click`, `.tab .list-users`, EventListeners.listUsers);
