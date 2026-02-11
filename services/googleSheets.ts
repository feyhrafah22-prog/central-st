
/**
 * SERVIÇO DE INTEGRAÇÃO GOOGLE SHEETS
 * Versão V5 - Resiliência Máxima
 */

export class GoogleSheetsService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiUrl || !this.apiUrl.startsWith('https://script.google.com')) return false;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.apiUrl}?action=read&sheet=users`, {
        signal: controller.signal,
        method: 'GET',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async read(sheetName: string): Promise<any[]> {
    if (!this.apiUrl || !this.apiUrl.includes('/exec')) return [];
    
    try {
      const response = await fetch(`${this.apiUrl}?action=read&sheet=${sheetName}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store'
      });

      if (!response.ok) return [];
      
      const text = await response.text();
      // Se retornar HTML, é a tela de login do Google (erro de permissão 'Anyone')
      if (text.trim().startsWith('<')) return [];

      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    } catch (error) {
      // Falha silenciosa para não interromper a experiência do usuário
      console.warn(`Sheets: Aba ${sheetName} operando em modo offline.`);
      return [];
    }
  }

  async write(sheetName: string, data: any): Promise<boolean> {
    if (!this.apiUrl) return false;
    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'write', sheet: sheetName, data })
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async update(sheetName: string, id: string, data: any): Promise<boolean> {
    if (!this.apiUrl) return false;
    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'update', sheet: sheetName, id, data })
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
