import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/matches', label: 'Matches' },
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/venues', label: 'Venues' },
  { to: '/discipline', label: 'Discipline' },
];

const financeLinks = [
  { to: '/owners', label: 'Owners' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/financials', label: 'Financials' },
  { to: '/objectives', label: 'Objectives' },
];

const transferLinks = [
  { to: '/transfer-windows', label: 'Transfer Windows' },
  { to: '/transfers', label: 'Transfers' },
];

function NavDropdown({ label, items }) {
  return (
    <div className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </a>
      <ul className="dropdown-menu dropdown-menu-end">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => 'dropdown-item' + (isActive ? ' active' : '')}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NavBar() {
  return (
    <nav className="navbar navbar-pitch navbar-expand-lg px-3 px-md-4">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
          <span aria-hidden="true">⚽</span> ArenaFlow
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav ms-auto align-items-lg-center">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                {link.label}
              </NavLink>
            ))}
            <NavDropdown label="Finance" items={financeLinks} />
            <NavDropdown label="Transfers" items={transferLinks} />
          </div>
        </div>
      </div>
    </nav>
  );
}
