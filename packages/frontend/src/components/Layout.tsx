import { Outlet, Link, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <nav className="app-nav" aria-label="Main navigation">
        <Link to="/" className="nav-brand">PetOps AI</Link>
        <div className="nav-links">
          <Link
            to="/app"
            className={location.pathname === '/app' ? 'active' : ''}
          >
            AI Intake
          </Link>
          <Link
            to="/app/guided"
            className={location.pathname === '/app/guided' ? 'active' : ''}
          >
            Guided
          </Link>
          <Link
            to="/app/plans"
            className={location.pathname === '/app/plans' ? 'active' : ''}
          >
            History
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
