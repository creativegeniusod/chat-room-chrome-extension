$(document).ready(function() {

	/** get queryString Data **/
	const url = location.href;
	const data = url.split('?')[1].replace('data=', '');
	var user = JSON.parse(atob(data));

	if ('auth_source' in user && user.auth_source == 'tw') {
		const email = `${user.user.userName}@twitteruser.com`;
		const username = user.user.userName;
		user = {
			username: user.user.userName,
			email: email,
			name: user.user.userName
		};
		userLookup(email, username);
	} else {
		// fb user.
		User.set(user);
		chrome.runtime.sendMessage({action: `loginSuccessOpenChat`});
		window.close();
	}

});


/**
* User Lookup
*/
var userLookup, createUser, userFound, notFound;
userLookup = function(email, name) {

	const username = email.split('@')[0];

	const data = { username: username, email: email, name: name };
	$.ajax({
		url: `${db_app_url}api/v1/search/user`,
		// type: 'GET',
		type: 'POST',
		data: { username },
		success: function(result) {
			userFound(data);
		},
		error: function(err) {
			notFound(email, username, name);
		}
	});
};

createUser = function (email, username, name) {
	const data = {
		username: username,
		email: email,
		name: name
	};
	$.ajax({
		url: `${db_app_url}api/v1/user/create`,
		type: 'POST',
		data: data,
		success: function(result) {
			if (result.status) {
				User.set(data);
				swal('Yayyy', 'SignedUp Successfully', 'success');
				chrome.runtime.sendMessage({action: `loginSuccessOpenChat`});
				window.close();
			} else {
				swal('There is some error signing Up.', 'Please contact site admin', 'error');
				window.close();
			}
		},
		error: function(err) {
			console.log('error', err);
		}
	});
};

userFound = function(data) {
	User.set(data);
	swal({
		title: "User found. logging in.",
		icon: "success",
	})
	.then((ok) => {
		if (ok) {
			chrome.runtime.sendMessage({action: `loginSuccessOpenChat`});
			window.close();
		}
	});
}

notFound = function(email, username, name) {

	swal({
		title: "You are new to our site.",
		text: "Do you wish to Sign up with provided details.? Otherwise you won't be able to login.",
		icon: "warning",
		buttons: true,
		dangerMode: true,
	})
	.then((ok) => {
		if (ok) {
			createUser(email, username, name);
		} else {
			window.close();
		}
	});
};
