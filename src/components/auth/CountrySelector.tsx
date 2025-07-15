import React from 'react';
import { Country } from '../../features/auth/types';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface CountrySelectorProps {
  countries: Country[];
  value: string;
  onChange: (code: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ countries, value, onChange }) => {
  const selected = countries.find((c) => c.code === value) || null;

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="w-full p-2 border rounded flex items-center justify-between bg-white dark:bg-gray-900">
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.flag && (
                <Image src={selected.flag} alt="flag" className="w-5 h-5 rounded-sm" width={20} height={20} />
              )}
              <span>{selected.name} ({selected.dialCode})</span>
            </span>
          ) : (
            <span className="text-gray-400">Select country</span>
          )}
          <ChevronUpDownIcon className="w-5 h-5 text-gray-400 ml-2" aria-hidden="true" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border rounded shadow-lg max-h-60 overflow-auto">
          {countries.map((country) => (
            <Listbox.Option
              key={country.code}
              value={country.code}
              className={({ active }) =>
                `cursor-pointer select-none relative p-2 flex items-center gap-2 ${active ? 'bg-blue-100 dark:bg-gray-700' : ''}`
              }
            >
              {country.flag && (
                <Image src={country.flag} alt="flag" className="w-5 h-5 rounded-sm" width={20} height={20} />
              )}
              <span>{country.name} ({country.dialCode})</span>
              {value === country.code && (
                <CheckIcon className="w-4 h-4 text-blue-600 ml-auto" aria-hidden="true" />
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}; 