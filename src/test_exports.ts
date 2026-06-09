import PhoneInput, { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';
import flags from 'react-phone-number-input/flags';

console.log("flags count:", Object.keys(flags).length);
console.log("flags IN type:", typeof (flags as any).IN);
