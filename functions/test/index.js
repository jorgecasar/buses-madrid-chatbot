const fulfillment = require('../fulfillment');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;

let App = require ('../app');
const { MockResponse, MockRequest } = require('./utils/mocking');
process.env.DEBUG = 'actions-on-google:*';

describe('Fulfillment', () => {
	describe('function', () => {
		let sandbox, mockRequest, mockResponse;

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			mockResponse = new MockResponse();
			mockRequest = new MockRequest();
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('should export a function', () => {
			expect(fulfillment).to.be.a('function')
		});

		/*
		it('should create an app', () => {
			let spy = sandbox.stub(App, 'constructor');
			fulfillment(mockRequest, mockResponse);
			expect(spy.calledWithNew());
		});
		*/
	});
});

describe('Intents', () => {
	describe('input.welcome', () => {
		let handler = require('../app/intents/input.welcome');
		let sandbox, mockRequest, mockResponse;

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			mockResponse = new MockResponse();
			mockRequest = new MockRequest();
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('should export a function', () => {
			expect(handler).to.be.a('function');
		});
		it('should call ask', () => {
			const app = new App({request: mockRequest, response: mockResponse});
			sandbox.spy(app, 'ask');
			handler(app);
			let text = app.i18n.__('input.welcome.greeting', { appName: 'Test' });
			expect(app.ask.calledWith(text));
		})
	});

	describe('stop.bus-list', () => {
		/*
		let handler = require('../app/intents/stop.bus-list');
		it('should export a function', () => {
			expect(handler).to.be.a('function');
		});
		it('should call ask', () => {
			const app = new App({request: mockRequest, response: mockResponse});
			sandbox.spy(app, 'ask');
			handler(app);
			let text = app.i18n.__('input.welcome.greeting', { appName: 'Test' });
			expect(app.ask.calledWith(text));
		})
		*/
	});
})