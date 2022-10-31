// const server = `local`;
var app_url, socket_url, db_app_url;

var access_token_url;
var call_urls;

call_urls = async () => {
	const server = await ExtensionMode.get();
	console.log(server)
	if (server == `local`) {

		app_url = `http://127.0.0.1:3000/`;
		socket_url = `http://127.0.0.1:3000/`;
		db_app_url = `http://127.0.0.1:8000/`;
	} else if (server == `special_case`) {

		app_url = `https://www.afrometa.io/`;
		socket_url = `https://www.afrometa.io/`;
		db_app_url = `http://127.0.0.1:8000/`;
	} else {

		app_url = `https://www.afrometa.io/`;
		socket_url = `https://www.afrometa.io/`;
		db_app_url = `https://api.afrometa.co/`;
	}
};
call_urls();


/**
* Different Icons for Plugin Launcher.
*/

// Default Launcher Icon.
const defaultIcon = `${chrome.runtime.getURL('images/fill-a.png')}`;

// icon with chat history = IconWch
const IconWch = `${chrome.runtime.getURL('images/chat_history.png')}`;

// icon with site has any online users = IconWou
const IconWou = `${chrome.runtime.getURL('images/active_users.png')}`;

// icon with chat hisotry and active users = IconWchnAu
const IconWchnAu = `${chrome.runtime.getURL('images/active_users_chat_history.png')}`;


// Some useful icons.
const voteUp = `${chrome.runtime.getURL('images/vote-up2.png')}`;
const voteDown = `${chrome.runtime.getURL('images/vote-down2.png')}`;
const chatIcon = `${chrome.runtime.getURL('images/chat_icon.png')}`;
