import { describe, it } from 'mocha'
import chai from 'chai'
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import EventHub from "../src/eventhub";

chai.use(sinonChai)
const expect = chai.expect

describe("EventHub", () => {
  it('EventHub can instantiate', () => {
    const eventhub = new EventHub();
    expect(eventhub).to.exist
  })

  it('callback has called', () => {
    const eventhub = new EventHub();
    const callback = sinon.fake()
    eventhub.on('xxx', callback)
    eventhub.emit('xxx', 1)
    expect(callback).to.have.been.called
    expect(callback).to.have.calledWith(1)
  })

  it("callback can cancel", () => {
    const eventhub = new EventHub();
    const callback = sinon.fake()
    eventhub.on('xxx', callback)
    eventhub.off('xxx', callback)
    eventhub.emit('xxx', 1)
    expect(callback).to.not.have.been.called
  })
})
