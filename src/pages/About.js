export function About() {
  return `
    <div style="max-width: 800px; margin: 4rem auto; padding: 0 var(--spacing-md); text-align: center; animation: fadeIn 0.8s ease-out;">
      
      <!-- Fictional Lore Section -->
      <div style="margin-bottom: 4rem;">
        <h1 style="font-family: 'Georgia', serif; font-size: clamp(2.5rem, 6vw, 4rem); letter-spacing: 2px; margin-bottom: 1rem; color: var(--color-text-main);">
          THE PANTHEON
        </h1>
        <p style="font-size: 1.2rem; color: var(--color-primary); font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3rem;">
          A marketplace beyond the limits of time.
        </p>

        <div style="display: flex; flex-direction: column; gap: 2rem; align-items: center; text-align: center;">
          
          <div style="max-width: 400px;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-main); margin-bottom: 0.5rem;">3000 BC</div>
            <div style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6;">Ancient artifacts, preserved across millennia.</div>
          </div>

          <div style="color: var(--color-primary); font-size: 1.5rem;">↓</div>

          <div style="max-width: 400px;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-main); margin-bottom: 0.5rem;">Present Day</div>
            <div style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6;">The absolute peak of modern luxury and technology.</div>
          </div>

          <div style="color: var(--color-primary); font-size: 1.5rem;">↓</div>

          <div style="max-width: 400px;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-main); margin-bottom: 0.5rem;">7000 AD</div>
            <div style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6;">Impossible inventions and deep-space transit.</div>
          </div>

        </div>
      </div>

      <!-- Portfolio Declaration Section (The Fourth Wall Break) -->
      <div style="border-top: 1px solid var(--color-border); padding-top: 3rem; text-align: left; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-text-main); text-transform: uppercase; letter-spacing: 1px;">
          The Architecture (Project Disclaimer)
        </h2>
        <p style="color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem;">
          The Pantheon is a fictional e-commerce universe created as a full-stack software engineering portfolio project. All products, prices, and time-travel claims are strictly satirical.
        </p>
        <p style="color: var(--color-text-muted); line-height: 1.6; font-size: 0.95rem;">
          <strong style="color: var(--color-text-main);">Technical Specs:</strong> This platform is a Single Page Application (SPA) built natively in Vanilla JavaScript. It features a custom hash-based routing engine, role-based Content Management System (CMS), dynamic image compression, and interactive community moderation, entirely powered by a Google Firebase backend (Auth, Firestore, Hosting).
        </p>
      </div>

    </div>
  `;
}

export function initAbout() {
  // Ensure the page always starts at the top when navigated to
  window.scrollTo(0, 0);
}