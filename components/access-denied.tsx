import { signIn } from 'next-auth/react';

export default function AccessDenied() {
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a
          href="/api/auth/signin"
          onClick={e => {
            e.preventDefault();
            signIn();
          }}
        >
          Please sign in to view events
        </a>
      </p>
    </>
  );
}
