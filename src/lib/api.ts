import { Country } from '../features/auth/types';

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
  const data = await res.json();
  return data.map((country: { name: { common: string }, cca2: string, idd: { root?: string, suffixes?: string[] }, flags: { svg?: string } }) => ({
    name: country.name.common,
    code: country.cca2,
    dialCode: country.idd?.root ? `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ''}` : '',
    flag: country.flags?.svg || '',
  })).filter((c: Country) => c.dialCode);
} 