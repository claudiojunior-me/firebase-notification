const USER_EMAIL = 'teste@gmail.com';
const USER_REDE = 'rede-nova';

// Initialize Firebase
const config = {
	apiKey: 'AIzaSyAmqu04lGj1pRrgFTQ8JPpleHRQen-LTNE',
	authDomain: 'minha-gasosa-d1e3c.firebaseapp.com',
	databaseURL: 'https://minha-gasosa-d1e3c.firebaseio.com',
	projectId: 'minha-gasosa-d1e3c',
	storageBucket: 'minha-gasosa-d1e3c.appspot.com',
	messagingSenderId: '987264355951',
};
firebase.initializeApp(config);

const messaging = firebase.messaging();
messaging.usePublicVapidKey('BCpjlWGQxOkuuDdwFgquuRcsOPo8cHsjiSgl5BAksXIOb0loQcNh_EuUAoyMHHb5pG02IR3jlrDpDyj7sqCluuQ');

function getNotificationPermission() {
	messaging
		.requestPermission()
		.then(function() {
			return;
		})
		.catch(function(err) {
			console.error('Unable to get permission to notify.', err);
			throw err;
		});
}

function getDeviceToken() {
	messaging
		.getToken()
		.then(function(currentToken) {
			debugger;
			if (currentToken) {
				return currentToken;
			} else {
				// Show permission request.
				throw 'No Instance ID token available. Request permission to generate one.';
			}
		})
		.catch(function(err) {
			console.log('An error occurred while retrieving token. ', err.message);
			throw err.message;
		});
}

function getCookieUserData() {
	return {
		user: USER_EMAIL,
		rede: USER_REDE,
		// user: getCookie('user'),
		// rede: getCookie('rede'),
	};
}

function getCookie(cname) {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');

	for (let valueIndex = 0; valueIndex < ca.length; valueIndex++) {
		let c = ca[valueIndex];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}

	return '';
}

function sendTokenToServer(userEmail, userRede, deviceToken) {
	debugger;
	const db = firebase.firestore();

	db.collection('users')
		.add({
			user: userEmail,
			deviceToken: deviceToken,
			rede: userRede,
		})
		.then((res) => {
			return;
		})
		.catch((err) => {
			throw err.message;
		});
}

function verifyIfUserExists(userEmail, userRede) {
	
}

async function init() {
	try {
		await messaging.requestPermission();
		const deviceToken = await messaging.getToken();
		const { user, rede } = await getCookieUserData();

		sendTokenToServer(user, rede, deviceToken);
	} catch (err) {
		console.error(err);
	}
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
	init();
} else {
	console.warn('Mensagem PUSH não é suportado');
}
