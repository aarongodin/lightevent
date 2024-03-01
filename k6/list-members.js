import http from 'k6/http';
import encoding from 'k6/encoding'
import { check } from 'k6'

const BASE_URL = 'http://localhost:8080';
const ENDPOINT = '/rpc/LightEvent/ListMembers';
const url = BASE_URL + ENDPOINT;
const USERNAME = 'admin';
const PASSWORD = 'admin';
const credentials = `${USERNAME}:${PASSWORD}`
const authString = `Basic ${encoding.b64encode(credentials)}`

export default function () {
  const response = http.post(url, '{}', {
    headers: {
      'Content-Type': "application/json",
      Authorization: authString,
    },
  })
  check(response, {
    'status is 200': (r) => r.status === 200,
  })
}
  

