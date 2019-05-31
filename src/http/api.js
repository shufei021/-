import  request  from './service.js'

//所有api都放在这里
export const login = params => {
    return request.axiosService(1, '/api-login/', {type:params})
}