import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import FileUpload from '../components/FileUpload';
import ReviewModal from '../components/ReviewModal';
import { useAdminCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import { 
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
  Settings,
  Home,
  Image as ImageIcon,
  MapPin,
  Clock
} from 'lucide-react';

interface AdminSettings {
  siteName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  phone?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerAddress?: string;
  footerDescription?: string;
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
  whyChooseUsFeatures?: Array<{ title: string; description: string }>;
  galleryImages?: string[];
  defaultDistanceToSea?: string;
  defaultMapUrl?: string;
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

interface CabinFormData {
  name: string;
  description: string;
  pricePerNight: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  distanceToSea?: string;
  mapUrl?: string;
}

const STANDARD_AMENITIES = [
  'Wi-Fi',
  'Кондиционер',
  'Терраса',
  'Барбекю',
  'Парковка',
  'Стиральная машина',
  'Кухня',
  'Телевизор',
  'Холодильник',
  'Микроволновка',
  'Посудомоечная машина',
  'Фен',
  'Утюг',
  'Сейф',
  'Балкон',
  'Джакузи',
  'Сауна',
  'Бассейн',
  'Детская площадка',
  'Прямой выход к морю'
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [editingCabin, setEditingCabin] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [adminPath, setAdminPath] = useState('admin');
  const [newAdminPath, setNewAdminPath] = useState('');
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  const { cabins, loading, addCabin, updateCabin, deleteCabin, fetchCabins } = useAdminCabins();

  const [cabinForm, setCabinForm] = useState<CabinFormData>({
    name: '',
    description: '',
    pricePerNight: 0,
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    images: [],
    featured: false,
    active: true,
    distanceToSea: '',
    mapUrl: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn) {
        try {
          const [settingsData, reviewsData, pathData] = await Promise.all([
            apiService.getSettings(),
            apiService.getReviews(),
            apiService.getAdminPath()
          ]);
          
          setSettings(settingsData);
          setReviews(reviewsData);
          setAdminPath(pathData.path);
        } catch (error) {
          console.error('Error loading admin data:', error);
        }
      }
    };

    loadData();
  }, [isLoggedIn]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setIsLoggedIn(true);
        // Сохраняем состояние входа в localStorage на 30 минут
        const loginData = {
          timestamp: Date.now(),
          deviceId: navigator.userAgent + navigator.language
        };
        localStorage.setItem('adminLogin', JSON.stringify(loginData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Проверяем сохраненный вход при загрузке
  useEffect(() => {
    const savedLogin = localStorage.getItem('adminLogin');
    if (savedLogin) {
      try {
        const loginData = JSON.parse(savedLogin);
        const currentTime = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        // Проверяем, не прошло ли 30 минут и совпадает ли устройство
        if (
          currentTime - loginData.timestamp < thirtyMinutes &&
          loginData.deviceId === navigator.userAgent + navigator.language
        ) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('adminLogin');
        }
      } catch (error) {
        localStorage.removeItem('adminLogin');
      }
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLogin');
    navigate('/');
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      setCabinForm(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      const newGalleryImages = [...(settings.galleryImages || []), ...imageUrls];
      const newSettings = { ...settings, galleryImages: newGalleryImages };
      
      await apiService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Ошибка при загрузке изображений в галерею');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setCabinForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeGalleryImage = async (index: number) => {
    const newGalleryImages = (settings.galleryImages || []).filter((_, i) => i !== index);
    const newSettings = { ...settings, galleryImages: newGalleryImages };
    
    try {
      await apiService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error removing gallery image:', error);
      alert('Ошибка при удалении изображения');
    }
  };

  const handleSubmitCabin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCabin) {
        await updateCabin(editingCabin, cabinForm);
      } else {
        await addCabin(cabinForm);
      }
      
      resetForm();
      await fetchCabins();
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении домика');
    }
  };

  const resetForm = () => {
    setCabinForm({
      name: '',
      description: '',
      pricePerNight: 0,
      location: '',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: [],
      images: [],
      featured: false,
      active: true,
      distanceToSea: '',
      mapUrl: ''
    });
    setEditingCabin(null);
    setShowAddForm(false);
  };

  const handleEditCabin = (cabin: any) => {
    setCabinForm({
      name: cabin.name,
      description: cabin.description,
      pricePerNight: cabin.pricePerNight,
      location: cabin.location,
      bedrooms: cabin.bedrooms,
      bathrooms: cabin.bathrooms,
      maxGuests: cabin.maxGuests,
      amenities: cabin.amenities,
      images: cabin.images,
      featured: cabin.featured,
      active: cabin.active,
      distanceToSea: (cabin as any).distanceToSea || '',
      mapUrl: (cabin as any).mapUrl || ''
    });
    setEditingCabin(cabin.id);
    setShowAddForm(true);
  };

  const handleDeleteCabin = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот домик?')) {
      try {
        await deleteCabin(id);
        await fetchCabins();
      } catch (error) {
        console.error('Error deleting cabin:', error);
        alert('Ошибка при удалении домика');
      }
    }
  };

  const toggleCabinActive = async (cabin: any) => {
    try {
      const updatedCabin = { ...cabin, active: !cabin.active };
      await updateCabin(cabin.id, updatedCabin);
      await fetchCabins();
    } catch (error) {
      console.error('Error toggling cabin active status:', error);
      alert('Ошибка при изменении статуса домика');
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setCabinForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addCustomAmenity = () => {
    const customAmenity = prompt('Введите название удобства:');
    if (customAmenity && customAmenity.trim()) {
      setCabinForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
    }
  };

  const removeCustomAmenity = (amenity: string) => {
    setCabinForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
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

  const handleUpdateAdminPath = async () => {
    if (!newAdminPath.trim()) {
      alert('Введите новый путь для админки');
      return;
    }

    try {
      await apiService.updateAdminPath(newAdminPath);
      setAdminPath(newAdminPath);
      setNewAdminPath('');
      alert(`Путь админки изменен на: /${newAdminPath}`);
    } catch (error) {
      console.error('Error updating admin path:', error);
      alert('Ошибка при изменении пути админки');
    }
  };

  const handleUpdateCredentials = async () => {
    if (!adminCredentials.username.trim() || !adminCredentials.password.trim()) {
      alert('Введите логин и пароль');
      return;
    }

    try {
      await apiService.updateCredentials(adminCredentials.username, adminCredentials.password);
      setAdminCredentials({ username: '', password: '' });
      alert('Данные для входа обновлены!');
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Ошибка при обновлении данных для входа');
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
          await apiService.deleteReview(reviewId);
          setReviews(prev => prev.filter(r => r.id !== reviewId));
        }
      } else {
        const approved = action === 'approve';
        await apiService.updateReview(reviewId, { approved });
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, approved } : r
        ));
      }
    } catch (error) {
      console.error('Error handling review action:', error);
      alert('Ошибка при обработке отзыва');
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Путь: /{adminPath}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'cabins', name: 'Управление домиками', icon: Home },
                { id: 'reviews', name: 'Отзывы', icon: MessageSquare },
                { id: 'settings', name: 'Настройки сайта', icon: Settings },
                { id: 'gallery', name: 'Галерея', icon: ImageIcon },
                { id: 'admin', name: 'Админ настройки', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Cabins Tab */}
        {activeTab === 'cabins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Управление домиками</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить домик
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {editingCabin ? 'Редактировать домик' : 'Добавить новый домик'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitCabin} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название *
                      </label>
                      <input
                        type="text"
                        value={cabinForm.name}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Цена за ночь (₽) *
                      </label>
                      <input
                        type="number"
                        value={cabinForm.pricePerNight}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Локация
                      </label>
                      <input
                        type="text"
                        value={cabinForm.location}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Например: Побережье Каспийского моря"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        До моря
                      </label>
                      <input
                        type="text"
                        value={cabinForm.distanceToSea}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, distanceToSea: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`По умолчанию: ${settings.defaultDistanceToSea || '5 мин'}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL карты
                      </label>
                      <input
                        type="url"
                        value={cabinForm.mapUrl}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, mapUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Если не указано, будет использована карта по умолчанию из настроек
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Спальни
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cabinForm.bedrooms}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 1 }))}
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
                        onChange={(e) => setCabinForm(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Максимум гостей
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cabinForm.maxGuests}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание *
                    </label>
                    <textarea
                      value={cabinForm.description}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Удобства
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                      {STANDARD_AMENITIES.map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={cabinForm.amenities.includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="mr-2"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Custom amenities */}
                    {cabinForm.amenities.filter(a => !STANDARD_AMENITIES.includes(a)).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Дополнительные удобства:</h4>
                        <div className="flex flex-wrap gap-2">
                          {cabinForm.amenities
                            .filter(a => !STANDARD_AMENITIES.includes(a))
                            .map((amenity) => (
                              <span
                                key={amenity}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {amenity}
                                <button
                                  type="button"
                                  onClick={() => removeCustomAmenity(amenity)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={addCustomAmenity}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Добавить свое удобство
                    </button>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Изображения
                    </label>
                    
                    {cabinForm.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {cabinForm.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Изображение ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <FileUpload
                      onFileSelect={handleFileUpload}
                      multiple={true}
                      className="mb-4"
                    />
                    
                    {uploadingImages && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Загрузка изображений...
                      </div>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cabinForm.featured}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Рекомендуемый</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cabinForm.active}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Активный</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingCabin ? 'Обновить' : 'Создать'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Cabins List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Список домиков</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : cabins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Домики не найдены
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cabins.map((cabin) => (
                      <div
                        key={cabin.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          cabin.active ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {cabin.images.length > 0 && (
                            <img
                              src={cabin.images[0]}
                              alt={cabin.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{cabin.name}</h4>
                            <p className="text-sm text-gray-600">
                              {cabin.pricePerNight.toLocaleString()} ₽/ночь
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {cabin.featured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Рекомендуемый
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                cabin.active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {cabin.active ? 'Активный' : 'Неактивный'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCabinActive(cabin)}
                            className={`p-2 rounded-lg transition-colors ${
                              cabin.active
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={cabin.active ? 'Скрыть домик' : 'Показать домик'}
                          >
                            {cabin.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                          
                          <button
                            onClick={() => handleEditCabin(cabin)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Редактировать"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCabin(cabin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Управление отзывами</h2>
            
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Отзывы не найдены
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className={`p-4 border rounded-lg ${
                          review.approved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h4 className="font-semibold text-gray-900">{review.name}</h4>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-2">
                              {truncateText(review.comment, 200)}
                              {review.comment.length > 200 && (
                                <button
                                  onClick={() => setSelectedReview(review)}
                                  className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Читать полностью
                                </button>
                              )}
                            </p>
                            
                            <p className="text-sm text-gray-500">Email: {review.email}</p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!review.approved && (
                              <button
                                onClick={() => handleReviewAction(review.id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Одобрить"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            
                            {review.approved && (
                              <button
                                onClick={() => handleReviewAction(review.id, 'reject')}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title="Скрыть"
                              >
                                <EyeOff className="w-5 h-5" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleReviewAction(review.id, 'delete')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Удалить"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Настройки сайта</h2>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Основные настройки</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название сайта
                      </label>
                      <input
                        type="text"
                        value={settings.siteName || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="В гости"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="text"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+7 965 411-15-55"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Главная секция</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок
                      </label>
                      <input
                        type="text"
                        value={settings.heroTitle || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
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
                        onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Отдохните от городской суеты в наших комфортабельных объектах с живописным видом на Каспийское море"
                      />
                    </div>
                  </div>
                </div>

                {/* Why Choose Us Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Секция "Почему выбирают нас"</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок секции
                      </label>
                      <input
                        type="text"
                        value={settings.whyChooseUsTitle || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, whyChooseUsTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Почему выбирают нас"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Подзаголовок секции
                      </label>
                      <textarea
                        value={settings.whyChooseUsSubtitle || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, whyChooseUsSubtitle: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали."
                      />
                    </div>
                  </div>
                </div>

                {/* Default Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки по умолчанию</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Расстояние до моря по умолчанию
                      </label>
                      <input
                        type="text"
                        value={settings.defaultDistanceToSea || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultDistanceToSea: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5 мин"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        URL карты по умолчанию
                      </label>
                      <input
                        type="url"
                        value={settings.defaultMapUrl || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultMapUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Подвал сайта</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон в подвале
                      </label>
                      <input
                        type="text"
                        value={settings.footerPhone || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, footerPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+7 965 411-15-55"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email в подвале
                      </label>
                      <input
                        type="email"
                        value={settings.footerEmail || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, footerEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="info@vgosti.ru"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес в подвале
                      </label>
                      <input
                        type="text"
                        value={settings.footerAddress || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, footerAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Приморский бульвар, 123, Морской город, Россия"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание в подвале
                      </label>
                      <textarea
                        value={settings.footerDescription || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, footerDescription: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Уютные домики и современные квартиры на берегу моря для незабываемого отдыха."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить настройки
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Управление галереей</h2>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Изображения галереи</h3>
                  
                  {settings.galleryImages && settings.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {settings.galleryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Галерея ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <FileUpload
                    onFileSelect={handleGalleryUpload}
                    multiple={true}
                    className="mb-4"
                  />
                  
                  {uploadingImages && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Загрузка изображений в галерею...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Админ настройки</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Change Admin Path */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Изменить путь админки</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Текущий путь: <code className="bg-gray-100 px-2 py-1 rounded">/{adminPath}</code>
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newAdminPath}
                    onChange={(e) => setNewAdminPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Новый путь (например: secret-admin)"
                  />
                  <button
                    onClick={handleUpdateAdminPath}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Изменить путь
                  </button>
                </div>
              </div>

              {/* Change Admin Credentials */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Изменить данные для входа</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Новый логин"
                  />
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Новый пароль"
                  />
                  <button
                    onClick={handleUpdateCredentials}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Обновить данные
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;

export default AdminPage