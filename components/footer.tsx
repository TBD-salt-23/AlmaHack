import styles from 'components/styles/footer.module.css';
import { shuffle } from '../utils/helpers';
import { useEffect } from 'react';
const DEVELOPER_ARRAY = [
  { name: 'Hugo Dahlgren', github: 'https://github.com/snygghugo' },
  { name: 'Diana Borro', github: 'https://github.com/DianaBorro' },
  { name: 'Sebastian Palmqvist', github: 'https://github.com/PalmN72' },
];
let parsedDevelopers = [<p key={':)'}>:)</p>];
export default function Footer() {
  useEffect(() => {
    parsedDevelopers = shuffle(DEVELOPER_ARRAY).map((developerAndGithub, i) => {
      if (i === 0) {
        return (
          <span key={developerAndGithub.name}>
            <a className={styles.contactLink} href={developerAndGithub.github}>
              {developerAndGithub.name}
            </a>
          </span>
        );
      }

      if (i === DEVELOPER_ARRAY.length - 1) {
        return (
          <span key={developerAndGithub.name}>
            {' and '}
            <a
              className={styles.contactLink}
              href={developerAndGithub.github}
              key={developerAndGithub.name}
            >
              {developerAndGithub.name}
            </a>
            {'!'}
          </span>
        );
      }
      return (
        <span key={developerAndGithub.name}>
          {', '}
          <a
            className={styles.contactLink}
            href={developerAndGithub.github}
            key={developerAndGithub.name}
          >
            {developerAndGithub.name}
          </a>
        </span>
      );
    });
  });

  return (
    <footer className={styles.footer}>
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <em>Developed by: {parsedDevelopers}</em>
        </li>
      </ul>
    </footer>
  );
}
