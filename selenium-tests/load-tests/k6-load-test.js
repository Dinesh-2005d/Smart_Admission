import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const url = __ENV.BASE_URL || 'https://dinesh-2005d.github.io/Smart_Admission/';
  const res = http.get(url);
  check(res, {
    'is status 200': (r) => r.status === 200,
    'body size is valid': (r) => r.body.length > 100,
  });
  sleep(1);
}
