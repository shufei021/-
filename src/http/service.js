/**
 * 项目中所有的接口都写在此模块中，外部可以按需import引入。(不要全部引入)
 * import { getAdminList, postAdminUser } from '../../service/service.js'
 */

import Vue from 'vue'
import axios from 'axios'
import config from '@/config/config.js'
import qs from 'qs'
import { Message } from 'element-ui'

// 网络配置
Vue.prototype.$ajax = axios
axios.defaults.baseURL = config.ROOT_API_URL
axios.defaults.timeout = 40000

// Log开关
const logSwitch = true

// HttpType
const HTTP_TYPE = {
  GET: 0,
  POST: 1,
  PUT: 2,
  DELETE: 3,
  UPLOAD: 4
}

// 网络请求的总方法
const axiosService = (type, url, params) => {
  // axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
  axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';//都用这个请求头
  // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';//post请求单独用这个请求头
  // axios.defaults.headers.common['Content-Type'] = 'application/json'
  axios.defaults.headers.common['Authorization'] = window.localStorage.getItem('token')
  return new Promise((resolve, reject) => {
    switch (type) {
      case HTTP_TYPE.GET:
        axios.get(spliceApiUrl(url, params))
          .then(result => {
            successLog(params, result)
            resolve(result)
          })
          .catch(error => {
            errorLog(params, error)
            reject(error.response)
          })
        break
      case HTTP_TYPE.POST:
        axios.post(url, qs.stringify(params))
          .then(result => {
            successLog(params, result)
            resolve(result)
          })
          .catch(error => {
            errorLog(params, error)
            reject(error.response)
          })
        break
      case HTTP_TYPE.PUT:
        axios.put(url, qs.stringify(params))
          .then(result => {
            successLog(params, result)
            resolve(result)
          })
          .catch(error => {
            errorLog(params, error)
            reject(error.response)
          })
        break
      case HTTP_TYPE.DELETE:
        axios.delete(spliceApiUrl(url, params))
          .then(result => {
            successLog(params, result)
            resolve(result)
          })
          .catch(error => {
            errorLog(params, error)
            reject(error.response)
          })
        break
      case HTTP_TYPE.UPLOAD:
        {
          const config = { headers: { 'Content-Type': 'multipart/form-data' }}
          axios.post(url, params, config)
            .then(result => {
              successLog(params, result)
              resolve(result)
            })
            .catch(error => {
              errorLog(params, error)
              reject(error.response)
            })
        }
        break
    }
  })
}

// response截拦，403token过期跳转登录页
axios.interceptors.response
  .use(data => {
    if (data.data.retCode === '10002') {
      window.localStorage.clear()
      window.location.href = config.SELF_HOSTED_URI + '#/login'
      Message.error('登录已过期，请重新登录')
    }
    return data
  }, error => {
    if (error.request && error.request.readyState === 4 && error.request.status === 0) {
      // 超时
      Message.error('网络请求超时')
    } else if (error.response) {
      if (error.response.status === 10002) {
        window.localStorage.clear()
        window.location.href = config.SELF_HOSTED_URI + '#/login'
        Message.error('登录已过期，请重新登录')
      } else if (error.response.status === 500) {
        Message.error('服务器出错了，请稍后再试')
      } else {
        Message.error(error.response.data.retMsg)
        return Promise.reject(error)
      }
    }
  })

// GET方法拼接url参数
const spliceApiUrl = (apiUrl, params) => {
  let url = '?'
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      url += key + '=' + params[key] + '&'
    }
  }
  url = url.substring(0, url.length - 1)
  return apiUrl + url
}

// 请求成功的Log
const successLog = (params, result) => {
  if (logSwitch) {
    console.log('<----------- ↓↓↓ ----------->')
    console.log('Log-----type: ')
    console.log(result.config.method)
    console.log('Log------url: ')
    console.log(result.config.url)
    console.log('Log---params: ')
    console.log(params)
    console.log('Log---result: ')
    console.log(result)
    console.log('<----------- ↑↑↑ ----------->')
    console.log(' ')
  }
}

// 请求失败的Log
const errorLog = (params, error) => {
  if (logSwitch) {
    console.log('<----------- ↓↓↓ ----------->')
    console.log('Log-----type: ')
    if (error && error.response && error.response.config && error.response.config.method) console.log(error.response.config.method)
    console.log('Log------url: ')
    if (error && error.response && error.response.config && error.response.config.url) console.log(error.response.config.url)
    console.log('Log---params: ')
    console.log(params)
    console.log('Log---result: ')
    if (error && error.response) console.log(error.response)
    console.log('<----------- ↑↑↑ ----------->')
    console.log(' ')
  }
}

/**
 * 以下是对外暴露的属性
 */
export default{
  HTTP_TYPE,
  axiosService
}