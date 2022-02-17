import __Promise from "../src/promise";
import chai from "chai";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import { it, describe } from "mocha";

chai.use(sinonChai)
const expect = chai.expect

describe('promise basic', () => {
  it('__Promise 可以实例化对象，且参数必须是一个函数，这个函数会立即执行', () => {
    const callback = sinon.fake()
    const promise = new __Promise(callback)

    expect(callback).to.has.called
    expect(__Promise).to.throw(TypeError)
    expect(promise).to.exist
    expect(promise).to.instanceOf(__Promise)
    expect(promise.getState()).to.eq('pending')
  })

  it('promise 的状态可以改变，并且改变之后不可变', () => {
    const p1 = new __Promise((resolve: Function, reject: Function) => {
      resolve('success')
      reject('fail')
    })
    expect(p1.getState()).to.eq('fulfilled')
    expect(p1.getResult()).to.eq('success')

    const p2 = new __Promise((resolve: Function, reject: Function) => {
      reject('fail')
      resolve('success')
    })
    expect(p2.getState()).to.eq('rejected')
    expect(p2.getResult()).to.eq('fail')
  })
})

describe('promise.then', () => {
  it('2.2 promise 提供一个 then 方法来访问当前值，then 方法接受两个参数', () => {
    const promise = new __Promise(() => { })
    expect(promise.then.length).to.eq(2)
  })
  it('2.2.2 then 中的 onFulfilled 函数只执行一次', (done) => {
    const callback = sinon.fake()

    const promise = new __Promise((resolve: Function) => {
      resolve('success')
      resolve('again')

      setTimeout(() => {
        expect(callback).to.has.called
        expect(callback).to.calledWith('success')
        expect(callback).to.has.calledOnce
        done()
      }, 0)
    })

    // @ts-ignore
    promise.then(callback, {})
  })

  it('2.2.3 then 中的 onRejected 函数只执行一次', (done) => {
    const callback = sinon.fake()

    const promise = new __Promise((resolve: Function, reject: Function) => {
      reject('fail')
      reject('again')

      setTimeout(() => {
        expect(callback).to.has.called
        expect(callback).to.calledWith('fail')
        expect(callback).to.has.calledOnce
        done()
      }, 0)
    })

    // @ts-ignore
    promise.then(false, callback)
  })

  it('2.2.4 在执行上下文堆栈仅包含平台代码之前，不得调用 onFulfilled 或 onRejected', (done) => {
    const callback = sinon.fake()
    const promise = new __Promise((resolve: Function) => {
      resolve()
      for (let i = 0; i < 100; i++) {
        expect(callback).to.not.has.called
      }

      setTimeout(() => {
        expect(callback).to.has.called
        done()
      })
    })

    promise.then(callback)
  })

  it('2.2.5 必须将 onFulfilled 和 onRejected 作为函数调用（即没有 this 值）', () => {
    const callback = function (this: any, val: number) {
      expect(this === undefined)
      expect(val).to.eq(1)
    }

    const p1 = new __Promise((resolve: Function) => { resolve(1) })
    p1.then(callback)

    const p2 = new __Promise((resolve: Function, reject: Function) => { reject(1) })
    p2.then(undefined, callback)
  })

  it('2.2.6.1 then 可以在同一个 promise 上多次调用，且当 promise 处于 onFulfilled 状态时，且按照它们的顺序执行', (done) => {
    const cb1 = sinon.fake()
    const cb2 = sinon.fake()
    const cb3 = sinon.fake()

    const p1 = new __Promise((resolve: Function) => {
      resolve()
      setTimeout(() => {
        expect(cb1).to.has.called
        expect(cb2).to.has.called
        expect(cb3).to.has.called
        expect(cb1).to.calledBefore(cb2)
        expect(cb2).to.calledBefore(cb3)
        done()
      })
    })
    p1.then(cb1)
    p1.then(cb2)
    p1.then(cb3)
  })

  it('2.2.6.2 then 可以在同一个 promise 上多次调用，且当 promise 处于 onRejected 状态时，且按照它们的顺序执行', (done) => {
    const cb1 = sinon.fake()
    const cb2 = sinon.fake()
    const cb3 = sinon.fake()

    const p1 = new __Promise((resolve: Function) => {
      resolve()
      setTimeout(() => {
        expect(cb1).to.has.called
        expect(cb2).to.has.called
        expect(cb3).to.has.called
        expect(cb1).to.calledBefore(cb2)
        expect(cb2).to.calledBefore(cb3)
        done()
      })
    })
    p1.then(cb1)
    p1.then(cb2)
    p1.then(cb3)
  })

  it('2.2.7 then must return promise', () => {
    const promise = new __Promise((resolve: Function) => { resolve() })

    const result = promise.then()

    expect(result).to.instanceOf(__Promise)
  })

  it('2.2.7.1 如果 onFulfilled 或 onRejected 返回值 x，执行 Promise 解决步骤 [[Resolve]](promise2, x)', (done) => {
    const promise = new __Promise((resolve: Function) => resolve('success'))

    promise
      .then((result: string) => { return result })
      .then((result: string) => {
        expect(result).to.eq('success')
        done()
      })
  })


  it('2.3.2.1 如果 x 是一个 promise 且处于未处理状态，则 promise 必须保持未处理状态，直到 x 被处理或被拒绝。', (done) => {
    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const temp = new __Promise((resolve: Function) => {
      setTimeout(() => {
        resolve('success')
      })
    })
    let result = promise.then(() => {
      return temp
    })

    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq('success')
      done()
    }, 10)
  })

  it('2.3.2.2 如果/当 x 处于已处理状态时，用相同的值执行 promise', (done) => {
    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    let result = promise.then(() => {
      return new __Promise((resolve: Function) => {
        resolve('success')
      })
    })

    // 这里的setTimeout已经比resolve里的setTimout执行快了
    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq('success')
      done()
    })
  })

  it('2.3.2.3 如果/当 x 处于已拒绝状态时，以同样的理由拒绝 promise', (done) => {
    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    let result = promise.then(() => {
      return new __Promise((resolve: Function, reject: Function) => {
        reject('fail')
      })
    })

    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq('fail')
      done()
    })
  })

  it('2.3.3.2 如果在获取属性 x.then 的过程中导致抛出异常 e，则拒绝 promise 并用 e 作为拒绝原因', (done) => {
    const error = new Error(`can't get then!`)
    const temp = {}
    Object.defineProperty(temp, 'then', {
      configurable: true,
      enumerable: true,
      get(){
        throw error
      }
    })

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    let result = promise.then(() => temp)
    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq(error)
      done()
    })
  })

  xit('2.3.3.3 如果 then 是函数，则用 x 作为 this 调用该函数，并将 resolvePromise 作为函数第一个参数，rejectPromise 作为函数第二个参数，其中：')

  it('2.3.3.3.1 如果/当使用值 y 调用 resolvePromise 时，运行 [[Resolve]](promise, y)', (done) => {
    const temp = {
      then(resolve: Function, reject: Function) {
        resolve('test')
      }
    }

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const result = promise.then(() => temp)

    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq('test')
      done()
    })
  })

  it('2.3.3.3.2 如果/当使用 r 作为原因调用 rejectPromise 时，用 r 拒绝 promise', (done) => {
    const temp = {
      then(resolve: Function, reject: Function) {
        reject('test')
      }
    }

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const result = promise.then(() => temp)

    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq('test')
      done()
    })
  })

  it('2.3.3.3.3 如果同时调用 resolvePromise 和 rejectPromise，或者对同一个参数进行多次调用，则第一次调用优先，并且忽略任何后来的的调用', (done) => {
    const temp = {
      then(resolve: Function, reject: Function) {
        reject('test')
        resolve(1)
        reject(2)
        resolve(3)
      }
    }

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const result = promise.then(() => temp)

    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq('test')
      done()
    })
  })

  it('2.3.3.3.4.1 调用 then 时如果抛出异常，如果 resolvePromise 或 rejectPromise 已经被调用，忽略该异常。',(done) => {
    const temp = {
      then(resolve: Function, reject: Function) {
        resolve('test')
        throw new Error('whoops')
      }
    }

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const result = promise.then(() => temp)

    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq('test')
      done()
    })
  })

  it('2.3.3.3.4.2 否则，拒绝 promise 并以 e 作为拒绝原因。', (done) => {
    const error = new Error('whoops')
    const temp = {
      then(resolve: Function, reject: Function) {
        throw error
        reject('test')
      }
    }

    const promise = new __Promise((resolve: Function) => {
      resolve()
    })
    const result = promise.then(() => temp)

    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq(error)
      done()
    })
  })

  it('2.3.3.4 如果 then 不是函数，用 x 去执行 promise', (done) => {
    const temp = {name: 'z'}
    const promise = new __Promise((resolve: Function) => {
      resolve()
    })

    const result = promise.then(() => temp)
    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq(temp)
      done()
    })
  })

  it('2.2.7.2 如果 onFulfilled 或 onRejected 抛出异常 e, promise2 必须被拒绝，并把 e 作为被拒绝的原因', (done) => {
    const p1 = new __Promise((resolve: Function) => {
      resolve()
    })

    const p2 = new __Promise((resolve: Function, reject: Function) => {
      reject()
    })
    const error = new Error('whoops')

    const r1 = p1.then(() => {
      throw error
    })

    const r2 = p2.then(undefined, () => {throw error})

    setTimeout(() => {
      expect(r1.getState()).to.eq('rejected')
      expect(r1.getResult()).to.eq(error)
      expect(r2.getState()).to.eq('rejected')
      expect(r2.getResult()).to.eq(error)
      done()
    })
  })

  it('2.2.7.3 如果 then 的第一个参数不是函数，且 promise 处于完成状态，那么返回与promise一样结果的promise2', (done) => {
    const promise = new __Promise((resolve: Function) => {
      resolve('success')
    })

    // @ts-ignore
    const result = promise.then('test')

    setTimeout(() => {
      expect(result.getState()).to.eq('fulfilled')
      expect(result.getResult()).to.eq('success')
      done()
    })
  })

  it('2.2.7.4 如果 then 的第二个参数不是函数，且 promise 处于完成状态，那么返回与promise一样结果的promise2', (done) => {
    const promise = new __Promise((resolve: Function, reject: Function) => {
      reject('fail')
    })

    // @ts-ignore
    const result = promise.then('fulfilled','rejected')

    setTimeout(() => {
      expect(result.getState()).to.eq('rejected')
      expect(result.getResult()).to.eq('fail')
      done()
    })
  })
})