'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotificationForUsers = functions.firestore.document('redes/{originRede}/notifications/{notification}').onWrite(async (change, context) => {
	const newDataRegister = change.after.data();
	const originRede = context.params.originRede;
	const userDestination = newDataRegister.userDestination;

	console.log(`[NOTIFICATION] Data: ${newDataRegister}`);
	const getDeviceTokenPromise = admin
		.firestore()
		.collection('users')
		.where('rede', '==', originRede)
		.where('user', '==', userDestination)
		.get();

	console.log(`[NOTIFICATION] Enviando notificação para: ${userDestination} da rede: ${originRede}`);

	let tokens = [];

	const results = await Promise.all([getDeviceTokenPromise]);
	results[0].forEach((childSnapshot) => {
		const childKey = childSnapshot.id;
		const childData = childSnapshot.data();
		tokens.push(childData.deviceToken);
	});

	const payload = {
		notification: {
			title: newDataRegister.messageTitle,
			body: newDataRegister.messageBody,
		},
	};

	const response = await admin.messaging().sendToDevice(tokens, payload);
	return response;
});

exports.sendNotificationByPost = functions.https.onRequest((req, res) => {
	const msgTo = req.body.to || '';
	const msgTitle = req.body.title || '';
	const msgBody = req.body.message || '';
	const originRede = (req.body.rede).toString().replace(/\s+/g, '-').toLowerCase();

	if (!originRede) {
		return res.status(200).send("{'status': false, 'message': 'Nome da rede não encontrado, favor informe a rede'}");
	}

	if (!msgTo) {
		return res.status(200).send("{'status': false, 'message': 'Usuário destinatário não informado.'}");
	}

	if (!msgTitle) {
		return res.status(200).send("{'status': false, 'message': 'Titulo da notificação não informado.'}");
	}

	if (!msgBody) {
		return res.status(200).send("{'status': false, 'message': 'Texto da notificação não informado.'}");
	}

	return admin
		.firestore()
		.collection('redes')
		.doc(originRede)
		.collection('notifications')
		.add({
			dateCreated: new Date(),
			userDestination: msgTo,
			messageTitle: msgTitle,
			messageBody: msgBody,
		})
		.then((snapshot) => {
			return res.status(200).send("{'status': true}");
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
			return res.status(418).send(`{'status': false, 'message': ${error}}`);
		});
});
