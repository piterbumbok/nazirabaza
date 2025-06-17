import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { apiService } from '../services/api';
import { useCabins } from '../hooks/useCabins';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Settings, 
  Home, 
  Image, 
  User,
  Key,
  Palette,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminSettings {
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  
  // Site Info
  siteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  
  // Footer
  footerDescription?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerAddress?: string;
  
  // Gallery
  galleryImages?: string[];
  
  // Features
  whyChooseUsFeatures?: Array<{
    title: string;
    description: string;
  }>;
  
  // About Page
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
  };
  
  // Contact Page
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
  const { adminPath } = useParams();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Cabins
  const { cabins, addCabin, updateCabin, deleteCabin, fetchCabins } = useCabins();
  const [editingCabin, setEditingCabin] = useState<any>(null);
  const [showCabinForm, setShowCabinForm] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<AdminSettings>({});
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');
  
  // Admin credentials
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('admin_logged_in') === 'true';
      setIsLoggedIn(isAuth);
      if (isAuth) {
        loadSettings();
      }
    };
    checkAuth();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        localStorage.setItem('admin_logged_in', 'true');
        setIsLoggedIn(true);
        loadSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    navigate('/');
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  // Cabin Management
  const handleSaveCabin = async (cabinData: any) => {
    try {
      setLoading(true);
      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinData);
        showMessage('Домик обновлен!');
      } else {
        await addCabin(cabinData);
        showMessage('Домик добавлен!');
      }
      setEditingCabin(null);
      setShowCabinForm(false);
    } catch (error) {
      showMessage('Ошибка сохранения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCabin = async (id: string) => {
    if (confirm('Удалить этот домик?')) {
      try {
        await deleteCabin(id);
        showMessage('Домик удален!');
      } catch (error) {
        showMessage('Ошибка удаления', 'error');
      }
    }
  };

  // Settings Management
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await apiService.updateSettings(settings);
      showMessage('Настройки сохранены!');
    } catch (error) {
      showMessage('Ошибка сохранения настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!credentials.username || !credentials.password) {
      showMessage('Заполните все поля', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await apiService.updateCredentials(credentials.username, credentials.password);
      showMessage('Данные для входа обновлены!');
      setCredentials({ username: '', password: '' });
    } catch (error) {
      showMessage('Ошибка обновления данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gallery Management
  const addGalleryImage = () => {
    if (tempGalleryUrl.trim()) {
      const currentImages = settings.galleryImages || [];
      setSettings({
        ...settings,
        galleryImages: [...currentImages, tempGalleryUrl.trim()]
      });
      setTempGalleryUrl('');
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentImages = settings.galleryImages || [];
    setSettings({
      ...settings,
      galleryImages: currentImages.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const response = await apiService.uploadImage(file);
      const currentImages = settings.galleryImages || [];
      setSettings({
        ...settings,
        galleryImages: [...currentImages, response.imageUrl]
      });
      showMessage('Изображение загружено!');
    } catch (error) {
      showMessage('Ошибка загрузки изображения', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                target="_blank"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Посмотреть сайт
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'cabins', name: 'Домики', icon: Home },
                { id: 'gallery', name: 'Галерея', icon: Image },
                { id: 'content', name: 'Контент', icon: FileText },
                { id: 'settings', name: 'Настройки', icon: Settings },
                { id: 'admin', name: 'Админ', icon: User }
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Cabins Tab */}
        {activeTab === 'cabins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Управление домиками</h2>
              <button
                onClick={() => {
                  setEditingCabin(null);
                  setShowCabinForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить домик
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabins.map((cabin) => (
                <div key={cabin.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{cabin.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCabin(cabin);
                          setShowCabinForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCabin(cabin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{cabin.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {cabin.pricePerNight.toLocaleString()} ₽
                    </span>
                    {cabin.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Популярный
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cabin Form Modal */}
            {showCabinForm && (
              <CabinFormModal
                cabin={editingCabin}
                onSave={handleSaveCabin}
                onClose={() => {
                  setShowCabinForm(false);
                  setEditingCabin(null);
                }}
                loading={loading}
              />
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Галерея изображений</h2>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить галерею
              </button>
            </div>

            {/* Add Image */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Добавить изображение</h3>
              <div className="flex space-x-4 mb-4">
                <input
                  type="url"
                  value={tempGalleryUrl}
                  onChange={(e) => setTempGalleryUrl(e.target.value)}
                  placeholder="URL изображения"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addGalleryImage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Добавить
                </button>
              </div>
              
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Или загрузить файл:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(settings.galleryImages || []).map((imageUrl, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="aspect-video">
                    <img
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">{imageUrl}</span>
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Управление контентом</h2>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить контент
              </button>
            </div>

            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Главная секция</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Заголовок
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle || ''}
                      onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Уютные домики и квартиры на берегу каспия"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Подзаголовок
                    </label>
                    <textarea
                      value={settings.heroSubtitle || ''}
                      onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Отдохните от городской суеты..."
                    />
                  </div>
                </div>
              </div>

              {/* Why Choose Us Features */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Почему выбирают нас</h3>
                <div className="space-y-4">
                  {(settings.whyChooseUsFeatures || []).map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Преимущество {index + 1}</span>
                        <button
                          onClick={() => {
                            const features = [...(settings.whyChooseUsFeatures || [])];
                            features.splice(index, 1);
                            setSettings({...settings, whyChooseUsFeatures: features});
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const features = [...(settings.whyChooseUsFeatures || [])];
                          features[index] = {...features[index], title: e.target.value};
                          setSettings({...settings, whyChooseUsFeatures: features});
                        }}
                        placeholder="Заголовок"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const features = [...(settings.whyChooseUsFeatures || [])];
                          features[index] = {...features[index], description: e.target.value};
                          setSettings({...settings, whyChooseUsFeatures: features});
                        }}
                        placeholder="Описание"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const features = [...(settings.whyChooseUsFeatures || [])];
                      features.push({title: '', description: ''});
                      setSettings({...settings, whyChooseUsFeatures: features});
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    + Добавить преимущество
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Настройки сайта</h2>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </button>
            </div>

            <div className="space-y-6">
              {/* Site Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Основная информация
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название сайта
                    </label>
                    <input
                      type="text"
                      value={settings.siteName || ''}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="В гости"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+7 965 411-15-55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@vgosti.ru"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={settings.address || ''}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Приморский бульвар, 123"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Настройки футера</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание в футере
                    </label>
                    <textarea
                      value={settings.footerDescription || ''}
                      onChange={(e) => setSettings({...settings, footerDescription: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Уютные домики и современные квартиры..."
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
                        onChange={(e) => setSettings({...settings, footerPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email в футере
                      </label>
                      <input
                        type="email"
                        value={settings.footerEmail || ''}
                        onChange={(e) => setSettings({...settings, footerEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес в футере
                      </label>
                      <input
                        type="text"
                        value={settings.footerAddress || ''}
                        onChange={(e) => setSettings({...settings, footerAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Администрирование</h2>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Изменить данные для входа
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый логин
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="admin123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleUpdateCredentials}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Обновить данные для входа
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Cabin Form Modal Component
const CabinFormModal: React.FC<{
  cabin: any;
  onSave: (data: any) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ cabin, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    name: cabin?.name || '',
    description: cabin?.description || '',
    pricePerNight: cabin?.pricePerNight || 0,
    location: cabin?.location || '',
    bedrooms: cabin?.bedrooms || 1,
    bathrooms: cabin?.bathrooms || 1,
    maxGuests: cabin?.maxGuests || 2,
    amenities: cabin?.amenities || [],
    images: cabin?.images || [],
    featured: cabin?.featured || false
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()]
      });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await apiService.uploadImage(file);
      setFormData({
        ...formData,
        images: [...formData.images, response.imageUrl]
      });
    } catch (error) {
      alert('Ошибка загрузки изображения');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {cabin ? 'Редактировать домик' : 'Добавить домик'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена за ночь (₽) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Местоположение
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Спальни
              </label>
              <input
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
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
                value={formData.bathrooms}
                onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Макс. гостей
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxGuests}
                onChange={(e) => setFormData({...formData, maxGuests: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Удобства
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Добавить удобство"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображения
            </label>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="URL изображения"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Добавить
                </button>
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Популярный домик (показывать на главной)
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {cabin ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;