import { RawCustomerChannel, RawCustomerLead } from '../types';

const parseCsv = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim())) {
      rows.push(row);
    }
  }

  return rows;
};

const toReceivedAt = (dateValue: string, timeValue: string) => {
  const [month, day, year] = dateValue.split('/').map((item) => Number(item));
  const safeTime = timeValue || '00:00:00';

  if (!month || !day || !year) {
    return new Date().toISOString();
  }

  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${safeTime}+08:00`).toISOString();
};

export const parseTikTokLeadCsv = (text: string): RawCustomerLead[] => {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''));
  const headers = rows[0]?.map((header) => header.trim()) || [];
  const importedAt = new Date().toISOString();

  if (!headers.includes('Lead ID') || !headers.includes('Phone number')) {
    throw new Error('CSV header does not match TikTok Lead Manager export.');
  }

  return rows.slice(1).map((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()]));
    const leadId = record['Lead ID'] || `${record['Phone number']}-${record['Received date']}-${record['Received time']}`;

    return {
      id: `RAW-TIKTOK-${leadId}`,
      channel: 'TikTok' as RawCustomerChannel,
      lead_id: record['Lead ID'] || '',
      username: record.Username || '',
      received_at: toReceivedAt(record['Received date'] || '', record['Received time'] || ''),
      raw_status: record.Status || 'Raw',
      source_traffic: record['Source traffic'] || '',
      source_action: record['Source action'] || '',
      source_scenario: record['Source scenario'] || '',
      name: record.Name || '',
      ic_no: record['IC number'] || record['IC Number'] || record.IC || record['Identity number'] || '',
      phone_no: record['Phone number'] || '',
      account_number: record['Account number'] || record['Account Number'] || record['Bank account'] || '',
      email: record.Email || '',
      work_phone: record['Work phone'] || '',
      work_email: record['Work email'] || '',
      whatsapp: record.WhatsApp || '',
      messenger: record.Messenger || '',
      instagram: record.Instagram || '',
      facebook: record.Facebook || '',
      tiktok: record.TikTok || '',
      city: record.City || '',
      state: record['Province/State'] || '',
      country: record.Country || '',
      company_name: record['Company name'] || '',
      job_title: record['Job title'] || '',
      imported_at: importedAt,
      entry_method: 'CSV Import'
    };
  });
};
