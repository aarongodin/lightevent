import http from 'k6/http';
import { check } from 'k6'

export default function () {
  const response = http.post('http://localhost:8080/auth/login', {
    username: 'admin',
    password: 'admin',
  }, {
    redirects: 0,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  check(response, {
    'login status is 303': (r) => r.status === 303,
  })
  check(response, {
    'cookie is set': (r) => r.cookies['lightevent-user-session'] !== undefined
  })
  const response2 = http.post('http://localhost:8080/rpc/LightEvent/Ping', '{}', {
    headers: {
      'content-type': 'application/json'
    }
  })
  check(response2, {
    'ping status is 200': (r) => r.status === 200,
    'subject is correct': (r) => JSON.parse(r.body).sub === 'admin',
  })
  const response3 = http.post('http://localhost:8080/auth/logout')
  check(response3, {
    'logout status is 200': (r) => r.status === 200,
  })
}


