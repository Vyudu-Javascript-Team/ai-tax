import { Tokens } from 'csrf';

const tokens = new Tokens();

export function generateCSRFToken() {
  return tokens.create(process.env.CSRF_SECRET);
}

export function verifyCSRFToken(token: string) {
  return tokens.verify(process.env.CSRF_SECRET, token);
}