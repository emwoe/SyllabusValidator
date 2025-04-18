import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Nav() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title above navigation */}
        <div className="text-left py-4 border-b border-neutral-100">
          <Link href="/">
            <span className="text-primary text-2xl font-serif font-bold cursor-pointer">SEU Gen Ed Syllabus Checker</span>
          </Link>
        </div>

        {/* Navigation below title */}
        <div className="flex justify-between h-14">
          <div className="flex">
            <nav className="hidden sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium ${
                  location === '/' 
                    ? 'border-primary text-neutral-900' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}>
                  Upload & Analyze
                </a>
              </Link>
              <Link href="/database">
                <a className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium ${
                  location === '/database' 
                    ? 'border-primary text-neutral-900' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}>
                  Database
                </a>
              </Link>
              <Link href="/help">
                <a className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium ${
                  location === '/help' 
                    ? 'border-primary text-neutral-900' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}>
                  Help
                </a>
              </Link>
            </nav>
          </div>
          <div className="hidden sm:flex sm:items-center">
            <button className="bg-white p-1 rounded-full text-neutral-600 hover:text-neutral-900 focus:outline-none">
              <span className="material-icons">account_circle</span>
            </button>
          </div>
          <div className="flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 focus:outline-none"
              aria-controls="mobile-menu" 
              aria-expanded={mobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${mobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location === '/' 
                ? 'bg-neutral-50 border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900'
            }`}>
              Upload & Analyze
            </a>
          </Link>
          <Link href="/database">
            <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location === '/database' 
                ? 'bg-neutral-50 border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900'
            }`}>
              Database
            </a>
          </Link>
          <Link href="/help">
            <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location === '/help' 
                ? 'bg-neutral-50 border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900'
            }`}>
              Help
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
