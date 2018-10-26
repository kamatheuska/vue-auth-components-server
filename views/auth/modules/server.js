import axios from 'axios'

import {
    CHANGE_SERVER_AUTH_STATUS,
    SET_SERVER_AUTH_MESSAGE,
    CHANGE_SERVER_REGISTRATION_STATUS,
    TOGGLE_LOGIN,
    TOGGLE_SIGNUP,
    SET_SERVER_REGISTRATION_MESSAGE
} from '@/auth/mutation-types'

const state = {
    server: {
        auth: {
            status: 0,
            message: ''
        },
        register: {
            status: 0,
            message: ''
        }
    },
    showLogin: false,
    showSignup: false
}

const getters = {

}

const mutations = {
    [CHANGE_SERVER_AUTH_STATUS] ({ server }, status) {
        server.auth.status = status
    },
    [SET_SERVER_AUTH_MESSAGE] ({ server }, message) {
        server.auth.message = message
    },
    [CHANGE_SERVER_REGISTRATION_STATUS] ({ server }, status) {
        server.register.status = status
    },
    [SET_SERVER_REGISTRATION_MESSAGE] ({ server }, message) {
        console.log('---->>  logging...\n', message)
        server.register.message = message
    },
    [TOGGLE_LOGIN] (state) {
        state.showSignup = false
        state.showLogin = !state.showLogin
    },

    [TOGGLE_SIGNUP] (state) {
        state.showLogin = false
        state.showSignup = !state.showSignup
    }
}

const actions = {
    requestApi (state, { service, payload }) {
        axios.defaults.headers.common['x-auth'] = localStorage.getItem('user-token')
        switch (service) {
            case 'login':
                return axios.create()
                    .post('/users/login', payload)

            case 'signup':
                return axios.create()
                    .post('/users', payload)

            case 'logout':
                return axios.create()
                    .delete('/users/me/token', {
                        headers: {
                            'x-auth': payload
                        }
                    })

            case 'userData':
                return axios.create()
                    .get('/users/me', {
                        headers: {
                            'x-auth': payload
                        }
                    })
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
