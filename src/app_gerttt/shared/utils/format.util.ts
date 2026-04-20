export class FormatUtil {
  static formatInteger(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';

    const n = typeof value === 'number' ? value : Number(String(value).trim());
    if (Number.isNaN(n)) return '';

    return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  static formatInteger2Digitos(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';

    const n = typeof value === 'number' ? value : Number(String(value).trim());
    if (Number.isNaN(n)) return '';

    return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
