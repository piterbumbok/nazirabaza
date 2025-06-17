import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Settings,
  User,
  Lock,
  Globe,
  Image,
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import LoginForm from '../components/LoginForm';
import FileUpload from '../components/FileUpload';
import { useCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Cabin } from '../types';

interface SiteSettings {
  siteName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  phone?: string;
  footerDescription?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerAddress?: string;
  galleryImages?: string[];
  whyChooseUsFeatures?: Array<{
    title: string;
    description: string;
  }>;
  contactInfo?: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    telegram: string;
    officeHours: {
      weekdays: string;
      weekends: string;
    };
  };
}

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [isAddingCabin, setIsAddingCabin] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [newCredentials, setNewCredentials] = useState({ username: '', password: '' });
  const [adminPath, setAdminPath] = useState('admin');
  const [newAdminPath, setNewAdminPath] = useState('');
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);

  const { cabins, loading, addCabin, updateCabin, deleteCabin, fetchCabins } = useCabins();

  const [cabinForm, setCabinForm] = useState({
    name: '',
    description: '',
    pricePerNight: 0,
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [''],
    images: [''],
    featured: false
  });

  useEffect(() => {
    loadSettings();
    loadAdminPath();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAdminPath = async () => {
    try {
      const response = await apiService.getAdminPath();
      setAdminPath(response.path);
    } catch (error) {
      console.error('Error loading admin path:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setIsAuthenticated(true);
        setCredentials({ username, password });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleSaveSettings = async () => {
    try {
      await apiService.updateSettings(settings);
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    }
  };

  const handleUpdateCredentials = async () => {
    try {
      await apiService.updateCredentials(newCredentials.username, newCredentials.password);
      setCredentials(newCredentials);
      alert('Учетные данные обновлены!');
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Ошибка при обновлении учетных данных');
    }
  };

  const handleUpdateAdminPath = async () => {
    if (!newAdminPath.trim()) {
      alert('Введите новую ссылку');
      return;
    }
    
    try {
      await apiService.updateAdminPath(newAdminPath);
      setAdminPath(newAdminPath);
      alert(`Ссылка на админку изменена! Новая ссылка: /${newAdminPath}`);
      setNewAdminPath('');
    } catch (error) {
      console.error('Error updating admin path:', error);
      alert('Ошибка при обновлении ссылки');
    }
  };

  const handleMultipleFileUpload = async (files: File[], type: 'cabin' | 'gallery') => {
    try {
      setUploadingImages(prev => [...prev, ...files.map(f => f.name)]);
      
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      if (type === 'cabin') {
        setCabinForm(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img), ...results.map(r => r.imageUrl)]
        }));
      } else if (type === 'gallery') {
        setSettings(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), ...results.map(r => r.imageUrl)]
        }));
      }
      
      setUploadingImages(prev => prev.filter(name => !files.map(f => f.name).includes(name)));
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadingImages(prev => prev.filter(name => !files.map(f => f.name).includes(name)));
      alert('Ошибка при загрузке файлов');
    }
  };

  const handleSaveCabin = async () => {
    try {
      const cabinData = {
        ...cabinForm,
        amenities: cabinForm.amenities.filter(a => a.trim()),
        images: cabinForm.images.filter(i => i.trim())
      };

      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinData);
      } else {
        await addCabin(cabinData);
      }

      resetCabinForm();
      alert('Домик сохранен!');
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении домика');
    }
  };

  const handleDeleteCabin = async (id: string) => {
    if (confirm('Удалить этот домик?')) {
      try {
        await deleteCabin(id);
        alert('Домик удален!');
      } catch (error) {
        console.error('Error deleting cabin:', error);
        alert('Ошибка при удалении домика');
      }
    }
  };

  const resetCabinForm = () => {
    setCabinForm({
      name: '',
      description: '',
      pricePerNight: 0,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: [''],
      images: [''],
      featured: false
    });
    setEditingCabin(null);
    setIsAddingCabin(false);
  };

  const startEditCabin = (cabin: Cabin) => {
    setCabinForm({
      name: cabin.name,
      description: cabin.description,
      pricePerNight: cabin.pricePerNight,
      location: cabin.location,
      bedrooms: cabin.bedrooms,
      bathrooms: cabin.bathrooms,
      maxGuests: cabin.maxGuests,
      amenities: [...cabin.amenities, ''],
      images: [...cabin.images, ''],
      featured: cabin.featured
    });
    setEditingCabin(cabin);
    setIsAddingCabin(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Админ панель VGosti</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Ссылка: /{adminPath}</span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'cabins', label: 'Домики', icon: Home },
            { id: 'settings', label: 'Настройки сайта', icon: Settings },
            { id: 'contacts', label: 'Контакты', icon: Phone },
            { id: 'admin', label: 'Админ', icon: User }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Cabins Tab */}
        {activeTab === 'cabins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Управление домиками</h2>
              <button
                onClick={() => setIsAddingCabin(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить домик
              </button>
            </div>

            {isAddingCabin && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingCabin ? 'Редактировать домик' : 'Добавить новый домик'}
                  </h3>
                  <button onClick={resetCabinForm} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                    <input
                      type="text"
                      value={cabinForm.name}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Локация</label>
                    <input
                      type="text"
                      value={cabinForm.location}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                    <textarea
                      value={cabinForm.description}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Цена за ночь (₽)</label>
                    <input
                      type="number"
                      value={cabinForm.pricePerNight}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Спальни</label>
                      <input
                        type="number"
                        value={cabinForm.bedrooms}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ванные</label>
                      <input
                        type="number"
                        value={cabinForm.bathrooms}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Гости</label>
                      <input
                        type="number"
                        value={cabinForm.maxGuests}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Удобства</label>
                    {cabinForm.amenities.map((amenity, index) => (
                      <div key={index} className="flex mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => {
                            const newAmenities = [...cabinForm.amenities];
                            newAmenities[index] = e.target.value;
                            setCabinForm(prev => ({ ...prev, amenities: newAmenities }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Удобство"
                        />
                        <button
                          onClick={() => {
                            const newAmenities = cabinForm.amenities.filter((_, i) => i !== index);
                            setCabinForm(prev => ({ ...prev, amenities: newAmenities }));
                          }}
                          className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setCabinForm(prev => ({ ...prev, amenities: [...prev.amenities, ''] }))}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Добавить удобство
                    </button>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Изображения {uploadingImages.length > 0 && `(Загружается: ${uploadingImages.length})`}
                    </label>
                    <FileUpload
                      onFileSelect={(files) => handleMultipleFileUpload(files, 'cabin')}
                      accept="image/*"
                      multiple={true}
                      className="mb-4"
                    />
                    <div className="grid grid-cols-4 gap-4">
                      {cabinForm.images.filter(img => img).map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Изображение ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          <button
                            onClick={() => {
                              const newImages = cabinForm.images.filter((_, i) => i !== index);
                              setCabinForm(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cabinForm.featured}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="mr-2"
                      />
                      Рекомендуемый домик
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveCabin}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cabins.map((cabin) => (
                <div key={cabin.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <img
                    src={cabin.images[0] || '/placeholder.jpg'}
                    alt={cabin.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 truncate">{cabin.name}</h3>
                    <p className="text-gray-600 text-xs mb-1 truncate">{cabin.location}</p>
                    <p className="text-blue-600 font-bold text-sm mb-2">{formatPrice(cabin.pricePerNight)}</p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => startEditCabin(cabin)}
                        className="flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteCabin(cabin.id)}
                        className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки сайта</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название сайта</label>
                  <input
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок героя</label>
                <input
                  type="text"
                  value={settings.heroTitle || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок героя</label>
                <textarea
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Галерея изображений {uploadingImages.length > 0 && `(Загружается: ${uploadingImages.length})`}
                </label>
                <FileUpload
                  onFileSelect={(files) => handleMultipleFileUpload(files, 'gallery')}
                  accept="image/*"
                  multiple={true}
                  className="mb-4"
                />
                <div className="grid grid-cols-4 gap-4">
                  {(settings.galleryImages || []).map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Галерея ${index + 1}`} className="w-full h-20 object-cover rounded" />
                      <button
                        onClick={() => {
                          const newImages = (settings.galleryImages || []).filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, galleryImages: newImages }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </button>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки страницы "Контакты"</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.title || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.subtitle || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, subtitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.phone || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.contactInfo?.email || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.whatsapp || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, whatsapp: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telegram</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.telegram || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, telegram: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                <textarea
                  value={settings.contactInfo?.address || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, address: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </button>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки администратора</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Текущие учетные данные</h3>
                <p className="text-gray-600">Логин: <strong>{credentials.username}</strong></p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Изменить учетные данные</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Новый логин</label>
                    <input
                      type="text"
                      value={newCredentials.username}
                      onChange={(e) => setNewCredentials(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                    <input
                      type="password"
                      value={newCredentials.password}
                      onChange={(e) => setNewCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateCredentials}
                  className="mt-4 flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Обновить учетные данные
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Ссылка на админку</h3>
                <p className="text-gray-600 mb-4">
                  Текущая ссылка: <strong>https://vgosty05.ru/{adminPath}</strong>
                </p>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Новая ссылка</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                        vgosty05.ru/
                      </span>
                      <input
                        type="text"
                        value={newAdminPath}
                        onChange={(e) => setNewAdminPath(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="my-secret-admin"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleUpdateAdminPath}
                      className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Изменить ссылку
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  ⚠️ После изменения ссылки, админка будет доступна только по новому адресу!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;