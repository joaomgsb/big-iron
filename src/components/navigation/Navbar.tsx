import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Settings, FileText, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // CSS específico para MacBook M1 2560x1600 e outras resoluções
  const macbookM1CSS = `
    /* MacBook M1 2560x1600 específico */
    @media (min-width: 2560px) and (max-width: 2560px) and (min-height: 1600px) and (max-height: 1600px) {
      .macbook-m1-navbar {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 1rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        font-size: 1rem !important;
      }
      .macbook-m1-navbar .hamburger-button {
        display: none !important;
      }
      .macbook-m1-navbar .desktop-nav {
        display: flex !important;
      }
    }
    
    /* MacBook M1 Pro 14" (2560x1600) */
    @media (min-width: 2560px) and (max-width: 2560px) and (min-height: 1600px) and (max-height: 1600px) and (-webkit-device-pixel-ratio: 2) {
      .macbook-m1-navbar {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 1.25rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.75rem !important;
        padding-right: 1.75rem !important;
        font-size: 1.1rem !important;
      }
      .macbook-m1-navbar .hamburger-button {
        display: none !important;
      }
      .macbook-m1-navbar .desktop-nav {
        display: flex !important;
      }
    }
    
    /* MacBook M1 Air 13" (2560x1600) */
    @media (min-width: 2560px) and (max-width: 2560px) and (min-height: 1600px) and (max-height: 1600px) and (-webkit-device-pixel-ratio: 2) {
      .macbook-m1-navbar {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
      }
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 1rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        font-size: 1rem !important;
      }
      .macbook-m1-navbar .hamburger-button {
        display: none !important;
      }
      .macbook-m1-navbar .desktop-nav {
        display: flex !important;
      }
    }
    
    /* Breakpoint para mostrar menu hambúrguer em resoluções menores */
    @media (max-width: 2559px) {
      .macbook-m1-navbar .hamburger-button {
        display: flex !important;
      }
      .macbook-m1-navbar .desktop-nav {
        display: none !important;
      }
    }
    
    /* MacBook M1 geral - cobre todas as variantes */
    @media (min-width: 1440px) and (max-width: 2559px) and (min-height: 900px) and (max-height: 1599px) and (-webkit-device-pixel-ratio: 2) {
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 0.75rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
        font-size: 0.95rem !important;
      }
    }
    
    /* MacBook M1 Retina Display específico */
    @media (-webkit-device-pixel-ratio: 2) and (min-width: 1440px) and (max-width: 2559px) {
      .macbook-m1-navbar .container {
        max-width: 100% !important;
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }
      .macbook-m1-navbar .nav-links {
        gap: 1rem !important;
      }
      .macbook-m1-navbar .nav-link {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        font-size: 1rem !important;
      }
    }
    
    /* Animações suaves para o menu hambúrguer */
    .hamburger-menu-overlay {
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.95);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }
    
    .hamburger-menu-overlay::-webkit-scrollbar {
      width: 6px;
    }
    
    .hamburger-menu-overlay::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .hamburger-menu-overlay::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }
    
    .hamburger-menu-overlay::-webkit-scrollbar-thumb:hover {
      background-color: rgba(156, 163, 175, 0.7);
    }
    
    .hamburger-menu-item {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hamburger-menu-item:hover {
      transform: translateX(8px);
      background-color: rgba(59, 130, 246, 0.1);
    }
    
    /* Animação do ícone hambúrguer */
    .hamburger-icon {
      transition: transform 0.3s ease;
    }
    
    .hamburger-icon.open {
      transform: rotate(90deg);
    }
    
    /* Melhor espaçamento para navbar */
    .navbar-container {
      padding-left: 1.5rem !important;
      padding-right: 1.5rem !important;
    }
    
    /* Espaçamento específico para resoluções menores */
    @media (max-width: 768px) {
      .navbar-container {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .navbar-container {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
      }
    }
    
    @media (min-width: 1025px) and (max-width: 2559px) {
      .navbar-container {
        padding-left: 3rem !important;
        padding-right: 3rem !important;
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: macbookM1CSS }} />
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 macbook-m1-navbar"
      >
        <div className="container mx-auto navbar-container">
          <div className="flex justify-between items-center">
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

            {/* Desktop Navigation - visível apenas em 2560x1600 */}
            <nav className="hidden desktop-nav items-center space-x-1 nav-links">
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
                className="hamburger-button flex items-center justify-center w-12 h-12 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                <div className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Navigation - Menu Hambúrguer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="hamburger-menu-overlay fixed inset-0 top-16 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="container mx-auto navbar-container py-6"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <nav className="flex flex-col space-y-3 pb-8">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      variants={menuItemVariants}
                      custom={index}
                    >
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `hamburger-menu-item block px-6 py-4 rounded-lg transition-all duration-300 font-medium text-lg ${
                            isActive 
                              ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500' 
                              : 'text-neutral-700 hover:text-primary-500 hover:bg-neutral-50'
                          }`
                        }
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </NavLink>
                    </motion.div>
                  ))}
                  
                  {/* Admin Links for Mobile */}
                  {profile?.isAdmin && (
                    <motion.div variants={menuItemVariants}>
                      <div className="border-t border-gray-200 my-6"></div>
                      <div className="px-6 py-3">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                          Administração
                        </p>
                      </div>
                      {adminLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <motion.div
                            key={link.path}
                            variants={menuItemVariants}
                            custom={navLinks.length + index}
                          >
                            <Link
                              to={link.path}
                              className={`hamburger-menu-item flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-300 ${
                                location.pathname === link.path
                                  ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500 font-medium'
                                  : 'text-neutral-700 hover:text-primary-500 hover:bg-neutral-50'
                              }`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Icon size={20} />
                              <span className="text-lg">{link.name}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;