import Link from 'next/link';
import styles from 'components/styles/footer.module.css';
import packageJSON from '../package.json';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <hr />
      <ul className={styles.navItems}>
        <em>
          Developed by:{' '}
          <a
            className={styles.contactLink}
            href="https://github.com/DianaBorro"
          >
            Diana Borro
          </a>
          ,{' '}
          <a className={styles.contactLink} href="https://github.com/snygghugo">
            Hugo Dahlgren
          </a>{' '}
          and{' '}
          <a className={styles.contactLink} href="https://github.com/PalmN72">
            Sebastian Palmqvist
          </a>
        </em>
      </ul>
    </footer>
  );
}
