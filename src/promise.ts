class __Promise {
  private state: string = 'pending'
  private result: any = undefined;
  private resolveCallbacks: Array<any> = []
  private rejectCallbacks: Array<any> = []
  private prepare: any

  private resolve = (value?: any) => {
    if (this.state !== 'pending') return
    this.state = 'fulfilled'
    this.result = value

    // 提高异步优先级
    process.nextTick(() => {
      this.resolveCallbacks.forEach(callback => {
        if (callback instanceof Function) {
          let x: any
          try {
            x = callback.call(undefined, this.result)
          } catch (e) {
            this.prepare.reject(e)
          }
          this.prepare.resolveWith(x)
        } else {
          this.prepare.resolve(this.result)
        }
      })
    })
  }

  private reject = (reason?: any) => {
    if (this.state !== 'pending') return
    this.state = 'rejected'
    this.result = reason

    process.nextTick(() => {
      this.rejectCallbacks.forEach(callback => {
        if (callback instanceof Function) {
          let x: any
          try {
            x = callback.call(undefined, this.result)
          } catch (e) {
            this.prepare.reject(e)
          }
          this.prepare.resolveWith(x)
        } else {
          this.prepare.reject(this.result)
        }
      })
    })
  }

  constructor(executor: Function) {
    if (!(executor instanceof Function)) {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }
    executor(this.resolve, this.reject)
  }

  then(onFulfilled?: Function, onRejected?: Function) {
    this.resolveCallbacks.push(onFulfilled)
    this.rejectCallbacks.push(onRejected)
    this.prepare = new __Promise(() => { })
    return this.prepare
  }

  resolveWith(x: any) {
    // 2.3.1
    if (x === this) {
      return this.reject(new TypeError())
    }
    // 2.3.2
    if (x instanceof __Promise) {
      x.then(
        (result: any) => { this.resolve(result) },
        (reason: any) => { this.reject(reason) }
      )
      return
    }

    // 2.3.3
    if (x instanceof Object) {
      let then: any
      try {
        then = x.then
      } catch (e) {
        this.reject(e)
      }
      if (then instanceof Function) {
        try {
          then.call(
            this,
            (y: any) => { this.resolveWith(y) },
            (r: any) => { this.reject(r) }
          )
        } catch (error) {
          this.reject(error)
        }
      } else {
        this.resolve(x)
      }
    } else {
      this.resolve(x)
    }
  }

  getState() {
    return this.state
  }

  getResult() {
    return this.result
  }

}

export default __Promise