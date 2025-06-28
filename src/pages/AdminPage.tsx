import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Settings, 
  User, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Eye,
  EyeOff,
  Star,
  Check,
  MessageSquare,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAdminCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import FileUpload from '../components/FileUpload';

// Типы для админки
interface AdminSettings {
  [key: string]: any;
}

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  footerDescription: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  siteName: string;
}

const AdminPage: React.FC = () => {
  // Состояние аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Навигация
  const [activeTab, setActiveTab] = useState('cabins');

  // Домики
  const { cabins, loading: cabinsLoading, addCabin, updateCabin, deleteCabin, fetchCabins } = useAdminCabins();
  const [editingCabin, setEditingCabin] = useState<any>(null);
  const [showCabinForm, setShowCabinForm] = useState(false);

  // Удобства
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  // Галерея
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Контакты
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+7 965 411-15-55',
    email: 'info@vgosti.ru',
    address: 'Приморский бульвар, 123, Морской город, Россия',
    footerDescription: 'Уютные домики и современные квартиры на берегу моря для незабываемого отдыха.',
    footerPhone: '+7 965 411-15-55',
    footerEmail: 'info@vgosti.ru',
    footerAddress: 'Приморский бульвар, 123, Морской город, Россия',
    siteName: 'В гости'
  });

  // Отзывы
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Настройки
  const [settings, setSettings] = useState<AdminSettings>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Аккаунт
  const [accountData, setAccountData] = useState({
    username: '',
    password: '',
    newPassword: '',
    adminPath: 'admin'
  });

  // Стандартные удобства для домиков
  const defaultAmenities = [
    'Wi-Fi',
    'Кондиционер',
    'Терраса',
    'Барбекю',
    'Парковка',
    'Стиральная машина',
    'Кухня',
    'Телевизор',
    'Холодильник',
    'Микроволновка'
  ];

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (authStatus === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeDiff < thirtyMinutes) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthTime');
      }
    }
  }, []);

  // Загрузка всех данных
  const loadAllData = async () => {
    try {
      // Загружаем настройки
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
      
      // Загружаем галерею
      if (settingsData.galleryImages) {
        setGalleryImages(settingsData.galleryImages);
      }
      
      // Загружаем контакты
      if (settingsData.contactInfo) {
        setContactInfo(prev => ({ ...prev, ...settingsData.contactInfo }));
      }

      // Загружаем кастомные удобства
      if (settingsData.customAmenities) {
        setCustomAmenities(settingsData.customAmenities);
      }
      
      // Загружаем отзывы
      await loadReviews();
      
      // Загружаем путь админки
      const pathData = await apiService.getAdminPath();
      setAccountData(prev => ({ ...prev, adminPath: pathData.path }));
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Загрузка отзывов
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Логин
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await apiService.login(loginData.username, loginData.password);
      if (response.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminAuthTime', Date.now().toString());
        await loadAllData();
      }
    } catch (error) {
      setLoginError('Неверный логин или пароль');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Логаут
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    setLoginData({ username: '', password: '' });
  };

  // Сохранение домика
  const handleSaveCabin = async (cabinData: any) => {
    try {
      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinData);
      } else {
        await addCabin(cabinData);
      }
      setEditingCabin(null);
      setShowCabinForm(false);
      await fetchCabins();
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении домика');
    }
  };

  // Удаление домика
  const handleDeleteCabin = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот домик?')) {
      try {
        await deleteCabin(id);
        await fetchCabins();
      } catch (error) {
        console.error('Error deleting cabin:', error);
        alert('Ошибка при удалении домика');
      }
    }
  };

  // Управление удобствами
  const handleAddAmenity = async () => {
    if (newAmenity.trim() && !customAmenities.includes(newAmenity.trim())) {
      const updatedAmenities = [...customAmenities, newAmenity.trim()];
      setCustomAmenities(updatedAmenities);
      setNewAmenity('');
      
      // Сохраняем в настройки
      await apiService.updateSettings({ customAmenities: updatedAmenities });
    }
  };

  const handleDeleteAmenity = async (amenity: string) => {
    const updatedAmenities = customAmenities.filter(a => a !== amenity);
    setCustomAmenities(updatedAmenities);
    
    // Сохраняем в настройки
    await apiService.updateSettings({ customAmenities: updatedAmenities });
  };

  // Загрузка изображений в галерею
  const handleGalleryUpload = async (files: File[]) => {
    try {
      setUploadingGallery(true);
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.imageUrl);
      
      const updatedImages = [...galleryImages, ...newImages];
      setGalleryImages(updatedImages);
      
      // Сохраняем в настройки
      await apiService.updateSettings({ galleryImages: updatedImages });
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Удаление изображения из галереи
  const handleRemoveGalleryImage = async (index: number) => {
    const updatedImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updatedImages);
    await apiService.updateSettings({ galleryImages: updatedImages });
  };

  // Сохранение контактов
  const handleSaveContacts = async () => {
    try {
      await apiService.updateSettings({ 
        contactInfo,
        // Дублируем основные контакты для совместимости
        phone: contactInfo.phone,
        footerPhone: contactInfo.footerPhone,
        footerEmail: contactInfo.footerEmail,
        footerAddress: contactInfo.footerAddress,
        footerDescription: contactInfo.footerDescription,
        siteName: contactInfo.siteName
      });
      alert('Контакты сохранены!');
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Ошибка при сохранении контактов');
    }
  };

  // Модерация отзыва
  const handleReviewModeration = async (id: string, approved: boolean) => {
    try {
      await apiService.updateReview(id, { approved });
      await loadReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      alert('Ошибка при модерации отзыва');
    }
  };

  // Удаление отзыва
  const handleDeleteReview = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await apiService.deleteReview(id);
        await loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Ошибка при удалении отзыва');
      }
    }
  };

  // Сохранение настроек
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await apiService.updateSettings(settings);
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSavingSettings(false);
    }
  };

  // Сохранение аккаунта
  const handleSaveAccount = async () => {
    try {
      if (accountData.newPassword) {
        await apiService.updateCredentials(accountData.username, accountData.newPassword);
      }
      
      await apiService.updateAdminPath(accountData.adminPath);
      alert('Данные аккаунта обновлены!');
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Ошибка при сохранении данных аккаунта');
    }
  };

  // Форма логина
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4" style={{ zIndex: 100 }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Админ панель</h2>
            <p className="text-gray-600">Введите ваши учетные данные</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Логин</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите логин"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Пароль</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите пароль"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Главная админ панель
  return (
    <div className="min-h-screen bg-gray-50" style={{ zIndex: 100, position: 'relative' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Админ панель</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {[
                  { id: 'cabins', name: 'Домики', icon: Home },
                  { id: 'amenities', name: 'Удобства', icon: Star },
                  { id: 'gallery', name: 'Галерея', icon: ImageIcon },
                  { id: 'contacts', name: 'Контакты', icon: Phone },
                  { id: 'reviews', name: 'Отзывы', icon: MessageSquare },
                  { id: 'settings', name: 'Настройки', icon: Settings },
                  { id: 'account', name: 'Аккаунт', icon: User }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Домики */}
            {activeTab === 'cabins' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Управление домиками</h2>
                  <button
                    onClick={() => {
                      setEditingCabin(null);
                      setShowCabinForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить домик
                  </button>
                </div>

                {cabinsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cabins.map((cabin) => (
                      <div key={cabin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {cabin.images.length > 0 && (
                              <img
                                src={cabin.images[0]}
                                alt={cabin.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900">{cabin.name}</h3>
                              <p className="text-gray-600">{cabin.pricePerNight} ₽/ночь</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  cabin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {cabin.active ? 'Активен' : 'Неактивен'}
                                </span>
                                {cabin.featured && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Рекомендуемый
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingCabin(cabin);
                                setShowCabinForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCabin(cabin.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Форма домика */}
                {showCabinForm && (
                  <CabinForm
                    cabin={editingCabin}
                    defaultAmenities={[...defaultAmenities, ...customAmenities]}
                    onSave={handleSaveCabin}
                    onCancel={() => {
                      setShowCabinForm(false);
                      setEditingCabin(null);
                    }}
                  />
                )}
              </div>
            )}

            {/* Удобства */}
            {activeTab === 'amenities' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление удобствами</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить новое удобство</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Название удобства"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                    />
                    <button
                      onClick={handleAddAmenity}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Стандартные удобства</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {defaultAmenities.map((amenity, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Star className="w-5 h-5 text-blue-500 mr-3" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Пользовательские удобства</h3>
                    {customAmenities.length === 0 ? (
                      <p className="text-gray-500 italic">Пользовательские удобства не добавлены</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {customAmenities.map((amenity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteAmenity(amenity)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Галерея */}
            {activeTab === 'gallery' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление галереей</h2>
                
                <div className="mb-6">
                  <FileUpload
                    onFileSelect={handleGalleryUpload}
                    multiple={true}
                    className="mb-4"
                  />
                  {uploadingGallery && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Загружаем изображения...</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Галерея ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Контакты */}
            {activeTab === 'contacts' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление контактами</h2>
                
                <div className="space-y-8">
                  {/* Основные контакты */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Основные контакты</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название сайта
                        </label>
                        <input
                          type="text"
                          value={contactInfo.siteName}
                          onChange={(e) => setContactInfo({ ...contactInfo, siteName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон (в шапке сайта)
                        </label>
                        <input
                          type="text"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Адрес
                        </label>
                        <input
                          type="text"
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Контакты в футере */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Контакты в футере</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон в футере
                        </label>
                        <input
                          type="text"
                          value={contactInfo.footerPhone}
                          onChange={(e) => setContactInfo({ ...contactInfo, footerPhone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email в футере
                        </label>
                        <input
                          type="email"
                          value={contactInfo.footerEmail}
                          onChange={(e) => setContactInfo({ ...contactInfo, footerEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Адрес в футере
                        </label>
                        <input
                          type="text"
                          value={contactInfo.footerAddress}
                          onChange={(e) => setContactInfo({ ...contactInfo, footerAddress: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Описание в футере
                        </label>
                        <textarea
                          value={contactInfo.footerDescription}
                          onChange={(e) => setContactInfo({ ...contactInfo, footerDescription: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveContacts}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить контакты
                  </button>
                </div>
              </div>
            )}

            {/* Отзывы */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление отзывами</h2>
                
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-blue-600">{review.name.charAt(0)}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{review.name}</h4>
                              <p className="text-sm text-gray-500">{review.email}</p>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.approved ? 'Одобрен' : 'На модерации'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Исправленное отображение отзыва в админке */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-w-full overflow-hidden">
                          <p className="admin-review-text text-gray-700 break-words whitespace-pre-wrap">{review.comment}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!review.approved ? (
                            <button
                              onClick={() => handleReviewModeration(review.id, true)}
                              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Одобрить
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReviewModeration(review.id, false)}
                              className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            >
                              <EyeOff className="w-4 h-4 mr-1" />
                              Скрыть
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Настройки */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки сайта</h2>
                
                <div className="space-y-8">
                  {/* Hero секция */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Главная страница</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заголовок Hero секции
                        </label>
                        <input
                          type="text"
                          value={settings.heroTitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Уютные домики и квартиры на берегу каспия"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подзаголовок Hero секции
                        </label>
                        <textarea
                          value={settings.heroSubtitle || ''}
                          onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Отдохните от городской суеты..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Секция "Почему выбирают нас" */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Секция "Почему выбирают нас"</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заголовок секции
                        </label>
                        <input
                          type="text"
                          value={settings.whyChooseUsTitle || ''}
                          onChange={(e) => setSettings({ ...settings, whyChooseUsTitle: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Почему выбирают нас"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подзаголовок секции
                        </label>
                        <textarea
                          value={settings.whyChooseUsSubtitle || ''}
                          onChange={(e) => setSettings({ ...settings, whyChooseUsSubtitle: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Мы создаем идеальные условия..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Правила проживания */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Правила проживания</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Время заезда
                        </label>
                        <input
                          type="text"
                          value={settings.checkInTime || ''}
                          onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="после 14:00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Время выезда
                        </label>
                        <input
                          type="text"
                          value={settings.checkOutTime || ''}
                          onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="до 12:00"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingSettings ? 'Сохранение...' : 'Сохранить настройки'}
                  </button>
                </div>
              </div>
            )}

            {/* Аккаунт */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление аккаунтом</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Новый логин
                    </label>
                    <input
                      type="text"
                      value={accountData.username}
                      onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите новый логин"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={accountData.newPassword}
                      onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите новый пароль"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ссылка на админку
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">/{window.location.host}/</span>
                      <input
                        type="text"
                        value={accountData.adminPath}
                        onChange={(e) => setAccountData({ ...accountData, adminPath: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAccount}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент формы домика
const CabinForm: React.FC<{
  cabin: any;
  defaultAmenities: string[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ cabin, defaultAmenities, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: cabin?.name || '',
    description: cabin?.description || '',
    pricePerNight: cabin?.pricePerNight || '',
    location: cabin?.location || '',
    bedrooms: cabin?.bedrooms || 1,
    bathrooms: cabin?.bathrooms || 1,
    maxGuests: cabin?.maxGuests || 2,
    amenities: cabin?.amenities || [],
    images: cabin?.images || [],
    featured: cabin?.featured || false,
    active: cabin?.active !== undefined ? cabin.active : true,
    distanceToSea: cabin?.distanceToSea || '',
    mapUrl: cabin?.mapUrl || ''
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (files: File[]) => {
    try {
      setUploading(true);
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.imageUrl);
      
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    
    setFormData({ ...formData, amenities: newAmenities });
  };

  // Функция для обработки карты
  const processMapUrl = (url: string): string => {
    if (!url.trim()) return '';
    
    // Если это iframe, извлекаем src
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch) {
        return srcMatch[1];
      }
    }
    
    // Если это уже готовая embed ссылка
    if (url.includes('google.com/maps/embed')) {
      return url;
    }
    
    // Если это обычная ссылка Google Maps, конвертируем в embed
    if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
      return url.replace('google.com/maps', 'google.com/maps/embed');
    }
    
    // Если это короткая ссылка goo.gl или maps.app.goo.gl
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      // Для коротких ссылок возвращаем как есть - браузер сам перенаправит
      return url;
    }
    
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Название обязательно для заполнения');
      return;
    }
    
    if (!formData.pricePerNight) {
      alert('Цена обязательна для заполнения');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Описание обязательно для заполнения');
      return;
    }

    // Обрабатываем URL карты
    const processedMapUrl = processMapUrl(formData.mapUrl);

    const dataToSave = {
      ...formData,
      mapUrl: processedMapUrl
    };

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {cabin ? 'Редактировать домик' : 'Добавить домик'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена за ночь (₽) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Локация
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Побережье Каспийского моря"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Расстояние до моря
                </label>
                <input
                  type="text"
                  value={formData.distanceToSea}
                  onChange={(e) => setFormData({ ...formData, distanceToSea: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5 мин"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Карта Google Maps
              </label>
              <textarea
                value={formData.mapUrl}
                onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Вставьте ссылку Google Maps или полный iframe код"
              />
              <p className="text-xs text-gray-500 mt-1">
                Можно вставить: ссылку Google Maps, iframe код целиком, или embed ссылку
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Спальни
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Удобства */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Удобства
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {defaultAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Изображения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображения
              </label>
              <FileUpload
                onFileSelect={handleImageUpload}
                multiple={true}
                className="mb-4"
              />
              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Изображение ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Настройки */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Рекомендуемый</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;