import { jest } from '@jest/globals';
import Emitter from './Emitter';

describe('Emitter', () => {
	let emitter;
	beforeEach(() => {
		emitter = new Emitter();
	});
	const eventName = 'testEvent';
	test('"on" method should add event listener', async () => {
		const fn1 = jest.fn().mockImplementation((a, b, c) => a + b + c);
		emitter.on(eventName, fn1);
		const fn2 = jest.fn().mockImplementation((a, b, c) => [a, b, c].join());
		emitter.on(eventName, fn2);
		const results1 = await emitter.emit(eventName, 'x', 'y', 'z');
		expect(fn1).toHaveBeenCalled();
		expect(fn2).toHaveBeenCalled();
		expect(results1).toEqual(['xyz', 'x,y,z']);
		const results2 = await emitter.emit(eventName, 1, 2, 3);
		expect(fn1).toHaveBeenCalledTimes(2);
		expect(fn1).toHaveBeenLastCalledWith(1, 2, 3);
		expect(fn2).toHaveBeenCalledTimes(2);
		expect(fn2).toHaveBeenLastCalledWith(1, 2, 3);
		expect(results2).toEqual([6, '1,2,3']);
	});
	test('"off" method should remove event listener', async () => {
		const fn = jest.fn();
		await emitter.on(eventName, fn).off(eventName, fn).emit(eventName);
		expect(fn).not.toHaveBeenCalled();
	});
	test('"off" does not affect other event listeners', async () => {
		const eventName1 = 'a';
		const fn1 = jest.fn();
		const eventName2 = 'b';
		const fn2 = jest.fn();

		// prettier-ignore
		emitter
			.on(eventName1, fn1)
			.on(eventName2, fn2)
			.off(eventName1, fn1);

		await emitter.emit(eventName1);
		await emitter.emit(eventName2);
		expect(fn1).not.toHaveBeenCalled();
		expect(fn2).toHaveBeenCalled();
	});
	test('"emit" method should catch exceptions and log them', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('Test Error'));
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		emitter.on(eventName, fn);
		await emitter.emit(eventName);
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
		consoleErrorSpy.mockRestore();
	});
	test('emitter handles synchronous and asynchronous listeners', async () => {
		const syncListener = jest.fn();
		const asyncListenerResult = 'Async Result';
		const asyncListener = jest.fn().mockResolvedValue(asyncListenerResult);
		const firstEventName = 'ev1';

		// prettier-ignore
		emitter
			.on(firstEventName, syncListener)
			.on(firstEventName, asyncListener);

		await emitter.emit(firstEventName);
		expect(syncListener).toHaveBeenCalled();
		expect(asyncListener).toHaveBeenCalled();
		const firstEventResults = await emitter.emit(firstEventName);
		expect(firstEventResults[1]).toEqual(asyncListenerResult);
		const secondEventName = 'ev2';
		const secondEventListener = jest.fn().mockResolvedValue({ a: 1, b: true });
		const thirdEventListener = jest.fn().mockResolvedValue({ lorem: 'ipsum' });
		emitter.on(secondEventName, secondEventListener).on(secondEventName, thirdEventListener);
		const secondEventResults = await emitter.emit(secondEventName);
		expect(secondEventListener).toHaveBeenCalled();
		expect(thirdEventListener).toHaveBeenCalled();
		expect(secondEventResults[0].a).toBe(1);
		expect(secondEventResults[0].b).toBe(true);
		expect(secondEventResults[1].lorem).toBe('ipsum');
	});
	test('constructor handles falsy arguments gracefully', () => {
		expect(() => new Emitter(0)).not.toThrow();
		expect(() => new Emitter(null)).not.toThrow();
		expect(() => new Emitter(false)).not.toThrow();
		expect(() => new Emitter(undefined)).not.toThrow();
	});
	test('constructor should set context if provided', async () => {
		const fn = function () {
			return this;
		};
		const emitterWithoutContext = new Emitter();
		emitterWithoutContext.on(eventName, fn);
		const result1 = await emitterWithoutContext.emit(eventName);
		expect(result1[0]).toBe(null);
		const context = { name: 'test' };
		const emitterWithContext = new Emitter(context);
		emitterWithContext.on(eventName, fn);
		const result2 = await emitterWithContext.emit(eventName);
		expect(result2[0]).toBe(context);
	});
	test('purge method clears all event listeners', async () => {
		const listener1 = jest.fn();
		const listener2 = jest.fn();
		await emitter.on(eventName, listener1).on(eventName, listener2).emit(eventName);
		emitter.purge();
		await emitter.emit(eventName);
		expect(listener1).toHaveBeenCalledTimes(1);
		expect(listener2).toHaveBeenCalledTimes(1);
	});
});
