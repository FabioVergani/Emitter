import LazyStoresCollection from './LazyStoresCollection.mjs';

const { Promise, console } = globalThis;

export default class Emitter {
	#context;
	#collection;
	constructor(context) {
		const e = this;
		e.#context = context || null;
		e.#collection = new LazyStoresCollection();
		return e;
	}
	on(eventName, fn) {
		const e = this;
		fn && e.#collection[eventName].add(fn);
		return e;
	}
	off(eventName, fn) {
		const e = this;
		e.#collection[eventName][fn ? 'delete' : 'clear'](fn);
		return e;
	}
	purge() {
		const e = this;
		e.#collection.clear();
		return e;
	}
	async emit(eventName, ...args) {
		// prettier-ignore
		const e = this, ctx = e.#context, results = [];
		for (const fn of e.#collection[eventName]) {
			try {
				const result = await Promise.resolve(fn.apply(ctx, args));
				results.push(result);
			} catch (exception) {
				console.error(exception);
			}
		}
		return results;
	}
}
