import React from 'react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <>
      <h1 className={styles.landing__heading}>AlmaHack</h1>
      <div className={styles.landing__info}>
        <h3>What would you like to have finished by next week?</h3>
        <p>Tell us what time you're free, and add your tasks!</p>
        <p>
          {' '}
          Our app will schedule your tasks each day for the next week in the
          time slot you specified - now all you need to do is do it!
        </p>
        <p>
          Thanks to our app you will have them scheduled and in your Google
          Calendar - and that's it!
        </p>
      </div>
    </>
  );
};

export default LandingPage;
