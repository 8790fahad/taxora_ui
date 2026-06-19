import { NavLink } from 'react-router-dom';

type Tab = {
  to: string;
  label: string;
  end?: boolean;
  icon: (active: boolean) => JSX.Element;
};

const stroke = (path: string) => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);

const tabs: Tab[] = [
  {
    to: '/dashboard',
    label: 'Home',
    end: true,
    icon: () => stroke('M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10'),
  },
  {
    to: '/invoices',
    label: 'Invoices',
    icon: () =>
      stroke(
        'M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7l-5-4H7a2 2 0 00-2 2v14a2 2 0 002 2z'
      ),
  },
  {
    to: '/connections',
    label: 'Connect',
    icon: () =>
      stroke(
        'M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5'
      ),
  },
  {
    to: '/billing',
    label: 'Billing',
    icon: () =>
      stroke(
        'M3 10h18M7 15h2m-4 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: () =>
      stroke(
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z'
      ),
  },
];

// App-style bottom navigation shown only on mobile. Mirrors the sidebar.
export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
