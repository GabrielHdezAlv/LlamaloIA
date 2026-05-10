import { OutboundQueueLead } from '../../../../shared/models/agent.model';

function normalizeHeaderToken(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '')
    .toLowerCase();
}

function digitCount(s: string): number {
  return s.replace(/\D/g, '').length;
}

/** Misma normalización que la importación legacy por primera columna. */
export function normalizeImportedPhone(raw: string): string | null {
  const cell = raw.trim().replace(/^["']+|["']+$/g, '');
  const compact = cell.replace(/\s/g, '');
  const d = digitCount(compact);
  if (d < 8 || d > 18) return null;
  return compact.startsWith('+')
    ? `+${compact.slice(1).replace(/\D/g, '')}`
    : compact.replace(/\D/g, '');
}

function detectDelimiter(line: string): '\t' | ';' | ',' {
  if (line.includes('\t')) return '\t';
  const sc = line.split(';').length;
  const co = line.split(',').length;
  return sc >= co ? ';' : ',';
}

/** División simple respetando comillas dobles. */
function splitCsvLine(line: string, delim: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === delim) {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  cells.push(cur.trim());
  return cells.map((c) => c.replace(/^["']+|["']+$/g, ''));
}

type LeadField = Exclude<keyof OutboundQueueLead, 'phone'>;

function headerToField(h: string): LeadField | 'phone' | null {
  const n = normalizeHeaderToken(h);
  if (
    /^(tel|telefono|telefone|phone|movil|mobile|numero|number|msisdn)$/.test(
      n,
    ) ||
    n.startsWith('phone')
  ) {
    return 'phone';
  }
  if (
    n.includes('abandon') ||
    n === 'eventat' ||
    n === 'event_at' ||
    n === 'fecha' ||
    n.includes('fechaabandono')
  ) {
    return 'eventAt';
  }
  if (
    n.includes('checkout') ||
    n === 'cartid' ||
    n.includes('externalid') ||
    n === 'external_event_id'
  ) {
    return 'externalEventId';
  }
  if (
    n === 'ticket' ||
    n === 'importe' ||
    n === 'amount' ||
    n === 'valor' ||
    n.includes('contactticket')
  ) {
    return 'contactTicket';
  }
  if (n.includes('customerstate') || n === 'tipo' || n === 'estado') {
    return 'customerState';
  }
  if (n.includes('carttotal') || n === 'total' || n.includes('valorcarrito')) {
    return 'cartTotal';
  }
  if (n.includes('cartitems') || n === 'items' || n.includes('itemcount')) {
    return 'cartItemCount';
  }
  if (
    n.includes('handle') ||
    n === 'sku' ||
    n === 'product' ||
    n.includes('producthandle')
  ) {
    return 'productHandle';
  }
  return null;
}

function parseOptionalNumber(cell: string): number | undefined {
  const t = cell.replace(',', '.').trim();
  if (!t) return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalInt(cell: string): number | undefined {
  const t = cell.trim();
  if (!t) return undefined;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

export interface ParsedOutboundCsv {
  phones: string[];
  leads?: OutboundQueueLead[];
}

/**
 * Si el CSV tiene cabecera reconocida (incl. columna `phone` / `telefono`), devuelve `leads`.
 * Si no, misma extracción que la primera columna (compatibilidad).
 */
export function parseOutboundDelimitedImport(text: string): ParsedOutboundCsv {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.trimEnd()).filter((l) => l.trim());
  if (lines.length === 0) return { phones: [] };

  const delim = detectDelimiter(lines[0]);
  const headerCells = splitCsvLine(lines[0], delim);
  const fieldByCol: Array<'phone' | LeadField | null> = headerCells.map(
    (h) => headerToField(h),
  );
  const phoneCol = fieldByCol.indexOf('phone');
  const firstRowLooksLikeHeader = headerCells.some(
    (cell) => headerToField(cell) !== null,
  );

  if (phoneCol < 0 || !firstRowLooksLikeHeader) {
    return legacyFirstColumnPhones(text);
  }

  const leads: OutboundQueueLead[] = [];
  const phoneSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i], delim);
    if (!cells.some((c) => c.trim())) continue;

    const row: Partial<OutboundQueueLead> = {};
    for (let c = 0; c < fieldByCol.length; c++) {
      const f = fieldByCol[c];
      if (!f || c >= cells.length) continue;
      const val = cells[c]?.trim() ?? '';
      if (!val) continue;
      if (f === 'phone') {
        const p = normalizeImportedPhone(val);
        if (p) row.phone = p;
        continue;
      }
      if (f === 'contactTicket' || f === 'cartTotal') {
        const n = parseOptionalNumber(val);
        if (n !== undefined) (row as Record<string, unknown>)[f] = n;
        continue;
      }
      if (f === 'cartItemCount') {
        const n = parseOptionalInt(val);
        if (n !== undefined) row.cartItemCount = n;
        continue;
      }
      if (f === 'customerState') {
        const v = val.toLowerCase();
        if (v === 'new' || v === 'nuevo') row.customerState = 'new';
        else if (v === 'recurring' || v === 'recurrente')
          row.customerState = 'recurring';
        else row.customerState = val;
        continue;
      }
      (row as Record<string, unknown>)[f] = val;
    }

    if (!row.phone) continue;
    leads.push(row as OutboundQueueLead);
    phoneSet.add(row.phone);
  }

  if (leads.length === 0) {
    return legacyFirstColumnPhones(text);
  }

  return { phones: [...phoneSet], leads };
}

function legacyFirstColumnPhones(text: string): ParsedOutboundCsv {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.trimEnd()).filter((l) => l.trim());
  if (lines.length === 0) return { phones: [] };

  const firstCell = (line: string): string => {
    const t = line.trim();
    if (!t) return '';
    let cell: string;
    if (t.includes('\t')) cell = t.split('\t')[0] ?? '';
    else if (t.includes(';')) cell = t.split(';')[0] ?? '';
    else cell = t.split(',')[0] ?? '';
    return cell.trim().replace(/^["']+|["']+$/g, '');
  };

  let start = 0;
  const fc = normalizeHeaderToken(firstCell(lines[0]));
  if (
    /^(tel|telefono|phone|movil|numero|msisdn|number)$/.test(fc) ||
    fc.startsWith('phone') ||
    fc.startsWith('tel')
  ) {
    start = 1;
  }

  const out = new Set<string>();
  for (let i = start; i < lines.length; i++) {
    const cell = firstCell(lines[i]);
    const p = normalizeImportedPhone(cell);
    if (p) out.add(p);
  }
  return { phones: [...out], leads: undefined };
}
