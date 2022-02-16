class __Promise {
  private state: String = 'pending'
  private value: any = null
  private reason: any = null
  private callbacks: Array<Array<Function>> = [];
  private self = this

  private resolve = (value?: any) => {
    this.state = 'fufilled'
    this.value = value
    setTimeout(() => {
      this.callbacks.forEach(handler => {
        handler[0] && handler[0].call(undefined, this.value)
      })
    }, 0)
  }

  private reject = (reason?: any) => {
    this.state = 'rejected'
    this.reason = reason
    setTimeout(() => {
      this.callbacks.forEach(handler => {
        handler[1] && handler[1].call(undefined, this.reason)
      })
    })
  }

  constructor(cb: Function) {
    if (!(cb instanceof Function)) {
      throw new TypeError(`${cb} is not a function`)
    }
    cb(this.resolve, this.reject)
  }

  then(onFufilled?: Function, onRejcted?: Function) {
    let handler: Array<Function> = []
    if (onFufilled instanceof Function) {
      handler[0] = onFufilled
    }
    if (onRejcted instanceof Function) {
      handler[1] = onRejcted
    }
    this.callbacks.push(handler)
    return this.self
  }
}

export default __Promise