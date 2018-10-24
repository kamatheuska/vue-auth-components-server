process.env.NODE_ENV = 'test'

const test = require('tape')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../app')
const { User } = require('../models/User')

const { populateCollection, clearCollection, setupUsers, teardown } = require('./seed/utils')
const { isObject } = require('../utils')


test.onFinish(() => teardown([User]))

test('GET /users/me', { skip: false }, (t) => {
    const users = setupUsers()
    const config = {
        model: User,
        user: null,
        items: users,
        skip: false
    }
    populateCollection(t, config)
    t.test('should return user if authenticated', { skip: false }, function (assert) {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((error, res) => {
                if (error) {
                    assert.error(error,
                        'Should return undefined if no error.')
                    assert.comment('EXITING TESTS: res.body undefined......')
                    assert.end()
                } else {
                    assert.error(res.error.text,
                        'Should return undefined if no error in the server.')
                    assert.equal(res.body._id, users[0]._id.toHexString(),
                        'Returned _id from server should match sended one.')
                    assert.equal(res.body.email, users[0].email,
                        'Returned email from server should match sended one.')
                    assert.end()
                }
            })

    })

    t.test('should return 401 if not authenticated', { skip: false }, function (assert) {
        request(app)
            .get('/users/me')
            .expect(401)
            .end((err, res) => {
                assert.error(err,
                    'Should return undefined if no error.')
                assert.true(res.error.text,
                    'Should return an error description.')
                assert.end()
            })

    })
})

test('POST /users', { skip: false }, (t) => {
    t.test('should create a user', { skip: false }, function (assert) {
        let email = 'example@example.com'
        let password = '123mnb!'

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                assert.true(res.headers['x-auth'],
                    'There should be a x-auth token on res.header')
                assert.true(res.body._id,
                    'ID should be returned on the body')
                assert.equal(res.body.email, email,
                    'Email from response should equal the one sended')
            })
            .end((err, res) => {
                if (err) {
                    assert.error(err,
                        'Should return undefined if no error.')
                    assert.comment('EXITING TESTS: res.body undefined......')
                    assert.end()
                } else {
                    assert.error(res.error.text,
                        'Should return undefined if no error in the server.')

                    User.findOne({ email }).then((user) => {
                        assert.true(user,
                            'User should exist in the DB.')
                        assert.notEqual(user.password, password,
                            'Password retrieved from server should not match the one given by the user.')
                        assert.end()
                    }).catch(assert.end)
                }
            })
    })

    t.test('should return validation errors if request is invalid', { skip: false }, function (assert) {
        let badEmail = 'bademail'
        let password = '567'

        request(app)
            .post('/users')
            .send({ badEmail, password })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    assert.error(err,
                        'Should return undefined if no error.')
                    assert.comment('EXITING TESTS: res.body undefined......')
                    assert.end()
                } else {
                    assert.true(res.error.text,
                        'Should return text from error on the server')
                    assert.end()
                }
            })
    })

    let users = setupUsers()
    let config = {
        model: User,
        user: null,
        items: users,
        skip: false
    }
    populateCollection(t, config)

    t.test('should not create a user if email in use', { skip: false }, function (assert) {
        let email = users[0].email
        let password = users[1].password

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(403)
            .expect((res) => {
                let error = JSON.parse(res.error.text)
                assert.true(isObject(error),
                    'An Error Object from the server should be returned.')
                assert.equal(error.name, 'MongoError',
                    'The error returned should be a validation error.')
                assert.equal(error.code, 11000,
                    'Error code should be duplication key: 11000')
            })
            .end(assert.end)

    })
})

test('POST /users/login', { skip: false }, (t) => {
    let users = setupUsers()
    let config = {
        model: User,
        user: null,
        items: users,
        skip: false
    }
    populateCollection(t, config)

    t.test('should login user and return auth token', { skip: false }, function (assert) {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .end((error, res) => {
                if (error) {
                    assert.end(error)
                } else {
                    assert.true(res.headers['x-auth'],
                        'There should be a x-auth token on res.header')
                    assert.error(res.error.text,
                        'Should not return error from the server.')

                    User.findById(users[1]._id).then((user) => {
                        assert.equal(user.tokens[1].access, 'auth',
                            'User tokens acces property should be auth')
                        assert.equal(user.tokens[1].token, res.headers['x-auth'],
                            'User tokens token property should be equal to headers response x-auth')
                        assert.end()
                    }).catch(assert.end)
                }
            })
    })

    t.test('should reject invalid login with wrong password.', { skip: false }, function (assert) {
        request(app)
            .post('/users/login')
            .send({
                email: users[0].email,
                password: users[0].password + '123'
            })
            .expect(401)
            .end((error, res) => {
                if (error) {
                    assert.end(error)
                } else {
                    assert.false(res.headers['x-auth'],
                        'There should NOT be a x-auth token on res.header')
                    assert.true(res.error.text,
                        'Should return an error from the server.')

                    User.findById(users[0]._id)
                        .then((user) => {
                            assert.equal(user.tokens.length, 1,
                                'User should NOT have more than one element on the tokens array if login was invalid')
                            assert.end()
                        })
                        .catch((error) => {
                            assert.true(error)
                            assert.end(error)
                        })
                }
            })
    })
})

test('DELETE /users/me/token', { skip: false }, (t) => {
    let users = setupUsers()
    let config = {
        model: User,
        user: null,
        items: users,
        skip: false
    }
    populateCollection(t, config)
    t.test('should remove auth token on log out', { skip: false }, function (assert) {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((error, res) => {
                if (error) {
                    assert.end(error)
                } else {
                    assert.true(res.body.ok,
                        'Server mongoose process should return an OK response.')
                    assert.equal(res.body.nModified, 1,
                        'One object should be modified after operation.')
                    User.findById(users[0]._id).then((user) => {
                        assert.equal(user.tokens.length, 0,
                            'Tokens array from user should be empty.')
                        assert.equal(user.email, users[0].email,
                            'Deleted token\'s email should match the one sended')
                        assert.end()
                    }).catch(assert.end)
                }
            })
    })
})


/*.....................................pending...........

test('POST /todos', (t) => {
  t.test('should create a new todo', { skip: false }, function (assert) {
    let text = 'Test to do text'

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return (err)
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          ()
        }).catch((err) => (err))
      })
    })

  t.test('should not create todo with invalid data', { skip: false }, function (assert) {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return (err)
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2)
          ()
        }).catch((err) => (err))
      })
    })
})

test('GET /todos', (t) => {
  t.test('should get all todos', { skip: false }, function (assert) {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1)
      })
      
    })
})

test('GET /todos/:id', (t) => {
  t.test('should return todo doc', { skip: false }, function (assert) {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      
  })

  t.test('should return 404 if todo not found', { skip: false }, function (assert) {
  let hexId = new ObjectID().toHexString()

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      
  })
  
  t.test('should not return todo doc created by another user', { skip: false }, function (assert) {
    let text = todos[0].text
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      
  })


  t.test('should return for non- object ids', { skip: false }, function (assert) {

    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      
  })
})

test('DELETE /todos/:id', (t) => {
  t.test('should remove a todo', { skip: false }, function (assert) {
    let hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth',  users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return (err)
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist()
          ()
        }).catch((e) => (e))
      })
  })

  t.test('should remove a todo', { skip: false }, function (assert) {
    let hexId = todos[0]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth',  users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return (err)
        }
       
        Todo.findById(hexId).then((todo) => {
          expect(todo).toExist()
          ()
        }).catch((e) => (e))
      })
  })

  t.test('should return 404 if todo not found', { skip: false }, function (assert) {
    let hexId = new ObjectID().toHexString()
    
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth',  users[1].tokens[0].token)
      .expect(404)
      
  })

  t.test('should return 404 if object id is invalid', { skip: false }, function (assert) {  
    request(app)
      .get('/todos/123abc')
      .set('x-auth',  users[1].tokens[0].token)
      .expect(404)
      
  })
})

test('PATCH /todos/:id', (t) => {
  t.test('should update the todo', { skip: false }, function (assert) {
    let hexId = todos[0]._id.toHexString()
    let text = "Testing from mocha and supertest"

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeA('number')
      })
        
  })

  t.test('should not update the todo created by another user', { skip: false }, function (assert) {
    // grab id of first item
    let hexId = todos[0]._id.toHexString()
    let text = "Testing from mocha and supertest"
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth',  users[1].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(404)
        
  })

  t.test('should clear completedAt when todo is not completed', { skip: false }, function (assert) {
    let hexId = todos[1]._id.toHexString()
    let text = "Testing from mocha and supertest 222"
    let completed = false

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth',  users[1].tokens[0].token)
      .send({text, completed})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toNotExist()
      })
      
  })
})

*/