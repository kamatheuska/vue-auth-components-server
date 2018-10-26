<template>
<div class="Signup">
    <slot name="welcomeMessage">
        <h2 class="Signup__h2">¡Bienvenido!</h2>
        <h4 class="Signup__h4">Regístrate:</h4>
    </slot>
    <input
        class="Signup__login"
        type="email"
        v-model="email"
        placeholder="Email Address">
    <input
        class="Signup__login"
        type="password"
        :class="[passwordErrorClass, matchingPasswordsClass]"
        v-model="password"
        placeholder="Password">
    <input
        type="password"
        class="Signup__login"
        :class="[passwordErrorClass, matchingPasswordsClass]"
        v-model="passwordCheck"
        @keyup.enter="handleSignup()"
        placeholder="Password">
    <div>
        <h6 class="Signup__h6" v-if="passwordConfirmation.length > 4 && !passwordMatch">
            Las contraseñas no coinciden
        </h6>
        <h6 class="Signup__h6" v-if="passwordConfirmation.length > 4 && passwordMatch">
            ¡Hurray! Las contraseñas coinciden!
        </h6>
    </div>
    <button class="Auth__button"
        @click="handleSignup()">
        <slot>Registrarse</slot>
    </button>
    <div class="Signup__server-messages">
        <h5 class="Signup__h5">{{ server.auth.message }}</h5>
        <slot name="isRegistered">
            <h4 class="Signup__h4" @click="goToLogin">Ya tengo una cuenta...</h4>
        </slot>
    </div>
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
    TOGGLE_LOGIN,
    TOGGLE_SIGNUP
} from '@/auth/mutation-types'

export default {
    name: 'sign-up-app',
    data () {
        return {
            passwordMatch: true,
            passwordConfirmation: ''
        }
    },
    computed: {
        ...mapState('users', ['user']),
        ...mapState('server', ['server']),
        ...mapGetters('users', ['auth']),

        passwordErrorClass () {
            if (this.passwordConfirmation.length > 4) {
                return {
                    'Signup__input-error': !this.passwordMatch
                }
            }
        },

        matchingPasswordsClass () {
            if (this.passwordConfirmation.length > 4) {
                return {
                    'Signup__input-success': this.passwordMatch
                }
            }
        },

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
        },

        passwordCheck: {
            get () {
                return this.passwordConfirmation
            },
            set (password) {
                this.passwordConfirmation = password
                this.confirmPassword(password)
            }
        }
    },
    methods: {
        ...mapActions('users', ['signupUser']),

        confirmPassword (password) {
            if (this.user.credentials.password !== password) {
                this.passwordMatch = false
                return
            }
            this.passwordMatch = true
        },

        handleSignup () {
            this.confirmPassword(this.passwordConfirmation)
            if (this.passwordMatch) {
                this.signupUser()
                    .then((res) => {
                        this.$store.commit(`server/${TOGGLE_SIGNUP}`)
                    })
                    .catch((error) => {
                        console.error('ERROR handleSignup\n', error)
                        this.$store.commit(`server/${TOGGLE_SIGNUP}`)
                    })
            }
        },

        goToLogin () {
            this.$store.commit(TOGGLE_LOGIN)
        }
    }
}
</script>

<style scoped>
.Signup {
    margin-top: 2rem;
    display: flex;
    padding: 1.4rem;
    flex-direction: column;
    justify-content: center;
    align-content: space-around;
    max-width: 37rem;
}

.Signup input {
    width: 100%;
    padding: 1rem;
    margin: 1rem 0;
}

.Signup__input-error {
    color: #f59f9f;
    border: solid 2px #f59f9f;
    transition: all .3s ease;
}

.Signup__input-success {
    color: #81c590;
    border: solid 2px #81c590;
    transition: all .3s ease;
}

.Signup .button {
    width: 100%;
    height: 4.6rem;
}

.Signup p {
    cursor: pointer;
    z-index: 10000;
}

.Signup p:hover {
    color: #de8162;
}

.Signup__h4 {
    cursor: pointer;
    z-index: 10000;
}

.Signup__server-messages:hover {
    color: #de8162;
}
</style>
