$(document).ready(EventListeners.FrameReady);

$(document).on(`click`, `.popup-close`, EventListeners.popupClose);

$(document).on(`click`, `.chat-close`, EventListeners.chatClose);

$(document).on(`click`, `.room-chat-close`, EventListeners.roomChatClose);

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

$(document).on(`click`, `#tabs .show-rooms`, EventListeners.showRooms);

$(document).on(`click`, `#room-list .room-row`, EventListeners.openRoomChat);

$(document).on(`keyup`, `.room-chat .text-box .message`, EventListeners.sendMessageToRoom);

$(document).on(`click`, `.room-chat .text-box .message-send`, EventListeners.sendMessageToRoom);

$(document).on(`click`, `.add-more-users-to-room i`, EventListeners.addMoreUsers);

$(document).on(`click`, `.cancel-add-more-users`, EventListeners.cancelAddMoreUsers);

$(document).on(`click`, `.update-room`, EventListeners.updateRoom);

$(document).on(`click`, `.add-more-to-room i`, EventListeners.addMoreToRoom);

$(document).on(`click`, `.left-side-icons .icon-show-chat-rooms`, EventListeners.showRoomsA);

$(document).on(`click`, `.left-side-icons .icon-chat-tab`, EventListeners.showChatTab);

$(document).on(`click`, `.right-side-icons .edit-profile`, EventListeners.openEditProfileView);

$(document).on(`click`, `.edit-profile-body .save-changes`, EventListeners.editProfileSaveChanges);

$(document).on(`click`, `.edit-profile-body .cancel`, EventListeners.editProfileWindowGoBack);

$(document).on(`click`, `#edit-profile-window-back`, EventListeners.editProfileWindowGoBack);

$(document).on('click', `.nav#tabs a`, EventListeners.tabsClick);

$(document).on('click', `.nav#online-users-tabs a`, EventListeners.subTabsClick);

$(document).on(`click`, `.online-users-same-site tr`, EventListeners.startChat);

$(document).on(`click`, `.online-users-same-page tr`, EventListeners.startChat);

$(document).on(`click`, `.user-chat .chat-close`, EventListeners.chatCloseNew);

$(document).on(`click`, `#fb-login`, EventListeners.fbLogin);

$(document).on(`click`, `#tw-login`, EventListeners.twLogin);

$(document).on(`click`, `#mm-login`, EventListeners.mmLogin);

$(document).on(`click`, `#wc-login`, EventListeners.wcLogin);

$(document).on(`click`, `.room-chat .sub-nav-bar button`, EventListeners.roomChatCloseOne);

$(document).on(`click`, `.top-bar.left-side-icons a`, EventListeners.iconClick);

$(document).on(`click`, `.right-side-icons .refresh`, EventListeners.frameRefresh);

$(document).on(`click`, `.room-chat .header div.can-be-link`, EventListeners.openRoomPageUrl);