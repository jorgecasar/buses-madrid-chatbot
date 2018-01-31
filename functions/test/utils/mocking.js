'use strict';

const fakeTimeStamp = '2017-01-01T12:00:00';
const fakeSessionId = '0123456789101112';
const fakeIntentId = '1a2b3c4d-5e6f-7g8h-9i10-11j12k13l14m15n16o';
const fakeDialogflowBodyRequestId = '1a2b3c4d-5e6f-7g8h-9i10-11j12k13l14m15n16o';
const fakeUserId = 'user123'
const fakeUser = {
	"user_id": fakeUserId,
	"profile": {
		"display_name": "Sam",
		"given_name": "Sam",
		"family_name": "Johnson"
	},
 "access_token": "..."
};

const fakeDevice = {
	"location": {
		"coordinates": {
			"latitude": 123.456,
			"longitude": -123.456
		},
		"formatted_address": "1234 Random Road, Anytown, CA 12345, United States",
		"zip_code": "12345",
		"city": "Anytown"
	}
};
const fakeConversationId = '0123456789';

const headerV1 = {
	'Content-Type': 'application/json',
	'google-assistant-api-version': 'v1'
};

const headerV2 = {
	'Content-Type': 'application/json',
	'Google-Actions-API-Version': '2'
};

const MockRequest = class {
	constructor(lang = 'es-ES', version = 'v1') {
		this.headers = version === 'v1' ? headerV1 : headerV2;
		this.lang = lang;
		this.result = {};
		this.userId = fakeUserId;
		this.device = fakeDevice;
		this.user = {};
	}

	get body() {
		return {
			"lang": this.lang,
			"id": fakeDialogflowBodyRequestId,
			"timestamp": fakeTimeStamp,
			"result": this.result,
			"originalRequest": {
				"data": {
					"user": {
						"user_id": this.userId,
						"locale": this.lang
					},
					"device": this.device
				}
			},
			"status": {
				"code": 200,
				"errorType": "success"
			},
			"sessionId": fakeSessionId
		}
	}

	get(header) {
    return this.headers[header];
  }

	withLang(lang) {
		this.lang = lang;
		return this;
	}

	withResult(result) {
		this.result = result;
		return this;
	}
};

const MockResponse = class {
	constructor () {
		this.statusCode = 200;
		this.headers = {};
	}

	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}

	send(body) {
		this.body = body;
		return this;
	}

	append(header, value) {
		this.headers[header] = value;
		return this;
	}
};


module.exports = {
	MockRequest,
	MockResponse
};