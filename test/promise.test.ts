import __Promise from "../src/promise";
import chai from "chai";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import { it, describe } from "mocha";

chai.use(sinonChai)
const expect = chai.expect

describe('promise', () => {
  it('promise exist', () => {
    expect(__Promise).instanceOf(Function)
  })
  it('argument must is function', () => {
    expect(__Promise).to.throw(TypeError)
  })
  it('callback has called', () => {
    const cb = sinon.fake()
    new Promise(cb)
    expect(cb).to.has.called
  })
  it('__Promise instantiate object have then function', () => {
    const p = new __Promise(() => { })
    expect(p.then).to.exist.and.instanceOf(Function)
  })

  it('2.2.1 onFulfilled 和 onRejected 都是可选的参数,如果不是函数,它必须被忽略', () => {
    const p = new __Promise((resolve: Function) => { resolve() })
    // @ts-ignore
    p.then(false, null)
    expect(1).to.eq(1)
  })

  it('2.2.2', (done) => {
    const cb = sinon.fake()

    const p = new __Promise((resolve: Function) => {
      expect(cb).to.not.has.called
      resolve(1)
      setTimeout(() => {
        expect(cb).to.has.calledOnce
        done()
      }, 0)
    })
    p.then(cb)

    const cb2 = (val: number) => {
      expect(val).to.eq(1)
    }
    p.then(cb2)
  })

  it('2.2.3', (done) => {
    const cb = sinon.fake()

    const p = new __Promise((resolve: Function, reject: Function) => {
      expect(cb).to.not.has.called
      reject('whoops')
      setTimeout(() => {
        expect(cb).to.has.calledOnce
        done()
      }, 0)
    })
    p.then(undefined, cb)

    const cb2 = (reason: string) => {
      expect(reason).to.eq('whoops')
    }
    p.then(undefined, cb2)
  })

  it('2.2.4', (done) => {
    const cb = sinon.fake()
    const p = new __Promise((resolve: Function) => { resolve() })
    p.then(cb)
    expect(cb).to.not.has.called
    setTimeout(() => {
      expect(cb).to.has.called
      done()
    })
  })

  it('2.2.5', () => {
    const cb = function (this: any) {
      expect(this).to.eq(undefined)
    }
    const p = new __Promise((resolve: Function) => {
      resolve();
    });
    p.then(cb);
  })

  it('2.2.6', (done) => {
    const cb1 = sinon.fake()
    const cb2 = sinon.fake()
    const cb3 = sinon.fake()
    const p = new __Promise((resolve: Function) => {
      resolve()
    })

    p.then(cb1)
    p.then(cb2)
    p.then(cb3)

    setTimeout(() => {
      expect(cb1).to.has.called
      expect(cb2).to.has.called
      expect(cb3).to.has.called
      expect(cb1).to.calledBefore(cb2)
      expect(cb2).to.calledBefore(cb3)
      done()
    })
  })

  it('2.2.7 then return promise', () => {
    const p = new __Promise((resolve: Function) => {
      resolve()
    })

    const result = p.then()
    expect(result).to.instanceOf(__Promise)
  })
})


