// TS 太难写了，改用 JS
let cache = []
function deepClone(source) {
  let result;
  if (source instanceof Object) {
    let cacheObj = findCache(source)
    if (cacheObj) {
      return cacheObj
    } else {
      result = new Object()
      if (source instanceof Array) {
        result = new Array
      } else if (source instanceof Function) {
        result = function () {
          return source.apply(this, arguments)
        }
      } else if(source instanceof Date){
        result = new Date(source)
      } else if(source instanceof RegExp){
        result = new RegExp(source.source, source.flags)
      }
      cache.push([source, result])
      for (const key in source) {
        if (Object.hasOwnProperty.call(source, key)) {
          result[key] = deepClone(source[key]);
        }
      }
    }
    cleanCache()
    return result;
  }
  // basic type
  return source
}

function findCache(source) {
  // 解决回环问题，若是source中有回环，那么未来必会有一步是
  // source[key] === source，满足这个条件就直接return
  // 上一次cache中存入的result，这样result的回环刚好是他自己
  for (let i = 0; i < cache.length; i++) {
    if (cache[i][0] === source) {
      return cache[i][1]
    }
  }
}

function cleanCache(){
  cache = []
}

module.exports = deepClone