interface Callback {
	(data?: unknown): void
}

interface Cache {
	[eventName: string]: Array<Callback>
}
export default class EventHub {
	private cache: Cache = {};
	constructor() { }

	on(eventName: string, callback: Callback) {
		this.cache[eventName] = this.cache[eventName] || []
		this.cache[eventName].push(callback)
	}

	emit(eventName: string, data?: unknown) {
		if (!this.cache[eventName]) {
			return
		}
		this.cache[eventName].forEach(fn => fn(data))
	}

	off(eventName: string, callback: Callback) {
		const cbList = this.cache[eventName]
		const index = cbList.indexOf(callback)
		if (index >= 0) {
			cbList.splice(index, 1)
		}
	}
}