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
  MapPin,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Star,
  Loader
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
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
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
  defaultMapUrl?: string;
  defaultDistanceToSea?: string;
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

// Стандартные удобства
const STANDARD_AMENITIES = [
  'Wi-Fi',
  'Кондиционер',
  'Терраса',
  'Барбекю',
  'Парковка',
  'Стиральная машина',
  'Кухня',
  'Холодильник',
  'Телевизор',
  'Душ',
  'Полотенца',
  'Постельное белье'
];

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
  const [reviews, setReviews] = useState<Review[]>([]);

  const { cabins, loading, addCabin, updateCabin, deleteCabin, fetchCabins } = useCabins();

  const [cabinForm, setCabinForm] = useState({
    name: '',
    description: '',
    pricePerNight: 0,
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: STANDARD_AMENITIES.slice(0, 5), // Первые 5 стандартных удобств
    images: [] as string[],
    featured: false,
    active: true,
    distanceToSea: '',
    mapUrl: ''
  });

  // Проверяем сессию при загрузке
  useEffect(() => {
    const savedAuth = localStorage.getItem('vgosti_admin_auth');
    const savedTime = localStorage.getItem('vgosti_admin_time');
    
    if (savedAuth && savedTime) {
      const authTime = parseInt(savedTime);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
      
      if (now - authTime < thirtyMinutes) {
        setIsAuthenticated(true);
        const authData = JSON.parse(savedAuth);
        setCredentials(authData);
      } else {
        // Сессия истекла
        localStorage.removeItem('vgosti_admin_auth');
        localStorage.removeItem('vgosti_admin_time');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      loadAdminPath();
      loadReviews();
    }
  }, [isAuthenticated]);

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

  const loadReviews = async () => {
    try {
      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setIsAuthenticated(true);
        setCredentials({ username, password });
        
        // Сохраняем сессию на 30 минут
        localStorage.setItem('vgosti_admin_auth', JSON.stringify({ username, password }));
        localStorage.setItem('vgosti_admin_time', Date.now().toString());
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vgosti_admin_auth');
    localStorage.removeItem('vgosti_admin_time');
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
      
      // Обновляем сохраненную сессию
      localStorage.setItem('vgosti_admin_auth', JSON.stringify(newCredentials));
      localStorage.setItem('vgosti_admin_time', Date.now().toString());
      
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
      alert(`Ссылка на админку изменена! Новая ссылка: /${newAdminPath}\n\nСтарая ссылка /admin больше не работает!`);
      setNewAdminPath('');
      
      // Перенаправляем на новую ссылку
      setTimeout(() => {
        window.location.href = `/${newAdminPath}`;
      }, 2000);
    } catch (error) {
      console.error('Error updating admin path:', error);
      alert('Ошибка при обновлении ссылки');
    }
  };

  const handleMultipleFileUpload = async (files: File[], type: 'cabin' | 'gallery') => {
    try {
      const fileNames = files.map(f => f.name);
      setUploadingImages(prev => [...prev, ...fileNames]);
      
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      if (type === 'cabin') {
        setCabinForm(prev => ({
          ...prev,
          images: [...prev.images, ...results.map(r => r.imageUrl)]
        }));
      } else if (type === 'gallery') {
        setSettings(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), ...results.map(r => r.imageUrl)]
        }));
      }
      
      setUploadingImages(prev => prev.filter(name => !fileNames.includes(name)));
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

  const handleToggleCabinActive = async (cabin: Cabin) => {
    try {
      const updatedCabin = { 
        ...cabin, 
        active: !cabin.active,
        // Убираем поля, которые не нужны для API
        id: undefined
      };
      
      // Удаляем id из объекта перед отправкой
      const { id, ...cabinDataWithoutId } = updatedCabin;
      
      await updateCabin(cabin.id, cabinDataWithoutId);
      // Обновляем локальное состояние
      await fetchCabins();
      
      console.log(`Cabin ${cabin.id} active status changed to: ${!cabin.active}`);
    } catch (error) {
      console.error('Error toggling cabin active:', error);
      alert('Ошибка при изменении статуса домика');
    }
  };

  const handleApproveReview = async (reviewId: string, approved: boolean) => {
    try {
      await apiService.updateReview(reviewId, { approved });
      loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Ошибка при обновлении отзыва');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Удалить этот отзыв?')) {
      try {
        await apiService.deleteReview(reviewId);
        loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Ошибка при удалении отзыва');
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
      amenities: STANDARD_AMENITIES.slice(0, 5), // Сбрасываем к стандартным удобствам
      images: [],
      featured: false,
      active: true,
      distanceToSea: settings.defaultDistanceToSea || '5 мин',
      mapUrl: settings.defaultMapUrl || ''
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
      amenities: cabin.amenities,
      images: cabin.images,
      featured: cabin.featured,
      active: cabin.active !== undefined ? cabin.active : true,
      distanceToSea: (cabin as any).distanceToSea || '5 мин',
      mapUrl: (cabin as any).mapUrl || ''
    });
    setEditingCabin(cabin);
    setIsAddingCabin(true);
  };

  const addAmenity = () => {
    setCabinForm(prev => ({ ...prev, amenities: [...prev.amenities, ''] }));
  };

  const removeAmenity = (index: number) => {
    setCabinForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const updateAmenity = (index: number, value: string) => {
    setCabinForm(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => i === index ? value : amenity)
    }));
  };

  const addStandardAmenity = (amenity: string) => {
    if (!cabinForm.amenities.includes(amenity)) {
      setCabinForm(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
    }
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
                onClick={handleLogout}
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
            { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Локация (необязательно)</label>
                    <input
                      type="text"
                      value={cabinForm.location}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Например: Побережье Каспийского моря"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">До моря</label>
                    <input
                      type="text"
                      value={cabinForm.distanceToSea}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, distanceToSea: e.target.value }))}
                      placeholder="5 мин"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Карта (URL)</label>
                    <input
                      type="url"
                      value={cabinForm.mapUrl}
                      onChange={(e) => setCabinForm(prev => ({ ...prev, mapUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Если не заполнено, будет использована карта по умолчанию из настроек
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Удобства</label>
                    
                    {/* Стандартные удобства */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Быстрое добавление:</p>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_AMENITIES.map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => addStandardAmenity(amenity)}
                            disabled={cabinForm.amenities.includes(amenity)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              cabinForm.amenities.includes(amenity)
                                ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100 hover:text-blue-800'
                            }`}
                          >
                            {amenity} {cabinForm.amenities.includes(amenity) && '✓'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Список удобств */}
                    {cabinForm.amenities.map((amenity, index) => (
                      <div key={index} className="flex mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => updateAmenity(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Удобство"
                        />
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Добавить свое удобство
                    </button>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Изображения 
                      {uploadingImages.length > 0 && (
                        <span className="text-blue-600 ml-2">
                          <Loader className="w-4 h-4 inline animate-spin mr-1" />
                          Загружается: {uploadingImages.length} файлов
                        </span>
                      )}
                    </label>
                    <FileUpload
                      onFileSelect={(files) => handleMultipleFileUpload(files, 'cabin')}
                      accept="image/*"
                      multiple={true}
                      className="mb-4"
                    />
                    <div className="grid grid-cols-4 gap-4">
                      {cabinForm.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Изображение ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => {
                              setCabinForm(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cabinForm.featured}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="mr-2"
                      />
                      Рекомендуемый домик
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cabinForm.active}
                        onChange={(e) => setCabinForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="mr-2"
                      />
                      Активный (виден на сайте)
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

            {/* Список домиков горизонтально */}
            <div className="space-y-4">
              {cabins.map((cabin) => (
                <div key={cabin.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center space-x-4">
                  <img
                    src={cabin.images[0] || '/placeholder.jpg'}
                    alt={cabin.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{cabin.name}</h3>
                      {cabin.featured && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Рекомендуемый</span>}
                      <span className={`text-xs px-2 py-1 rounded ${cabin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cabin.active ? 'Активный' : 'Неактивный'}
                      </span>
                    </div>
                    {cabin.location && <p className="text-gray-600 text-sm mb-1">{cabin.location}</p>}
                    <p className="text-blue-600 font-bold">{formatPrice(cabin.pricePerNight)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleCabinActive(cabin)}
                      className={`p-2 rounded-lg transition-colors ${
                        cabin.active 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={cabin.active ? 'Скрыть с сайта' : 'Показать на сайте'}
                    >
                      {cabin.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditCabin(cabin)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCabin(cabin.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Основные настройки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название сайта (в шапке и подвале)</label>
                    <input
                      type="text"
                      value={settings.siteName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="В гости"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон (в шапке сайта)</label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+7 965 411-15-55"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Настройки для всех домиков</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Расстояние до моря по умолчанию</label>
                    <input
                      type="text"
                      value={settings.defaultDistanceToSea || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultDistanceToSea: e.target.value }))}
                      placeholder="5 мин"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Карта по умолчанию (URL)</label>
                    <input
                      type="url"
                      value={settings.defaultMapUrl || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultMapUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Главная страница</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок героя (большой текст на главной)</label>
                    <input
                      type="text"
                      value={settings.heroTitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder="Уютные домики и квартиры на берегу каспия"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок героя (описание под заголовком)</label>
                    <textarea
                      value={settings.heroSubtitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      placeholder="Отдохните от городской суеты в наших комфортабельных объектах..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Галерея на главной странице</h3>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображения галереи 
                  {uploadingImages.length > 0 && (
                    <span className="text-blue-600 ml-2">
                      <Loader className="w-4 h-4 inline animate-spin mr-1" />
                      Загружается: {uploadingImages.length} файлов
                    </span>
                  )}
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

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Раздел "Почему выбирают нас"</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок раздела</label>
                    <input
                      type="text"
                      value={settings.whyChooseUsTitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, whyChooseUsTitle: e.target.value }))}
                      placeholder="Почему выбирают нас"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Подзаголовок раздела</label>
                    <textarea
                      value={settings.whyChooseUsSubtitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, whyChooseUsSubtitle: e.target.value }))}
                      placeholder="Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {(settings.whyChooseUsFeatures || []).map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...(settings.whyChooseUsFeatures || [])];
                              newFeatures[index] = { ...feature, title: e.target.value };
                              setSettings(prev => ({ ...prev, whyChooseUsFeatures: newFeatures }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              const newFeatures = (settings.whyChooseUsFeatures || []).filter((_, i) => i !== index);
                              setSettings(prev => ({ ...prev, whyChooseUsFeatures: newFeatures }));
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...(settings.whyChooseUsFeatures || [])];
                            newFeatures[index] = { ...feature, description: e.target.value };
                            setSettings(prev => ({ ...prev, whyChooseUsFeatures: newFeatures }));
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...(settings.whyChooseUsFeatures || []), { title: '', description: '' }];
                      setSettings(prev => ({ ...prev, whyChooseUsFeatures: newFeatures }));
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Добавить преимущество
                  </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок страницы</label>
                  <input
                    type="text"
                    value={settings.contactInfo?.title || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, title: e.target.value }
                    }))}
                    placeholder="Контакты"
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
                    placeholder="Свяжитесь с нами любым удобным способом"
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
                    placeholder="+7 965 411-15-55"
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
                    placeholder="info@vgosti.ru"
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
                    placeholder="+79654111555"
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
                    placeholder="@vgosti_support"
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
                  placeholder="Приморский бульвар, 123, Морской город, Россия"
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

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Управление отзывами</h2>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{review.name}</h3>
                      <p className="text-gray-600 text-sm">{review.email}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {review.approved ? 'Одобрен' : 'На модерации'}
                      </span>
                      <button
                        onClick={() => handleApproveReview(review.id, !review.approved)}
                        className={`p-2 rounded-lg ${review.approved ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        title={review.approved ? 'Скрыть отзыв' : 'Одобрить отзыв'}
                      >
                        {review.approved ? <EyeOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Удалить отзыв"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Отзывов пока нет</p>
                </div>
              )}
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
                  ⚠️ После изменения ссылки, старая ссылка перестанет работать!
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