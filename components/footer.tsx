import Link from 'next/link';
import styles from './footer.module.css';
import packageJSON from '../package.json';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <hr />
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <em>We can put our contact info here :)</em>
        </li>
      </ul>
    </footer>
  );
}
