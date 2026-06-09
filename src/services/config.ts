import { supabase } from '../lib/supabase';
import type { SiteConfig } from '../types';

const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: '+50588888888',
  salesEmail: 'ventas@c3nicaragua.com',
  companyName: 'C3 Nicaragua',
  address: 'Managua, Nicaragua',
  minDistributorQty: 5,
  heroImage: '',
};

export async function fetchPublicConfig(): Promise<SiteConfig> {
  try {
    const { data, error } = await supabase
      .from('public_config')
      .select('key, value');

    if (error) {
      console.warn('No se pudo cargar config, usando defaults:', error.message);
      return DEFAULT_CONFIG;
    }

    const configMap: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      if (typeof row.value === 'string') {
        try {
          configMap[row.key] = JSON.parse(row.value);
        } catch {
          configMap[row.key] = row.value;
        }
      } else {
        configMap[row.key] = row.value;
      }
    });

    return {
      whatsappNumber: configMap.whatsapp_number || DEFAULT_CONFIG.whatsappNumber,
      salesEmail: configMap.sales_email || DEFAULT_CONFIG.salesEmail,
      companyName: configMap.company_name || DEFAULT_CONFIG.companyName,
      address: configMap.address || DEFAULT_CONFIG.address,
      minDistributorQty: Number(configMap.min_distributor_qty) || DEFAULT_CONFIG.minDistributorQty,
      heroImage: configMap.hero_image || DEFAULT_CONFIG.heroImage,
    };
  } catch (err) {
    console.warn('Error al cargar config, usando defaults:', err);
    return DEFAULT_CONFIG;
  }
}

// Admin: obtener toda la config
export async function fetchAllConfig(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('site_config')
    .select('*');

  if (error) throw error;

  const configMap: Record<string, any> = {};
  (data || []).forEach((row: any) => {
    if (typeof row.value === 'string') {
      try {
        configMap[row.key] = JSON.parse(row.value);
      } catch {
        configMap[row.key] = row.value;
      }
    } else {
      configMap[row.key] = row.value;
    }
  });
  return configMap;
}

// Admin: actualizar config
export async function updateConfigValue(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('site_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) throw error;
}
