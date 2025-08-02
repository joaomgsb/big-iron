import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Settings, FileText, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // CSS for tablet 2304x1440 resolution and MacBook M1 specific fixes
  const tabletHighResCSS = `
    @media (min-width: 2300px) and (max-width: 2310px) and (min-height: 1435px) and (max-height: 1445px) {
      .hide-on-tablet-highres { display: none !important; }
      .show-on-tablet-highres { display: flex !important; }
      .mobile-menu-tablet-highres { display: block !important; }
    }
    
    /* MacBook M1 specific fixes */
    @media (min-width: 1440px) and (max-width: 1512px) and (min-height: 900px) and (max-height: 982px) {
      .macbook-m1-navbar {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.25rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
        font-size: 0.875rem !important;
      }
    }
    
    /* MacBook M1 Pro/Max specific fixes */
    @media (min-width: 1512px) and (max-width: 1728px) and (min-height: 982px) and (max-height: 1117px) {
      .macbook-m1-navbar {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.25rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
        font-size: 0.875rem !important;
      }
    }
    
    /* MacBook M1 Pro 14" (2560x1600) specific fixes */
    @media (min-width: 2560px) and (max-width: 2560px) and (min-height: 1600px) and (max-height: 1600px) {
      .macbook-m1-navbar {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.25rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
        font-size: 0.875rem !important;
      }
    }
    
    /* MacBook M1 Air 13" (2560x1600) specific fixes */
    @media (min-width: 2560px) and (max-width: 2560px) and (min-height: 1600px) and (max-height: 1600px) and (-webkit-device-pixel-ratio: 2) {
      .macbook-m1-navbar {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.25rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
        font-size: 0.875rem !important;
      }
    }
    
    /* MacBook M1 general fixes - covers all M1 variants */
    @media (min-width: 1440px) and (max-width: 2560px) and (min-height: 900px) and (max-height: 1600px) and (-webkit-device-pixel-ratio: 2) {
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.5rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        font-size: 0.9rem !important;
      }
    }
    
    /* MacBook M1 specific spacing fix - ensures proper spacing between logo and nav */
    @media (min-width: 1440px) and (max-width: 2560px) and (min-height: 900px) and (max-height: 1600px) {
      .macbook-m1-navbar .macbook-m1-flex-container {
        gap: 2rem !important;
      }
      .macbook-m1-navbar .nav-links {
        margin-left: auto !important;
        margin-right: auto !important;
      }
      .macbook-m1-navbar .nav-link:first-child {
        margin-left: 1rem !important;
      }
    }
    
    /* MacBook M1 Retina Display specific fixes */
    @media (-webkit-device-pixel-ratio: 2) and (min-width: 1440px) and (max-width: 2560px) {
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.75rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
        font-size: 0.9rem !important;
      }
      .macbook-m1-navbar .nav-link:first-child {
        margin-left: 1.5rem !important;
      }
    }
  `;

  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
  }, [location.pathname]);

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Receitas', path: '/receitas' },
    { name: 'News', path: '/news' },
    { name: 'Planos Alimentares', path: '/planos' },
    { name: 'Sugestões de Receitas', path: '/sugestoes-receitas' },
    { name: 'Lista de Compras', path: '/lista-compras' },
    { name: 'Rastreador', path: '/tracker' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Settings },
    { name: 'Gerenciar News', path: '/admin/news', icon: Newspaper },
    { name: 'Termos de Uso', path: '/admin/termos', icon: FileText },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tabletHighResCSS }} />
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 macbook-m1-navbar"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center macbook-m1-flex-container">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center gap-2">
                <img 
                  src="/images/bigiron.jpg"
                  alt="BigIron Logo"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold font-display text-neutral-800">
                  Big<span className="text-primary-500">Iron</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden [@media(min-width:1024px)_and_(max-width:1279px)]:hidden xl:flex hide-on-tablet-highres items-center space-x-1 nav-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-5 py-3 rounded-md transition-colors font-medium text-lg nav-link ${
                      isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-100'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              {/* Admin Dropdown */}
              {profile?.isAdmin && (
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                    className={`px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-1 ${
                      location.pathname.startsWith('/admin')
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-100'
                    }`}
                  >
                    Admin
                    <ChevronDown size={16} className={`transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAdminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                    >
                      {adminLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              location.pathname === link.path
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-50'
                            }`}
                            onClick={() => setIsAdminDropdownOpen(false)}
                          >
                            <Icon size={16} />
                            {link.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              )}
            </nav>

            {/* User Profile & Mobile/Tablet Menu Button */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/perfil" 
                className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary-100 hover:text-primary-500 transition-colors"
              >
                <User size={24} />
              </Link>
              
              <button 
                className="xl:hidden show-on-tablet-highres flex items-center justify-center w-12 h-12 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="xl:hidden mobile-menu-tablet-highres bg-white shadow-lg absolute top-full left-0 right-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-md transition-colors ${
                        isActive 
                          ? 'text-primary-600 bg-primary-50 font-medium' 
                          : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-100'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
                
                {/* Admin Links for Mobile */}
                {profile?.isAdmin && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administração
                      </p>
                    </div>
                    {adminLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                            location.pathname === link.path
                              ? 'text-primary-600 bg-primary-50 font-medium'
                              : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-100'
                          }`}
                        >
                          <Icon size={18} />
                          {link.name}
                        </Link>
                      );
                    })}
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </header>
    </>
  );
};

export default Navbar;