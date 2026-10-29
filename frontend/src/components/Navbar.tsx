import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HeartPulse, Activity, Scan, LayoutDashboard, Info, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: HeartPulse, end: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/heart-disease', label: 'Heart Disease Prediction', icon: Activity },
    { to: '/xray-analysis', label: 'X-Ray Analysis', icon: Scan },
    { to: '/about-models', label: 'About Models', icon: Info },
  ];

  return (
    <nav className="bg-navy border-b border-navy-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                HeartHealth <span className="text-teal-400 font-semibold text-sm px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">AI</span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">Clinical Tabular & Radiological X-Ray Intelligence</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Academic Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800 border border-navy-700 text-xs text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span>Research Prototype</span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-700 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
};
