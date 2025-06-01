import React from "react";

const Navbar = () => {
  const navItems = [
    { name: "Exportar", href: "#" },
    { name: "Genetar", href: "#" },
    { name: "Compartir", href: "#" },
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-white font-bold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                TechBrand
              </span>
            </div>
          </div>

          {/* Navigation - Siempre visible */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <a
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              </div>
            ))}

            {/* CTA Button integrado */}
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 ml-4">
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Componente de demostración con fondo simple
const App = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navbar />
    </div>
  );
};

export default App;
