/**
 * Prefijos E.164 para el selector de importar número.
 * Nombres en ES/EN; listas con `getSortedCountryDialOptions` o `getGroupedCountryDialOptions` (top 10 + resto).
 */
export interface CountryDialRaw {
  readonly iso2: string;
  readonly dial: string;
  readonly nameEs: string;
  readonly nameEn: string;
}

export interface CountryDialOption {
  readonly iso2: string;
  readonly dial: string;
  /** Etiqueta ya en el idioma activo (y orden alfabético según ese idioma) */
  readonly label: string;
}

/** Top fijo al inicio del desplegable (ES / LATAM / US / UE); el resto va orden A–Z sin duplicar. */
export interface CountryDialGrouped {
  readonly popular: readonly CountryDialOption[];
  readonly rest: readonly CountryDialOption[];
}

const POPULAR_ISO2_ORDER: readonly string[] = [
  'es',
  'mx',
  'ar',
  'co',
  'us',
  'gb',
  'fr',
  'de',
  'it',
  'br',
];

function toDialOption(r: CountryDialRaw, useEn: boolean): CountryDialOption {
  return {
    iso2: r.iso2,
    dial: r.dial,
    label: useEn ? r.nameEn : r.nameEs,
  };
}

const RAW: readonly CountryDialRaw[] = [
  { iso2: 'af', dial: '+93', nameEs: 'Afganistán', nameEn: 'Afghanistan' },
  { iso2: 'al', dial: '+355', nameEs: 'Albania', nameEn: 'Albania' },
  { iso2: 'de', dial: '+49', nameEs: 'Alemania', nameEn: 'Germany' },
  { iso2: 'ad', dial: '+376', nameEs: 'Andorra', nameEn: 'Andorra' },
  { iso2: 'ao', dial: '+244', nameEs: 'Angola', nameEn: 'Angola' },
  { iso2: 'ai', dial: '+1264', nameEs: 'Anguila', nameEn: 'Anguilla' },
  { iso2: 'aq', dial: '+672', nameEs: 'Antártida', nameEn: 'Antarctica' },
  { iso2: 'ag', dial: '+1268', nameEs: 'Antigua y Barbuda', nameEn: 'Antigua and Barbuda' },
  { iso2: 'sa', dial: '+966', nameEs: 'Arabia Saudí', nameEn: 'Saudi Arabia' },
  { iso2: 'dz', dial: '+213', nameEs: 'Argelia', nameEn: 'Algeria' },
  { iso2: 'ar', dial: '+54', nameEs: 'Argentina', nameEn: 'Argentina' },
  { iso2: 'am', dial: '+374', nameEs: 'Armenia', nameEn: 'Armenia' },
  { iso2: 'aw', dial: '+297', nameEs: 'Aruba', nameEn: 'Aruba' },
  { iso2: 'au', dial: '+61', nameEs: 'Australia', nameEn: 'Australia' },
  { iso2: 'at', dial: '+43', nameEs: 'Austria', nameEn: 'Austria' },
  { iso2: 'az', dial: '+994', nameEs: 'Azerbaiyán', nameEn: 'Azerbaijan' },
  { iso2: 'bs', dial: '+1242', nameEs: 'Bahamas', nameEn: 'Bahamas' },
  { iso2: 'bh', dial: '+973', nameEs: 'Baréin', nameEn: 'Bahrain' },
  { iso2: 'bd', dial: '+880', nameEs: 'Bangladés', nameEn: 'Bangladesh' },
  { iso2: 'bb', dial: '+1246', nameEs: 'Barbados', nameEn: 'Barbados' },
  { iso2: 'be', dial: '+32', nameEs: 'Bélgica', nameEn: 'Belgium' },
  { iso2: 'bz', dial: '+501', nameEs: 'Belice', nameEn: 'Belize' },
  { iso2: 'bj', dial: '+229', nameEs: 'Benín', nameEn: 'Benin' },
  { iso2: 'bt', dial: '+975', nameEs: 'Bhután', nameEn: 'Bhutan' },
  { iso2: 'by', dial: '+375', nameEs: 'Bielorrusia', nameEn: 'Belarus' },
  { iso2: 'bo', dial: '+591', nameEs: 'Bolivia', nameEn: 'Bolivia' },
  { iso2: 'ba', dial: '+387', nameEs: 'Bosnia y Herzegovina', nameEn: 'Bosnia and Herzegovina' },
  { iso2: 'bw', dial: '+267', nameEs: 'Botsuana', nameEn: 'Botswana' },
  { iso2: 'br', dial: '+55', nameEs: 'Brasil', nameEn: 'Brazil' },
  { iso2: 'bn', dial: '+673', nameEs: 'Brunéi', nameEn: 'Brunei' },
  { iso2: 'bg', dial: '+359', nameEs: 'Bulgaria', nameEn: 'Bulgaria' },
  { iso2: 'bf', dial: '+226', nameEs: 'Burkina Faso', nameEn: 'Burkina Faso' },
  { iso2: 'bi', dial: '+257', nameEs: 'Burundi', nameEn: 'Burundi' },
  { iso2: 'cv', dial: '+238', nameEs: 'Cabo Verde', nameEn: 'Cape Verde' },
  { iso2: 'kh', dial: '+855', nameEs: 'Camboya', nameEn: 'Cambodia' },
  { iso2: 'cm', dial: '+237', nameEs: 'Camerún', nameEn: 'Cameroon' },
  { iso2: 'ca', dial: '+1', nameEs: 'Canadá', nameEn: 'Canada' },
  { iso2: 'qa', dial: '+974', nameEs: 'Catar', nameEn: 'Qatar' },
  { iso2: 'td', dial: '+235', nameEs: 'Chad', nameEn: 'Chad' },
  { iso2: 'cl', dial: '+56', nameEs: 'Chile', nameEn: 'Chile' },
  { iso2: 'cn', dial: '+86', nameEs: 'China', nameEn: 'China' },
  { iso2: 'cy', dial: '+357', nameEs: 'Chipre', nameEn: 'Cyprus' },
  { iso2: 'va', dial: '+379', nameEs: 'Ciudad del Vaticano', nameEn: 'Vatican City' },
  { iso2: 'co', dial: '+57', nameEs: 'Colombia', nameEn: 'Colombia' },
  { iso2: 'km', dial: '+269', nameEs: 'Comoras', nameEn: 'Comoros' },
  { iso2: 'cg', dial: '+242', nameEs: 'Congo', nameEn: 'Congo' },
  { iso2: 'cd', dial: '+243', nameEs: 'Congo (RDC)', nameEn: 'DR Congo' },
  { iso2: 'kr', dial: '+82', nameEs: 'Corea del Sur', nameEn: 'South Korea' },
  { iso2: 'kp', dial: '+850', nameEs: 'Corea del Norte', nameEn: 'North Korea' },
  { iso2: 'ci', dial: '+225', nameEs: 'Costa de Marfil', nameEn: 'Côte d\'Ivoire' },
  { iso2: 'cr', dial: '+506', nameEs: 'Costa Rica', nameEn: 'Costa Rica' },
  { iso2: 'hr', dial: '+385', nameEs: 'Croacia', nameEn: 'Croatia' },
  { iso2: 'cu', dial: '+53', nameEs: 'Cuba', nameEn: 'Cuba' },
  { iso2: 'cw', dial: '+599', nameEs: 'Curazao', nameEn: 'Curaçao' },
  { iso2: 'dk', dial: '+45', nameEs: 'Dinamarca', nameEn: 'Denmark' },
  { iso2: 'dm', dial: '+1767', nameEs: 'Dominica', nameEn: 'Dominica' },
  { iso2: 'ec', dial: '+593', nameEs: 'Ecuador', nameEn: 'Ecuador' },
  { iso2: 'eg', dial: '+20', nameEs: 'Egipto', nameEn: 'Egypt' },
  { iso2: 'sv', dial: '+503', nameEs: 'El Salvador', nameEn: 'El Salvador' },
  { iso2: 'ae', dial: '+971', nameEs: 'Emiratos Árabes Unidos', nameEn: 'United Arab Emirates' },
  { iso2: 'er', dial: '+291', nameEs: 'Eritrea', nameEn: 'Eritrea' },
  { iso2: 'sk', dial: '+421', nameEs: 'Eslovaquia', nameEn: 'Slovakia' },
  { iso2: 'si', dial: '+386', nameEs: 'Eslovenia', nameEn: 'Slovenia' },
  { iso2: 'es', dial: '+34', nameEs: 'España', nameEn: 'Spain' },
  { iso2: 'us', dial: '+1', nameEs: 'Estados Unidos', nameEn: 'United States' },
  { iso2: 'ee', dial: '+372', nameEs: 'Estonia', nameEn: 'Estonia' },
  { iso2: 'sz', dial: '+268', nameEs: 'Esuatini', nameEn: 'Eswatini' },
  { iso2: 'et', dial: '+251', nameEs: 'Etiopía', nameEn: 'Ethiopia' },
  { iso2: 'ph', dial: '+63', nameEs: 'Filipinas', nameEn: 'Philippines' },
  { iso2: 'fi', dial: '+358', nameEs: 'Finlandia', nameEn: 'Finland' },
  { iso2: 'fj', dial: '+679', nameEs: 'Fiyi', nameEn: 'Fiji' },
  { iso2: 'fr', dial: '+33', nameEs: 'Francia', nameEn: 'France' },
  { iso2: 'ga', dial: '+241', nameEs: 'Gabón', nameEn: 'Gabon' },
  { iso2: 'gm', dial: '+220', nameEs: 'Gambia', nameEn: 'Gambia' },
  { iso2: 'ge', dial: '+995', nameEs: 'Georgia', nameEn: 'Georgia' },
  { iso2: 'gh', dial: '+233', nameEs: 'Ghana', nameEn: 'Ghana' },
  { iso2: 'gi', dial: '+350', nameEs: 'Gibraltar', nameEn: 'Gibraltar' },
  { iso2: 'gd', dial: '+1473', nameEs: 'Granada', nameEn: 'Grenada' },
  { iso2: 'gr', dial: '+30', nameEs: 'Grecia', nameEn: 'Greece' },
  { iso2: 'gl', dial: '+299', nameEs: 'Groenlandia', nameEn: 'Greenland' },
  { iso2: 'gp', dial: '+590', nameEs: 'Guadalupe', nameEn: 'Guadeloupe' },
  { iso2: 'gu', dial: '+1671', nameEs: 'Guam', nameEn: 'Guam' },
  { iso2: 'gt', dial: '+502', nameEs: 'Guatemala', nameEn: 'Guatemala' },
  { iso2: 'gf', dial: '+594', nameEs: 'Guayana Francesa', nameEn: 'French Guiana' },
  { iso2: 'gg', dial: '+44', nameEs: 'Guernsey', nameEn: 'Guernsey' },
  { iso2: 'gn', dial: '+224', nameEs: 'Guinea', nameEn: 'Guinea' },
  { iso2: 'gq', dial: '+240', nameEs: 'Guinea Ecuatorial', nameEn: 'Equatorial Guinea' },
  { iso2: 'gw', dial: '+245', nameEs: 'Guinea-Bisáu', nameEn: 'Guinea-Bissau' },
  { iso2: 'gy', dial: '+592', nameEs: 'Guyana', nameEn: 'Guyana' },
  { iso2: 'ht', dial: '+509', nameEs: 'Haití', nameEn: 'Haiti' },
  { iso2: 'hn', dial: '+504', nameEs: 'Honduras', nameEn: 'Honduras' },
  { iso2: 'hk', dial: '+852', nameEs: 'Hong Kong', nameEn: 'Hong Kong' },
  { iso2: 'hu', dial: '+36', nameEs: 'Hungría', nameEn: 'Hungary' },
  { iso2: 'in', dial: '+91', nameEs: 'India', nameEn: 'India' },
  { iso2: 'id', dial: '+62', nameEs: 'Indonesia', nameEn: 'Indonesia' },
  { iso2: 'iq', dial: '+964', nameEs: 'Irak', nameEn: 'Iraq' },
  { iso2: 'ir', dial: '+98', nameEs: 'Irán', nameEn: 'Iran' },
  { iso2: 'ie', dial: '+353', nameEs: 'Irlanda', nameEn: 'Ireland' },
  { iso2: 'bv', dial: '+47', nameEs: 'Isla Bouvet', nameEn: 'Bouvet Island' },
  { iso2: 'im', dial: '+44', nameEs: 'Isla de Man', nameEn: 'Isle of Man' },
  { iso2: 'cx', dial: '+61', nameEs: 'Isla de Navidad', nameEn: 'Christmas Island' },
  { iso2: 'is', dial: '+354', nameEs: 'Islandia', nameEn: 'Iceland' },
  { iso2: 'ky', dial: '+1345', nameEs: 'Islas Caimán', nameEn: 'Cayman Islands' },
  { iso2: 'ck', dial: '+682', nameEs: 'Islas Cook', nameEn: 'Cook Islands' },
  { iso2: 'fo', dial: '+298', nameEs: 'Islas Feroe', nameEn: 'Faroe Islands' },
  { iso2: 'fk', dial: '+500', nameEs: 'Islas Malvinas', nameEn: 'Falkland Islands' },
  { iso2: 'mp', dial: '+1670', nameEs: 'Islas Marianas del Norte', nameEn: 'Northern Mariana Islands' },
  { iso2: 'mh', dial: '+692', nameEs: 'Islas Marshall', nameEn: 'Marshall Islands' },
  { iso2: 'sb', dial: '+677', nameEs: 'Islas Salomón', nameEn: 'Solomon Islands' },
  { iso2: 'tc', dial: '+1649', nameEs: 'Islas Turcas y Caicos', nameEn: 'Turks and Caicos Islands' },
  { iso2: 'vg', dial: '+1284', nameEs: 'Islas Vírgenes (UK)', nameEn: 'British Virgin Islands' },
  { iso2: 'vi', dial: '+1340', nameEs: 'Islas Vírgenes (US)', nameEn: 'U.S. Virgin Islands' },
  { iso2: 'il', dial: '+972', nameEs: 'Israel', nameEn: 'Israel' },
  { iso2: 'it', dial: '+39', nameEs: 'Italia', nameEn: 'Italy' },
  { iso2: 'jm', dial: '+1876', nameEs: 'Jamaica', nameEn: 'Jamaica' },
  { iso2: 'jp', dial: '+81', nameEs: 'Japón', nameEn: 'Japan' },
  { iso2: 'je', dial: '+44', nameEs: 'Jersey', nameEn: 'Jersey' },
  { iso2: 'jo', dial: '+962', nameEs: 'Jordania', nameEn: 'Jordan' },
  { iso2: 'kz', dial: '+7', nameEs: 'Kazajistán', nameEn: 'Kazakhstan' },
  { iso2: 'ke', dial: '+254', nameEs: 'Kenia', nameEn: 'Kenya' },
  { iso2: 'kg', dial: '+996', nameEs: 'Kirguistán', nameEn: 'Kyrgyzstan' },
  { iso2: 'ki', dial: '+686', nameEs: 'Kiribati', nameEn: 'Kiribati' },
  { iso2: 'xk', dial: '+383', nameEs: 'Kosovo', nameEn: 'Kosovo' },
  { iso2: 'kw', dial: '+965', nameEs: 'Kuwait', nameEn: 'Kuwait' },
  { iso2: 'la', dial: '+856', nameEs: 'Laos', nameEn: 'Laos' },
  { iso2: 'ls', dial: '+266', nameEs: 'Lesoto', nameEn: 'Lesotho' },
  { iso2: 'lv', dial: '+371', nameEs: 'Letonia', nameEn: 'Latvia' },
  { iso2: 'lr', dial: '+231', nameEs: 'Liberia', nameEn: 'Liberia' },
  { iso2: 'ly', dial: '+218', nameEs: 'Libia', nameEn: 'Libya' },
  { iso2: 'li', dial: '+423', nameEs: 'Liechtenstein', nameEn: 'Liechtenstein' },
  { iso2: 'lt', dial: '+370', nameEs: 'Lituania', nameEn: 'Lithuania' },
  { iso2: 'lu', dial: '+352', nameEs: 'Luxemburgo', nameEn: 'Luxembourg' },
  { iso2: 'lb', dial: '+961', nameEs: 'Líbano', nameEn: 'Lebanon' },
  { iso2: 'mo', dial: '+853', nameEs: 'Macao', nameEn: 'Macau' },
  { iso2: 'mk', dial: '+389', nameEs: 'Macedonia del Norte', nameEn: 'North Macedonia' },
  { iso2: 'mg', dial: '+261', nameEs: 'Madagascar', nameEn: 'Madagascar' },
  { iso2: 'my', dial: '+60', nameEs: 'Malasia', nameEn: 'Malaysia' },
  { iso2: 'mw', dial: '+265', nameEs: 'Malaui', nameEn: 'Malawi' },
  { iso2: 'mv', dial: '+960', nameEs: 'Maldivas', nameEn: 'Maldives' },
  { iso2: 'ml', dial: '+223', nameEs: 'Malí', nameEn: 'Mali' },
  { iso2: 'mt', dial: '+356', nameEs: 'Malta', nameEn: 'Malta' },
  { iso2: 'ma', dial: '+212', nameEs: 'Marruecos', nameEn: 'Morocco' },
  { iso2: 'mq', dial: '+596', nameEs: 'Martinica', nameEn: 'Martinique' },
  { iso2: 'mu', dial: '+230', nameEs: 'Mauricio', nameEn: 'Mauritius' },
  { iso2: 'mr', dial: '+222', nameEs: 'Mauritania', nameEn: 'Mauritania' },
  { iso2: 'yt', dial: '+262', nameEs: 'Mayotte', nameEn: 'Mayotte' },
  { iso2: 'mx', dial: '+52', nameEs: 'México', nameEn: 'Mexico' },
  { iso2: 'fm', dial: '+691', nameEs: 'Micronesia', nameEn: 'Micronesia' },
  { iso2: 'md', dial: '+373', nameEs: 'Moldavia', nameEn: 'Moldova' },
  { iso2: 'mc', dial: '+377', nameEs: 'Mónaco', nameEn: 'Monaco' },
  { iso2: 'mn', dial: '+976', nameEs: 'Mongolia', nameEn: 'Mongolia' },
  { iso2: 'me', dial: '+382', nameEs: 'Montenegro', nameEn: 'Montenegro' },
  { iso2: 'ms', dial: '+1664', nameEs: 'Montserrat', nameEn: 'Montserrat' },
  { iso2: 'mz', dial: '+258', nameEs: 'Mozambique', nameEn: 'Mozambique' },
  { iso2: 'mm', dial: '+95', nameEs: 'Myanmar', nameEn: 'Myanmar' },
  { iso2: 'na', dial: '+264', nameEs: 'Namibia', nameEn: 'Namibia' },
  { iso2: 'nr', dial: '+674', nameEs: 'Nauru', nameEn: 'Nauru' },
  { iso2: 'np', dial: '+977', nameEs: 'Nepal', nameEn: 'Nepal' },
  { iso2: 'ni', dial: '+505', nameEs: 'Nicaragua', nameEn: 'Nicaragua' },
  { iso2: 'ne', dial: '+227', nameEs: 'Níger', nameEn: 'Niger' },
  { iso2: 'ng', dial: '+234', nameEs: 'Nigeria', nameEn: 'Nigeria' },
  { iso2: 'nu', dial: '+683', nameEs: 'Niue', nameEn: 'Niue' },
  { iso2: 'nf', dial: '+672', nameEs: 'Norfolk', nameEn: 'Norfolk Island' },
  { iso2: 'no', dial: '+47', nameEs: 'Noruega', nameEn: 'Norway' },
  { iso2: 'nc', dial: '+687', nameEs: 'Nueva Caledonia', nameEn: 'New Caledonia' },
  { iso2: 'nz', dial: '+64', nameEs: 'Nueva Zelanda', nameEn: 'New Zealand' },
  { iso2: 'om', dial: '+968', nameEs: 'Omán', nameEn: 'Oman' },
  { iso2: 'nl', dial: '+31', nameEs: 'Países Bajos', nameEn: 'Netherlands' },
  { iso2: 'pk', dial: '+92', nameEs: 'Pakistán', nameEn: 'Pakistan' },
  { iso2: 'pw', dial: '+680', nameEs: 'Palaos', nameEn: 'Palau' },
  { iso2: 'ps', dial: '+970', nameEs: 'Palestina', nameEn: 'Palestine' },
  { iso2: 'pa', dial: '+507', nameEs: 'Panamá', nameEn: 'Panama' },
  { iso2: 'pg', dial: '+675', nameEs: 'Papúa Nueva Guinea', nameEn: 'Papua New Guinea' },
  { iso2: 'py', dial: '+595', nameEs: 'Paraguay', nameEn: 'Paraguay' },
  { iso2: 'pe', dial: '+51', nameEs: 'Perú', nameEn: 'Peru' },
  { iso2: 'pf', dial: '+689', nameEs: 'Polinesia Francesa', nameEn: 'French Polynesia' },
  { iso2: 'pl', dial: '+48', nameEs: 'Polonia', nameEn: 'Poland' },
  { iso2: 'pt', dial: '+351', nameEs: 'Portugal', nameEn: 'Portugal' },
  { iso2: 'pr', dial: '+1', nameEs: 'Puerto Rico', nameEn: 'Puerto Rico' },
  { iso2: 'gb', dial: '+44', nameEs: 'Reino Unido', nameEn: 'United Kingdom' },
  { iso2: 'cf', dial: '+236', nameEs: 'República Centroafricana', nameEn: 'Central African Republic' },
  { iso2: 'cz', dial: '+420', nameEs: 'República Checa', nameEn: 'Czech Republic' },
  { iso2: 'do', dial: '+1', nameEs: 'República Dominicana', nameEn: 'Dominican Republic' },
  { iso2: 're', dial: '+262', nameEs: 'Reunión', nameEn: 'Réunion' },
  { iso2: 'rw', dial: '+250', nameEs: 'Ruanda', nameEn: 'Rwanda' },
  { iso2: 'ro', dial: '+40', nameEs: 'Rumanía', nameEn: 'Romania' },
  { iso2: 'ru', dial: '+7', nameEs: 'Rusia', nameEn: 'Russia' },
  { iso2: 'eh', dial: '+212', nameEs: 'Sáhara Occidental', nameEn: 'Western Sahara' },
  { iso2: 'ws', dial: '+685', nameEs: 'Samoa', nameEn: 'Samoa' },
  { iso2: 'as', dial: '+1684', nameEs: 'Samoa Americana', nameEn: 'American Samoa' },
  { iso2: 'bl', dial: '+590', nameEs: 'San Bartolomé', nameEn: 'Saint Barthélemy' },
  { iso2: 'kn', dial: '+1869', nameEs: 'San Cristóbal y Nieves', nameEn: 'Saint Kitts and Nevis' },
  { iso2: 'sm', dial: '+378', nameEs: 'San Marino', nameEn: 'San Marino' },
  { iso2: 'mf', dial: '+590', nameEs: 'San Martín', nameEn: 'Saint Martin' },
  { iso2: 'pm', dial: '+508', nameEs: 'San Pedro y Miquelón', nameEn: 'Saint Pierre and Miquelon' },
  { iso2: 'vc', dial: '+1784', nameEs: 'San Vicente y las Granadinas', nameEn: 'Saint Vincent and the Grenadines' },
  { iso2: 'sh', dial: '+290', nameEs: 'Santa Elena', nameEn: 'Saint Helena' },
  { iso2: 'lc', dial: '+1758', nameEs: 'Santa Lucía', nameEn: 'Saint Lucia' },
  { iso2: 'st', dial: '+239', nameEs: 'Santo Tomé y Príncipe', nameEn: 'São Tomé and Príncipe' },
  { iso2: 'sn', dial: '+221', nameEs: 'Senegal', nameEn: 'Senegal' },
  { iso2: 'rs', dial: '+381', nameEs: 'Serbia', nameEn: 'Serbia' },
  { iso2: 'sc', dial: '+248', nameEs: 'Seychelles', nameEn: 'Seychelles' },
  { iso2: 'sl', dial: '+232', nameEs: 'Sierra Leona', nameEn: 'Sierra Leone' },
  { iso2: 'sg', dial: '+65', nameEs: 'Singapur', nameEn: 'Singapore' },
  { iso2: 'sx', dial: '+1721', nameEs: 'Sint Maarten', nameEn: 'Sint Maarten' },
  { iso2: 'sy', dial: '+963', nameEs: 'Siria', nameEn: 'Syria' },
  { iso2: 'so', dial: '+252', nameEs: 'Somalia', nameEn: 'Somalia' },
  { iso2: 'lk', dial: '+94', nameEs: 'Sri Lanka', nameEn: 'Sri Lanka' },
  { iso2: 'za', dial: '+27', nameEs: 'Sudáfrica', nameEn: 'South Africa' },
  { iso2: 'sd', dial: '+249', nameEs: 'Sudán', nameEn: 'Sudan' },
  { iso2: 'ss', dial: '+211', nameEs: 'Sudán del Sur', nameEn: 'South Sudan' },
  { iso2: 'se', dial: '+46', nameEs: 'Suecia', nameEn: 'Sweden' },
  { iso2: 'ch', dial: '+41', nameEs: 'Suiza', nameEn: 'Switzerland' },
  { iso2: 'sr', dial: '+597', nameEs: 'Surinam', nameEn: 'Suriname' },
  { iso2: 'sj', dial: '+47', nameEs: 'Svalbard y Jan Mayen', nameEn: 'Svalbard and Jan Mayen' },
  { iso2: 'th', dial: '+66', nameEs: 'Tailandia', nameEn: 'Thailand' },
  { iso2: 'tw', dial: '+886', nameEs: 'Taiwán', nameEn: 'Taiwan' },
  { iso2: 'tz', dial: '+255', nameEs: 'Tanzania', nameEn: 'Tanzania' },
  { iso2: 'tj', dial: '+992', nameEs: 'Tayikistán', nameEn: 'Tajikistan' },
  { iso2: 'io', dial: '+246', nameEs: 'Territorio Británico del Océano Índico', nameEn: 'British Indian Ocean Territory' },
  { iso2: 'tf', dial: '+262', nameEs: 'Territorios Franceses del Sur', nameEn: 'French Southern Territories' },
  { iso2: 'tl', dial: '+670', nameEs: 'Timor Oriental', nameEn: 'Timor-Leste' },
  { iso2: 'tg', dial: '+228', nameEs: 'Togo', nameEn: 'Togo' },
  { iso2: 'tk', dial: '+690', nameEs: 'Tokelau', nameEn: 'Tokelau' },
  { iso2: 'to', dial: '+676', nameEs: 'Tonga', nameEn: 'Tonga' },
  { iso2: 'tt', dial: '+1868', nameEs: 'Trinidad y Tobago', nameEn: 'Trinidad and Tobago' },
  { iso2: 'tn', dial: '+216', nameEs: 'Túnez', nameEn: 'Tunisia' },
  { iso2: 'tm', dial: '+993', nameEs: 'Turkmenistán', nameEn: 'Turkmenistan' },
  { iso2: 'tr', dial: '+90', nameEs: 'Turquía', nameEn: 'Turkey' },
  { iso2: 'tv', dial: '+688', nameEs: 'Tuvalu', nameEn: 'Tuvalu' },
  { iso2: 'ua', dial: '+380', nameEs: 'Ucrania', nameEn: 'Ukraine' },
  { iso2: 'ug', dial: '+256', nameEs: 'Uganda', nameEn: 'Uganda' },
  { iso2: 'uy', dial: '+598', nameEs: 'Uruguay', nameEn: 'Uruguay' },
  { iso2: 'uz', dial: '+998', nameEs: 'Uzbekistán', nameEn: 'Uzbekistan' },
  { iso2: 'vu', dial: '+678', nameEs: 'Vanuatu', nameEn: 'Vanuatu' },
  { iso2: 've', dial: '+58', nameEs: 'Venezuela', nameEn: 'Venezuela' },
  { iso2: 'vn', dial: '+84', nameEs: 'Vietnam', nameEn: 'Vietnam' },
  { iso2: 'wf', dial: '+681', nameEs: 'Wallis y Futuna', nameEn: 'Wallis and Futuna' },
  { iso2: 'ye', dial: '+967', nameEs: 'Yemen', nameEn: 'Yemen' },
  { iso2: 'dj', dial: '+253', nameEs: 'Yibuti', nameEn: 'Djibouti' },
  { iso2: 'zm', dial: '+260', nameEs: 'Zambia', nameEn: 'Zambia' },
  { iso2: 'zw', dial: '+263', nameEs: 'Zimbabue', nameEn: 'Zimbabwe' },
];

/** Idioma UI: español por defecto; inglés cuando `lang === 'en'`. */
export function getSortedCountryDialOptions(lang: 'es' | 'en'): readonly CountryDialOption[] {
  const useEn = lang === 'en';
  const locale = useEn ? 'en' : 'es';
  return [...RAW]
    .map((r) => toDialOption(r, useEn))
    .sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: 'base' }));
}

/** Top 10 fijas + resto alfabético (sin repetir). */
export function getGroupedCountryDialOptions(lang: 'es' | 'en'): CountryDialGrouped {
  const useEn = lang === 'en';
  const locale = useEn ? 'en' : 'es';
  const byIso = new Map<string, CountryDialOption>(
    RAW.map((r) => [r.iso2, toDialOption(r, useEn)]),
  );

  const popular: CountryDialOption[] = [];
  for (const iso of POPULAR_ISO2_ORDER) {
    const opt = byIso.get(iso);
    if (opt) {
      popular.push(opt);
    }
  }

  const popularSet = new Set(popular.map((p) => p.iso2));
  const rest = [...RAW]
    .map((r) => toDialOption(r, useEn))
    .filter((o) => !popularSet.has(o.iso2))
    .sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: 'base' }));

  return { popular, rest };
}
