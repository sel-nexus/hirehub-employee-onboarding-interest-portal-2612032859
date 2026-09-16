import { Link } from 'react-router-dom';

const benefits = [
  ['💡', 'Innovation', 'Work on cutting-edge projects that push boundaries and shape the future of technology.'],
  ['📈', 'Career Growth', 'Clear career paths, mentorship programs, and continuous learning opportunities for every team member.'],
  ['🤝', 'Great Culture', 'A diverse, inclusive workplace where collaboration and creativity thrive every day.'],
  ['🌍', 'Global Impact', "Your work reaches millions of users worldwide, making a real difference in people's lives."],
];

/** Renders the organization story and directs candidates to the interest form. */
export default function LandingPage() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1 id="hero-title">Build Your Future With Us</h1>
          <p>Join a team that values innovation, collaboration, and growth. We&apos;re looking for talented people like you.</p>
          <Link className="button hero-button" to="/apply">Express Your Interest</Link>
        </div>
      </section>
      <section className="benefits-section" aria-labelledby="benefits-title">
        <div className="section-heading">
          <p className="eyebrow">LIFE AT HIREHUB</p>
          <h2 id="benefits-title">Why Join Us?</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map(([emoji, title, description]) => (
            <article className="benefit-card" key={title}>
              <span className="benefit-emoji" aria-hidden="true">{emoji}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bottom-cta" aria-labelledby="cta-title">
        <p className="eyebrow">MAKE A MOVE</p>
        <h2 id="cta-title">Ready to take the next step?</h2>
        <Link className="button" to="/apply">Apply Now</Link>
      </section>
    </main>
  );
}
