import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-full bg-transparent border-b-2 border-gray-200 px-3 py-3 sm:px-4 sm:py-4 
                 text-base sm:text-2xl text-left text-gray-900 placeholder-gray-400 
                 focus:border-[#b4854b] focus:outline-none transition-colors duration-200"
      >
        {value || placeholder}
        <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 transition-transform 
                    duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-2 text-base bg-gray-50 rounded-md 
                         placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b4854b]"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-100 
                           transition-colors ${value === option ? 'bg-[#b4854b] text-white hover:bg-[#b4854b]' 
                           : 'text-gray-900'}`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-base">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};