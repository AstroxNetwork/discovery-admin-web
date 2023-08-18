import axios from 'axios'
import { PATH } from './path'

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/' : 'https://optest.astrox.app/oper-admin'
})

instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

export const queryNetworkList = data => {
  console.log(PATH)
  return instance({
    data,
    url: PATH.NETWORK.QUERY,
    method: 'post',
    headers: {
      contentType: 'application/json;charset=UTF-8'
    }
  })
}
