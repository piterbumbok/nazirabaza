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
  aboutContent?: {
    title: string;
    subtitle: string;
    description: string;
    mission: string;
    vision: string;
    values: string[];
    stats: {
      yearsExperience: number;
      happyGuests: number;
      properties: number;
      locations: number;
    };
    team: Array<{
      name: string;
      position: string;
      description: string;
      image: string;
    }>;
  };
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
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
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

  const handleFileUpload = async (file: File, type: 'cabin' | 'gallery') => {
    try {
      setUploadingImages(prev => [...prev, file.name]);
      const response = await apiService.uploadImage(file);
      
      if (type === 'cabin') {
        setCabinForm(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img), response.imageUrl]
        }));
      } else if (type === 'gallery') {
        setSettings(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), response.imageUrl]
        }));
      }
      
      setUploadingImages(prev => prev.filter(name => name !== file.name));
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingImages(prev => prev.filter(name => name !== file.name));
      alert('Ошибка при загрузке файла');
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
              <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'cabins', label: 'Домики', icon: Home },
            { id: 'settings', label: 'Настройки сайта', icon: Settings },
            { id: 'about', label: 'О нас', icon: FileText },
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
                      rows={4}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Изображения</label>
                    <FileUpload
                      onFileSelect={(file) => handleFileUpload(file, 'cabin')}
                      accept="image/*"
                      className="mb-4"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      {cabinForm.images.filter(img => img).map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Изображение ${index + 1}`} className="w-full h-24 object-cover rounded" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabins.map((cabin) => (
                <div key={cabin.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <img
                    src={cabin.images[0] || '/placeholder.jpg'}
                    alt={cabin.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{cabin.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{cabin.location}</p>
                    <p className="text-blue-600 font-bold mb-4">{formatPrice(cabin.pricePerNight)} / ночь</p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => startEditCabin(cabin)}
                        className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteCabin(cabin.id)}
                        className="flex items-center px-3 py-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Галерея изображений</label>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload(file, 'gallery')}
                  accept="image/*"
                  className="mb-4"
                />
                <div className="grid grid-cols-3 gap-4">
                  {(settings.galleryImages || []).map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Галерея ${index + 1}`} className="w-full h-24 object-cover rounded" />
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

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки страницы "О нас"</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                <input
                  type="text"
                  value={settings.aboutContent?.title || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aboutContent: { ...prev.aboutContent, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок</label>
                <input
                  type="text"
                  value={settings.aboutContent?.subtitle || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aboutContent: { ...prev.aboutContent, subtitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea
                  value={settings.aboutContent?.description || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aboutContent: { ...prev.aboutContent, description: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Миссия</label>
                <textarea
                  value={settings.aboutContent?.mission || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aboutContent: { ...prev.aboutContent, mission: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Видение</label>
                <textarea
                  value={settings.aboutContent?.vision || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aboutContent: { ...prev.aboutContent, vision: e.target.value }
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

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки страницы "Контакты"</h2>
            
            <div className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="space-y-6">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;