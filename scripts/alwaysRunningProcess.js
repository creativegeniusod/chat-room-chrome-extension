/**
* Function Declarations.
*/
var pageIconClicked;
var checkUserExist;
var OpenAfterLogin;
var closeLauncherFromPages;
var launcherAwake;
var openSettingsPage;
var checkAndCreateSiteRoom;
var checkAndCreatePageRoom;



/**
* Extension onInstalled Event.
*/
chrome.runtime.onInstalled.addListener(Listeners.onInstalled);


/**
* Extension icon clicked.
*/
chrome.browserAction.onClicked.addListener(Listeners.onExtensionIconClicked);


/**
* Recieve messages in Extension Background.
*/
Runtime.onMessage.addListener(Listeners.onMessage);



/**
* Remove rooms from Extension. when its launched.
*/
chrome.windows.onCreated.addListener(Listeners.onWindowCreated);


/**
* Alarm Listener.
*/
chrome.alarms.onAlarm.addListener(Listeners.onAlarmNotification);



/**
* Context Menu.
*/
chrome.contextMenus.create({ title: 'Afrometa - Settings', contexts: ['page'], onclick: openSettingsPage });

