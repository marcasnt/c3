import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, Star, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useApp } from '../../store';
import { BRAND_INFO } from '../../data/products';
import type { Product, Brand, Category } from '../../types';
import { ProductImage } from '../../components/ProductImage';
import { cn } from '../../utils/cn';
import { uploadProductImage } from '../../services/products';

const CATEGORIES: Category[] = ['Con tapa y popote', 'Con asa', 'Botellas', 'Kids / Disney', 'Genéricos', 'Accesorios'];
const BRANDS: Brand[] = ['Stanley', 'YETI', 'Owala', 'Lululemon', 'Thermos', 'Disney', 'Genéricos'];

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión de Productos
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{products.length} productos en el catálogo</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-left text-xs uppercase text-gray-500 dark:text-slate-400">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 hidden md:table-cell">Marca</th>
                <th className="p-3 hidden lg:table-cell">Categoría</th>
                <th className="p-3 hidden sm:table-cell">Cap.</th>
                <th className="p-3">P. Público</th>
                <th className="p-3 hidden md:table-cell">P. Distrib.</th>
                <th className="p-3 hidden sm:table-cell">Stock</th>
                <th className="p-3 hidden lg:table-cell">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-slate-700 rounded-lg shrink-0 border border-gray-100 dark:border-slate-600 p-1">
                        <ProductImage product={p} size="full" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0A1B2A] dark:text-slate-100 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400">{p.code}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 md:hidden">{p.brand} · {p.capacity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-xs font-semibold" style={{ color: BRAND_INFO[p.brand].color }}>
                      {p.brand}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-xs text-gray-600 dark:text-slate-300">{p.category}</td>
                  <td className="p-3 hidden sm:table-cell text-xs dark:text-slate-300">{p.capacity}</td>
                  <td className="p-3 font-semibold dark:text-slate-100">C$ {p.pricePublic.toLocaleString('es-NI')}</td>
                  <td className="p-3 hidden md:table-cell font-semibold text-emerald-700 dark:text-emerald-400">C$ {p.priceDistributor.toLocaleString('es-NI')}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      p.stock > 20 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        p.stock > 5 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                          'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    )}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      {p.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      {p.isNew && <span className="text-[9px] font-bold bg-[#00BFA6] text-white px-1.5 py-0.5 rounded">N</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-[#2563EB]"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || showNew) && (
        <ProductModal
          product={editing}
          onClose={() => { setEditing(null); setShowNew(false); }}
          onSave={p => {
            if (editing) updateProduct(editing.id, p);
            else addProduct({ ...p, id: `p-${Date.now()}` });
            setEditing(null);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Product>(product ?? {
    id: '',
    code: '',
    name: '',
    brand: 'Stanley',
    category: 'Con asa',
    capacity: '30 oz',
    pricePublic: 0,
    priceDistributor: 0,
    colors: [{ name: 'Negro', hex: '#1A1A1A' }],
    description: '',
    features: [],
    image: '',
    stock: 0,
    packaging: 'Caja individual',
  });

  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorImage, setColorImage] = useState('');
  const [uploadingColor, setUploadingColor] = useState(false);
  const colorFileInputRef = useRef<HTMLInputElement>(null);
  const [feature, setFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }
    setUploadingColor(true);
    try {
      const url = await uploadProductImage(file, `${form.code || 'temp'}-color-${colorName || Date.now()}`);
      setColorImage(url);
    } catch (err: any) {
      alert('Error al subir imagen de color: ' + (err?.message || 'desconocido'));
    } finally {
      setUploadingColor(false);
    }
  };

  const addColor = () => {
    if (colorName) {
      setForm({ ...form, colors: [...form.colors, { name: colorName, hex: colorHex, imageUrl: colorImage || undefined }] });
      setColorName('');
      setColorImage('');
    }
  };

  const addFeature = () => {
    if (feature) {
      setForm({ ...form, features: [...form.features, feature] });
      setFeature('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'imageUrl2' | 'imageUrl3') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadProductImage(file, `${form.code || 'temp'}-${field}`);
      setForm({ ...form, [field]: url });
    } catch (err: any) {
      alert('Error al subir imagen: ' + (err?.message || 'desconocido'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="font-bold text-lg text-[#0A1B2A] dark:text-slate-100">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 dark:text-slate-300" />
          </button>
        </div>

        <form
          onSubmit={async e => {
            e.preventDefault();
            setSaving(true);
            try { await onSave(form); } finally { setSaving(false); }
          }}
          className="p-5"
        >
          {/* Image upload + preview */}
          <div className="mb-5 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-4 flex items-center gap-1 border-b border-gray-200 dark:border-slate-600 pb-2">
              <ImageIcon className="w-3.5 h-3.5" /> Vistas del Producto (Máx. 3 imágenes)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* VISTA PRINCIPAL */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">Vista Principal</p>
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-lg shrink-0 border-2 border-dashed border-gray-300 dark:border-slate-500 p-1 overflow-hidden flex items-center justify-center mb-3">
                  <ProductImage product={form} size="full" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'imageUrl')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir archivo
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: undefined })}
                    className="text-[10px] text-red-500 hover:underline mt-1.5"
                  >
                    Quitar imagen
                  </button>
                )}
                <input
                  type="url"
                  value={form.imageUrl?.startsWith('data:') ? '' : (form.imageUrl || '')}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value || undefined })}
                  className="w-full mt-2 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-[11px] bg-white dark:bg-slate-700 dark:text-slate-100"
                  placeholder="O pega URL de imagen..."
                />
              </div>

              {/* VISTA SECUNDARIA 2 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">Vista Secundaria 2</p>
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-lg shrink-0 border-2 border-dashed border-gray-300 dark:border-slate-500 p-1 overflow-hidden flex items-center justify-center mb-3">
                  <ProductImage product={form} size="full" imageUrlOverride={form.imageUrl2} />
                </div>
                <input
                  ref={fileInputRef2}
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'imageUrl2')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef2.current?.click()}
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir archivo
                </button>
                {form.imageUrl2 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl2: undefined })}
                    className="text-[10px] text-red-500 hover:underline mt-1.5"
                  >
                    Quitar imagen
                  </button>
                )}
                <input
                  type="url"
                  value={form.imageUrl2?.startsWith('data:') ? '' : (form.imageUrl2 || '')}
                  onChange={e => setForm({ ...form, imageUrl2: e.target.value || undefined })}
                  className="w-full mt-2 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-[11px] bg-white dark:bg-slate-700 dark:text-slate-100"
                  placeholder="O pega URL de imagen..."
                />
              </div>

              {/* VISTA SECUNDARIA 3 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">Vista Secundaria 3</p>
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-lg shrink-0 border-2 border-dashed border-gray-300 dark:border-slate-500 p-1 overflow-hidden flex items-center justify-center mb-3">
                  <ProductImage product={form} size="full" imageUrlOverride={form.imageUrl3} />
                </div>
                <input
                  ref={fileInputRef3}
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'imageUrl3')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef3.current?.click()}
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir archivo
                </button>
                {form.imageUrl3 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl3: undefined })}
                    className="text-[10px] text-red-500 hover:underline mt-1.5"
                  >
                    Quitar imagen
                  </button>
                )}
                <input
                  type="url"
                  value={form.imageUrl3?.startsWith('data:') ? '' : (form.imageUrl3 || '')}
                  onChange={e => setForm({ ...form, imageUrl3: e.target.value || undefined })}
                  className="w-full mt-2 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-[11px] bg-white dark:bg-slate-700 dark:text-slate-100"
                  placeholder="O pega URL de imagen..."
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-3 text-center">
              Si no subes imágenes, se usará la visualización SVG por defecto. Formatos soportados: JPG, PNG, WebP. Máx 5MB.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Código</label>
              <input
                required
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="ST-001"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Nombre</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Marca</label>
              <select
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value as Brand })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              >
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as Category })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Capacidad</label>
              <input
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="30 oz"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: +e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Precio Público (C$)</label>
              <input
                type="number"
                required
                value={form.pricePublic}
                onChange={e => setForm({ ...form, pricePublic: +e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Precio Distribuidor (C$)</label>
              <input
                type="number"
                required
                value={form.priceDistributor}
                onChange={e => setForm({ ...form, priceDistributor: +e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm resize-none bg-white dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Colores disponibles</label>
            <div className="flex flex-wrap gap-2 mt-1 mb-2">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 rounded-full pl-1 pr-2 py-1">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-5 h-5 rounded-full object-cover border border-gray-300 dark:border-slate-500" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-500" style={{ backgroundColor: c.hex }} />
                  )}
                  <span className="text-xs dark:text-slate-200">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) })}
                    className="text-red-500 hover:text-red-700 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={colorName}
                onChange={e => setColorName(e.target.value)}
                placeholder="Nombre del color (Ej: Rosa Mate)"
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
              <input
                type="color"
                value={colorHex}
                onChange={e => setColorHex(e.target.value)}
                className="w-12 h-9 border border-gray-300 dark:border-slate-600 rounded cursor-pointer"
              />
              <button type="button" onClick={addColor} disabled={!colorName} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded text-sm transition">
                + Agregar
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2 p-2.5 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
              <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Foto de referencia de este color (Opcional)</span>
              <div className="flex gap-2 items-center">
                <input
                  ref={colorFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleColorImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => colorFileInputRef.current?.click()}
                  disabled={uploadingColor || !colorName}
                  className="px-2.5 py-1.5 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded text-xs font-semibold disabled:opacity-50 transition"
                >
                  {uploadingColor ? 'Subiendo...' : 'Tomar Foto / Subir'}
                </button>
                <input
                  value={colorImage}
                  onChange={e => setColorImage(e.target.value)}
                  placeholder="O pega el link/URL de la imagen del color..."
                  disabled={!colorName}
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                />
              </div>
              {colorImage && (
                <div className="flex items-center gap-2 mt-1">
                  <img src={colorImage} alt="Color preview" className="w-8 h-8 rounded border object-cover" />
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate flex-1">{colorImage}</span>
                  <button type="button" onClick={() => setColorImage('')} className="text-red-500 text-[10px] hover:underline">Quitar</button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Características</label>
            <ul className="space-y-1 mt-1 mb-2">
              {form.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded px-2 py-1 text-sm">
                  <span className="flex-1 dark:text-slate-200">{f}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })}
                    className="text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={feature}
                onChange={e => setFeature(e.target.value)}
                placeholder="Ej: Acero inoxidable 18/8"
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
              <button type="button" onClick={addFeature} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-sm dark:text-slate-200">
                +
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-slate-200">
              <input
                type="checkbox"
                checked={form.featured || false}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4"
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-slate-200">
              <input
                type="checkbox"
                checked={form.isNew || false}
                onChange={e => setForm({ ...form, isNew: e.target.checked })}
                className="w-4 h-4"
              />
              Nuevo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-slate-200">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              Activo
            </label>
          </div>

          <div className="mt-5 flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium dark:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
