<template>
<div class="Login">
    <slot name="welcomeMessage">
        <h2 class="Login__h2">¡Bienvenido!</h2>
        <h4 class="Login__h4">Inicia sesión:</h4>
    </slot>
    <input
        type="email"
        class="Login__input"
        v-model="email"
        placeholder="Email Address">
    <input
        type="password"
        class="Login__input"
        v-model="password"
        @keyup.enter="handleLogin()"
        placeholder="Password">
    <button class="Auth__button"
        @click="handleLogin()">
        <slot>Ingresar</slot>
    </button>
    <h5 class="Login__h5">{{ server.auth.message }}</h5>
    <slot name="isRegistered">
        <h4 class="Login__h4" @click="goToSignup">No estás registrado?</h4>
    </slot>
</div>
</template>

<script>
import './resetStyles.css'
import {
    mapActions,
    mapState,
    mapGetters
} from 'vuex'
import {
    UPDATE_USER_PROPS,
    TOGGLE_SIGNUP,
    TOGGLE_LOGIN
} from '@/auth/mutation-types'

export default {
    name: 'login-app',
    data () {
        return {}
    },
    computed: {
        ...mapState('users', ['user']),
        ...mapState('server', ['server']),
        ...mapGetters('users', ['auth']),

        email: {
            get () {
                return this.user.email
            },
            set (email) {
                this.$store.commit(`users/${UPDATE_USER_PROPS}`, {
                    type: 'email',
                    value: email
                })
            }
        },

        password: {
            get () {
                return this.user.credentials.password
            },
            set (password) {
                this.$store.commit(`users/${UPDATE_USER_PROPS}`, {
                    type: 'password',
                    value: password
                })
            }
        }
    },
    methods: {
        ...mapActions('users', ['loginUser']),

        handleLogin () {
            this.loginUser()
                .then((res) => {
                    this.$store.commit(`server/${TOGGLE_SIGNUP}`)
                    // this.$router.push('')
                })
                .catch(console.error)
        },

        goToSignup () {
            this.$store.commit(`server/${TOGGLE_SIGNUP}`)
        }
    }
}
</script>

<style scoped>
.Login {
    margin-top: 10rem;
    display: flex;
    padding: 1.4rem;
    flex-direction: column;
    justify-content: center;
    align-content: space-around;
    max-width: 37rem;
}

.Login input {
    width: 100%;
    padding: 1rem;
    margin: 1rem 0;
}

.Login .button {
    width: 100%;
    padding: 1rem;
    margin: 1rem 0;
    height: 4.6rem;
}

.Login h4 {
    cursor: pointer;
    z-index: 10000;
}

.Login h4:hover {
    color: #de8162;
}
</style>
