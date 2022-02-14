const deepClone = require('../src/deepClone')
const mocha = require('mocha')
const chai = require('chai')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
const expect = chai.expect
const { describe, it } = mocha

describe('deepClone', () => {
  it('clone basic type', () => {
    const types = [1, "1", true, undefined, null]
    types.forEach(type => {
      const result = deepClone(type)
      expect(result).to.eq(type)
    })
  })

  it('clone Object type', () => {
    const source = { name: "s" }
    source.self = source
    const result = deepClone(source)
    expect(result).to.not.eq(source)
    expect(result.name).to.eq(source.name)
    expect(result.self).to.not.eq(source.self)
  })

  it('clone Array type', () => {
    const s = { name: "s" }
    s.self = s
    const source = [1, [1, 2], s]
    const result = deepClone(source)
    expect(result).to.not.eq(source)
    expect(result[0]).to.eq(source[0])
    expect(result[1]).to.not.eq(source[1])
    expect(result[1][0]).to.eq(source[1][0])
    expect(result[2]).to.not.eq(source[2])
    expect(result[2].name).to.eq(source[2].name)
    expect(result[2].self).to.not.eq(source[2].self)
  })

  it('clone Function type', () => {
    function source(x, y) {
      return x + y
    }
    source.user = { name: "z" }
    const result = deepClone(source)
    expect(result(1, 2)).to.eq(source(1, 2))
    expect(result.user).to.not.eq(source.user)
    expect(result.user.name).to.eq(source.user.name)
  })

  it('clone Date type', () => {
    const source = new Date()
    source.user = {name: "z"}
    const result = deepClone(source)
    expect(result).to.not.eq(source)
    expect(result.toString()).to.eq(source.toString())
    expect(result.user).to.not.eq(source.user)
    expect(result.user.name).to.eq(source.user.name)
  })

  it('clone RegExp type', () => {
    const source = new RegExp("hi\\d+", "gi")
    source.user = {name: "z"}
    const result = deepClone(source)
    expect(result).to.not.eq(source)
    expect(result.source).to.eq(source.source)
    expect(result.flags).to.eq(source.flags)
    expect(result.user).to.not.eq(source.user)
    expect(result.user.name).to.eq(source.user.name)
  })
})