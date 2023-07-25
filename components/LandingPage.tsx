import React from 'react';
import styles from 'components/styles/LandingPage.module.css';
import { signIn } from 'next-auth/react';

const handleSignInClick = (
  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) => {
  e.preventDefault();
  signIn();
};

const LandingPage = () => {
  return (
    <>
      <h1 className={styles.landing__heading}>AlmaHack</h1>
      <div className={styles.landing__info}>
        <h1>What would you like to have finished by next week?</h1>
        <p>Tell us what time you're free, and add your tasks!</p>
        <p>
          Our app will schedule your tasks in your Google Calendar over the days
          of next week in the time slot you specified - now all you have to do
          is do it!
        </p>
        <p>
          <a
            href={`/api/auth/signin`}
            className={styles.buttonPrimary}
            onClick={handleSignInClick}
          >
            Sign in
          </a>
          to get started!
        </p>
      </div>
    </>
  );
};

export default LandingPage;
