/**
 * Códigos de país para WhatsApp
 */
export const COUNTRY_CODES: Record<string, string> = {
  'Colombia': '57',
  'México': '52',
  'Argentina': '54',
  'Chile': '56',
  'Perú': '51',
  'Ecuador': '593',
  'Venezuela': '58',
  'Bolivia': '591',
  'Paraguay': '595',
  'Uruguay': '598',
  'Costa Rica': '506',
  'Panamá': '507',
  'Guatemala': '502',
  'Honduras': '504',
  'Nicaragua': '505',
  'El Salvador': '503',
  'República Dominicana': '1809',
  'Puerto Rico': '1787',
  'España': '34',
  'Estados Unidos': '1',
};

/**
 * Valida formato de número de WhatsApp
 * @param phone - Número de teléfono
 * @param country - País del número
 * @returns Objeto con validación y número limpio
 */
export const validateWhatsAppNumber = (
  phone: string,
  country?: string
): { isValid: boolean; error?: string; cleanNumber?: string } => {
  // Limpiar el número
  const cleanNumber = phone.replace(/\D/g, '');
  
  // Validar longitud mínima
  if (cleanNumber.length < 7) {
    return {
      isValid: false,
      error: 'El número debe tener al menos 7 dígitos'
    };
  }

  // Validar longitud máxima
  if (cleanNumber.length > 15) {
    return {
      isValid: false,
      error: 'El número es demasiado largo'
    };
  }

  // Si tiene código de país, validar que sea correcto
  if (country && COUNTRY_CODES[country]) {
    const countryCode = COUNTRY_CODES[country];
    const expectedLength = countryCode.length + cleanNumber.length;
    
    if (expectedLength > 15) {
      return {
        isValid: false,
        error: 'Formato de número inválido para el país seleccionado'
      };
    }
  }

  return {
    isValid: true,
    cleanNumber
  };
};

/**
 * Formatea un número de teléfono para WhatsApp según el país
 * @param phone - Número de teléfono (puede incluir prefijo o no)
 * @param country - País del vendedor
 * @returns Número formateado con código de país
 */
export const formatWhatsAppNumber = (phone: string, country?: string): string => {
  // Limpiar el número de caracteres no numéricos
  let cleanNumber = phone.replace(/\D/g, '');
  
  // Si el número ya tiene un código de país válido (más de 10 dígitos), retornarlo
  if (cleanNumber.length > 10) {
    return cleanNumber;
  }

  // Si tenemos el país, agregar el código correspondiente
  if (country && COUNTRY_CODES[country]) {
    return `${COUNTRY_CODES[country]}${cleanNumber}`;
  }

  // Por defecto, asumir Colombia si no hay país o no se encuentra
  return `57${cleanNumber}`;
};

/**
 * Genera el enlace de WhatsApp con mensaje predefinido
 * @param phone - Número de teléfono
 * @param country - País del vendedor
 * @returns URL de WhatsApp
 */
export const generateWhatsAppLink = (
  phone: string,
  country: string | undefined
): string => {
  const whatsappNumber = formatWhatsAppNumber(phone, country);
  const message = "Hola, estoy interesado en esta joya que vi en Veralix";
  
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};
