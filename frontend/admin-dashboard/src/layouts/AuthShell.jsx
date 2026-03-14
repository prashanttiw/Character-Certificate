export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-background-glow auth-glow-one" />
      <div className="auth-background-glow auth-glow-two" />
      <section className="auth-hero">
        <span className="eyebrow">Administrative Console</span>
        <h1>Immutable audit trail for the certificate system.</h1>
        <p>
          Review system history, filter sensitive events, and monitor student and
          administrative activity from one dedicated command space.
        </p>
      </section>
      <section className="auth-panel">{children}</section>
    </div>
  );
}
