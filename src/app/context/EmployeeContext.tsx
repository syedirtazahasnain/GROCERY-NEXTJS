// contexts/EmployeeContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    emp_id: string | null;
    d_o_j: string | null;
    location: string | null;
    status: string;
    role: string;
}

interface PaginatedUsers {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface EmployeeContextType {
    employees: PaginatedUsers | null;
    searchCache: Record<string, PaginatedUsers>;
    addToCache: (key: string, data: PaginatedUsers) => void;
    setEmployees: (data: PaginatedUsers) => void;
    searchSuggestions: User[];
    setSearchSuggestions: (users: User[]) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
    const [employees, setEmployees] = useState<PaginatedUsers | null>(null);
    const [searchCache, setSearchCache] = useState<Record<string, PaginatedUsers>>({});
    const [searchSuggestions, setSearchSuggestions] = useState<User[]>([]);

    const addToCache = (key: string, data: PaginatedUsers) => {
        setSearchCache(prev => ({ ...prev, [key]: data }));
    };

    return (
        <EmployeeContext.Provider value={{ 
            employees, 
            searchCache, 
            addToCache, 
            setEmployees,
            searchSuggestions,
            setSearchSuggestions
        }}>
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployeeContext = () => {
    const context = useContext(EmployeeContext);
    if (context === undefined) {
        throw new Error('useEmployeeContext must be used within an EmployeeProvider');
    }
    return context;
};