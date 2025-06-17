import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Settings, 
  Users, 
  Image, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Upload,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Target,
  Eye,
  Heart,
  Star,
  TrendingUp
} from 'lucide-react';
import LoginForm from '../components/LoginForm';
import { useCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatPrice';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Cabin form state
  const [showCabinForm, setShowCabinForm] = useState(false);
  const [editingCabin, setEditingCabin] = useState<any>(null);
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

  // Admin credentials
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });

  const { cabins, loading: cabinsLoading, addCabin, updateCabin, deleteCabin, fetchCabins } = useCabins();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await apiService.updateSettings(settings);
      setMessage('✅ Настройки сохранены!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка сохранения');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const updateAdminCredentials = async () => {
    if (!adminForm.username || !adminForm.password) {
      setMessage('❌ Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await apiService.updateCredentials(adminForm.username, adminForm.password);
      setMessage('✅ Данные администратора обновлены!');
      setAdminForm({ username: '', password: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка обновления');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleCabinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cabinData = {
        ...cabinForm,
        amenities: cabinForm.amenities.filter(a => a.trim()),
        images: cabinForm.images.filter(i => i.trim())
      };

      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinData);
        setMessage('✅ Домик обновлен!');
      } else {
        await addCabin(cabinData);
        setMessage('✅ Домик добавлен!');
      }

      resetCabinForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка сохранения домика');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
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
    setShowCabinForm(false);
  };

  const editCabin = (cabin: any) => {
    setCabinForm({
      name: cabin.name,
      description: cabin.description,
      pricePerNight: cabin.pricePerNight,
      location: cabin.location,
      bedrooms: cabin.bedrooms,
      bathrooms: cabin.bathrooms,
      maxGuests: cabin.maxGuests,
      amenities: cabin.amenities.length ? cabin.amenities : [''],
      images: cabin.images.length ? cabin.images : [''],
      featured: cabin.featured
    });
    setEditingCabin(cabin);
    setShowCabinForm(true);
  };

  const handleDeleteCabin = async (id: string) => {
    if (window.confirm('Удалить этот домик?')) {
      try {
        await deleteCabin(id);
        setMessage('✅ Домик удален!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Ошибка удаления');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await apiService.uploadImage(file);
      const newImages = [...cabinForm.images];
      const emptyIndex = newImages.findIndex(img => !img.trim());
      if (emptyIndex !== -1) {
        newImages[emptyIndex] = response.imageUrl;
      } else {
        newImages.push(response.imageUrl);
      }
      setCabinForm({ ...cabinForm, images: newImages });
      setMessage('✅ Изображение загружено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка загрузки изображения');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const addGalleryImage = () => {
    setSettings({
      ...settings,
      galleryImages: [...(settings.galleryImages || []), '']
    });
  };

  const updateGalleryImage = (index: number, value: string) => {
    const newImages = [...(settings.galleryImages || [])];
    newImages[index] = value;
    setSettings({
      ...settings,
      galleryImages: newImages
    });
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...(settings.galleryImages || [])];
    newImages.splice(index, 1);
    setSettings({
      ...settings,
      galleryImages: newImages
    });
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'cabins', name: 'Домики', icon: Home },
    { id: 'gallery', name: 'Галерея', icon: Image },
    { id: 'content', name: 'Контент', icon: FileText },
    { id: 'about', name: 'О нас', icon: Heart },
    { id: 'contacts', name: 'Контакты', icon: Phone },
    { id: 'settings', name: 'Настройки', icon: Settings },
    { id: 'admin', name: 'Администрирование', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Админ панель VGosti</h1>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Cabins Tab */}
            {activeTab === 'cabins' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Управление домиками</h2>
                  <button
                    onClick={() => setShowCabinForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить домик
                  </button>
                </div>

                {showCabinForm && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">
                        {editingCabin ? 'Редактировать домик' : 'Добавить новый домик'}
                      </h3>
                      <button
                        onClick={resetCabinForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleCabinSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название
                          </label>
                          <input
                            type="text"
                            value={cabinForm.name}
                            onChange={(e) => setCabinForm({ ...cabinForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Цена за ночь (₽)
                          </label>
                          <input
                            type="number"
                            value={cabinForm.pricePerNight}
                            onChange={(e) => setCabinForm({ ...cabinForm, pricePerNight: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Местоположение
                          </label>
                          <input
                            type="text"
                            value={cabinForm.location}
                            onChange={(e) => setCabinForm({ ...cabinForm, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Спальни
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cabinForm.bedrooms}
                              onChange={(e) => setCabinForm({ ...cabinForm, bedrooms: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ванные
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cabinForm.bathrooms}
                              onChange={(e) => setCabinForm({ ...cabinForm, bathrooms: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Гости
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cabinForm.maxGuests}
                              onChange={(e) => setCabinForm({ ...cabinForm, maxGuests: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Описание
                        </label>
                        <textarea
                          value={cabinForm.description}
                          onChange={(e) => setCabinForm({ ...cabinForm, description: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Удобства
                        </label>
                        {cabinForm.amenities.map((amenity, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={amenity}
                              onChange={(e) => {
                                const newAmenities = [...cabinForm.amenities];
                                newAmenities[index] = e.target.value;
                                setCabinForm({ ...cabinForm, amenities: newAmenities });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Удобство"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newAmenities = cabinForm.amenities.filter((_, i) => i !== index);
                                setCabinForm({ ...cabinForm, amenities: newAmenities });
                              }}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCabinForm({ ...cabinForm, amenities: [...cabinForm.amenities, ''] })}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          + Добавить удобство
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Изображения
                        </label>
                        {cabinForm.images.map((image, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="url"
                              value={image}
                              onChange={(e) => {
                                const newImages = [...cabinForm.images];
                                newImages[index] = e.target.value;
                                setCabinForm({ ...cabinForm, images: newImages });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="URL изображения"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = cabinForm.images.filter((_, i) => i !== index);
                                setCabinForm({ ...cabinForm, images: newImages });
                              }}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCabinForm({ ...cabinForm, images: [...cabinForm.images, ''] })}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Добавить URL
                          </button>
                          <label className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Загрузить файл
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={cabinForm.featured}
                          onChange={(e) => setCabinForm({ ...cabinForm, featured: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                          Рекомендуемый домик
                        </label>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          type="button"
                          onClick={resetCabinForm}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cabins.map((cabin) => (
                    <div key={cabin.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      {cabin.images[0] && (
                        <img
                          src={cabin.images[0]}
                          alt={cabin.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{cabin.name}</h3>
                          {cabin.featured && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Рекомендуемый
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cabin.description}</p>
                        <p className="text-lg font-bold text-blue-600 mb-3">
                          {formatPrice(cabin.pricePerNight)} / ночь
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCabin(cabin)}
                            className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteCabin(cabin.id)}
                            className="flex items-center px-3 py-1 text-red-600 hover:text-red-700 text-sm"
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

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Галерея главной страницы</h2>
                  <button
                    onClick={addGalleryImage}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить изображение
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="space-y-4">
                    {(settings.galleryImages || []).map((image, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateGalleryImage(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="URL изображения"
                          />
                        </div>
                        {image && (
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <button
                          onClick={() => removeGalleryImage(index)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Сохранение...' : 'Сохранить галерею'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Управление контентом</h2>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Главная страница</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок героя
                      </label>
                      <input
                        type="text"
                        value={settings.heroTitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Уютные домики и квартиры на берегу каспия"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Подзаголовок героя
                      </label>
                      <textarea
                        value={settings.heroSubtitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Отдохните от городской суеты..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Секция "Почему выбирают нас"</h3>
                  <div className="space-y-4">
                    {(settings.whyChooseUsFeatures || []).map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Заголовок
                            </label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => {
                                const newFeatures = [...(settings.whyChooseUsFeatures || [])];
                                newFeatures[index] = { ...feature, title: e.target.value };
                                setSettings({ ...settings, whyChooseUsFeatures: newFeatures });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Описание
                            </label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...(settings.whyChooseUsFeatures || [])];
                                newFeatures[index] = { ...feature, description: e.target.value };
                                setSettings({ ...settings, whyChooseUsFeatures: newFeatures });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newFeatures = (settings.whyChooseUsFeatures || []).filter((_, i) => i !== index);
                            setSettings({ ...settings, whyChooseUsFeatures: newFeatures });
                          }}
                          className="mt-2 text-red-600 hover:text-red-700 text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeatures = [...(settings.whyChooseUsFeatures || []), { title: '', description: '' }];
                        setSettings({ ...settings, whyChooseUsFeatures: newFeatures });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить преимущество
                    </button>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить контент'}
                </button>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Страница "О нас"</h2>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Основная информация
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заголовок страницы
                        </label>
                        <input
                          type="text"
                          value={settings.aboutContent?.title || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            aboutContent: {
                              ...settings.aboutContent,
                              title: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="О нас"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подзаголовок
                        </label>
                        <input
                          type="text"
                          value={settings.aboutContent?.subtitle || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            aboutContent: {
                              ...settings.aboutContent,
                              subtitle: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ваш идеальный отдых на берегу Каспийского моря"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Основное описание
                      </label>
                      <textarea
                        value={settings.aboutContent?.description || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            description: e.target.value
                          }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Мы предлагаем уникальные возможности для отдыха..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Target className="w-4 h-4 inline mr-1" />
                          Наша миссия
                        </label>
                        <textarea
                          value={settings.aboutContent?.mission || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            aboutContent: {
                              ...settings.aboutContent,
                              mission: e.target.value
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Наша миссия - создавать незабываемые впечатления..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Eye className="w-4 h-4 inline mr-1" />
                          Наше видение
                        </label>
                        <textarea
                          value={settings.aboutContent?.vision || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            aboutContent: {
                              ...settings.aboutContent,
                              vision: e.target.value
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Мы стремимся стать ведущей компанией..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Ценности компании
                  </h3>
                  <div className="space-y-3">
                    {(settings.aboutContent?.values || []).map((value, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const newValues = [...(settings.aboutContent?.values || [])];
                            newValues[index] = e.target.value;
                            setSettings({
                              ...settings,
                              aboutContent: {
                                ...settings.aboutContent,
                                values: newValues
                              }
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ценность компании"
                        />
                        <button
                          onClick={() => {
                            const newValues = (settings.aboutContent?.values || []).filter((_, i) => i !== index);
                            setSettings({
                              ...settings,
                              aboutContent: {
                                ...settings.aboutContent,
                                values: newValues
                              }
                            });
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newValues = [...(settings.aboutContent?.values || []), ''];
                        setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            values: newValues
                          }
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить ценность
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Статистика
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Лет опыта
                      </label>
                      <input
                        type="number"
                        value={settings.aboutContent?.stats?.yearsExperience || 0}
                        onChange={(e) => setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            stats: {
                              ...settings.aboutContent?.stats,
                              yearsExperience: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Довольных гостей
                      </label>
                      <input
                        type="number"
                        value={settings.aboutContent?.stats?.happyGuests || 0}
                        onChange={(e) => setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            stats: {
                              ...settings.aboutContent?.stats,
                              happyGuests: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Объектов
                      </label>
                      <input
                        type="number"
                        value={settings.aboutContent?.stats?.properties || 0}
                        onChange={(e) => setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            stats: {
                              ...settings.aboutContent?.stats,
                              properties: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Локаций
                      </label>
                      <input
                        type="number"
                        value={settings.aboutContent?.stats?.locations || 0}
                        onChange={(e) => setSettings({
                          ...settings,
                          aboutContent: {
                            ...settings.aboutContent,
                            stats: {
                              ...settings.aboutContent?.stats,
                              locations: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить страницу "О нас"'}
                </button>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Страница "Контакты"</h2>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-blue-600" />
                    Основная информация
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заголовок страницы
                        </label>
                        <input
                          type="text"
                          value={settings.contactInfo?.title || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contactInfo: {
                              ...settings.contactInfo,
                              title: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Контакты"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подзаголовок
                        </label>
                        <input
                          type="text"
                          value={settings.contactInfo?.subtitle || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contactInfo: {
                              ...settings.contactInfo,
                              subtitle: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Свяжитесь с нами любым удобным способом"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={settings.contactInfo?.phone || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contactInfo: {
                              ...settings.contactInfo,
                              phone: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+7 965 411-15-55"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.contactInfo?.email || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contactInfo: {
                              ...settings.contactInfo,
                              email: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="info@vgosti.ru"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={settings.contactInfo?.whatsapp || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contactInfo: {
                              ...settings.contactInfo,
                              whatsapp: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+79654111555"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Адрес
                      </label>
                      <input
                        type="text"
                        value={settings.contactInfo?.address || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: {
                            ...settings.contactInfo,
                            address: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Приморский бульвар, 123, Морской город, Россия"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Время работы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Будние дни
                      </label>
                      <input
                        type="text"
                        value={settings.contactInfo?.officeHours?.weekdays || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: {
                            ...settings.contactInfo,
                            officeHours: {
                              ...settings.contactInfo?.officeHours,
                              weekdays: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Пн-Пт: 9:00 - 18:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Выходные дни
                      </label>
                      <input
                        type="text"
                        value={settings.contactInfo?.officeHours?.weekends || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: {
                            ...settings.contactInfo,
                            officeHours: {
                              ...settings.contactInfo?.officeHours,
                              weekends: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Сб-Вс: 10:00 - 16:00"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить контакты'}
                </button>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Настройки сайта</h2>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название сайта
                        </label>
                        <input
                          type="text"
                          value={settings.siteName || ''}
                          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="В гости"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Основной телефон
                        </label>
                        <input
                          type="tel"
                          value={settings.phone || ''}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+7 965 411-15-55"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Настройки футера</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание в футере
                      </label>
                      <textarea
                        value={settings.footerDescription || ''}
                        onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Уютные домики и современные квартиры на берегу моря..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон в футере
                        </label>
                        <input
                          type="tel"
                          value={settings.footerPhone || ''}
                          onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+7 (999) 123-45-67"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email в футере
                        </label>
                        <input
                          type="email"
                          value={settings.footerEmail || ''}
                          onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="info@vgosti.ru"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Адрес в футере
                        </label>
                        <input
                          type="text"
                          value={settings.footerAddress || ''}
                          onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Приморский бульвар, 123"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Администрирование</h2>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Изменить данные администратора</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Новый логин
                        </label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Введите новый логин"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Введите новый пароль"
                        />
                      </div>
                    </div>

                    <button
                      onClick={updateAdminCredentials}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Обновление...' : 'Обновить данные'}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Важно!</h4>
                  <p className="text-yellow-700 text-sm">
                    После изменения логина и пароля вам потребуется войти в систему заново с новыми данными.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;