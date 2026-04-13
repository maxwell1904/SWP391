import React, { useState, useEffect, useContext, createContext } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleSearchBar = () => {
        setIsSearchOpen(prevState => !prevState);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                toggleSearchBar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const value = {
        isSearchOpen,
        toggleSearchBar,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchBar = () => {
    return useContext(SearchContext);
};