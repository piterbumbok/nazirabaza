import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Star, 
  Eye, 
  EyeOff,
  Settings,
  LogOut,
  Key,
  Link,
  Image as ImageIcon,
  MessageSquare,
  Check,
  Clock,
  User
} from 'lucide-react';
import { useAdminCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import FileUpload from '../components/FileUpload';
import { Cabin } from '../types';

interface AdminSettings {
  // Hero секция
  heroTitle?: string;
  heroSubtitle?: string;
  
  // Секция "Почему выбирают нас"
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
  whyChooseUsFeatures?: Array<{
    title: string;
    description: string;
  }>;
  
  // Контактная информация
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: string;
  footerDescription?: string;
  
  // Правила проживания
  accommodationRules?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  
  // Галерея
  galleryImages?: string[];
  
  // Технические настройки
  adminUsername?: string;
  adminPassword?: string;
  adminPath?: string;
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

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('cabins');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const { cabins, loading, addCabin, updateCabin, deleteCabin, fetchCabins } = useAdminCabins();

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (authStatus === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
      
      if (timeDiff < thirtyMinutes) {
        setIsAuthenticated(true);
      } else {
        // Сессия истекла
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthTime');
      }
    }
  }, []);

  // Загружаем настройки и отзывы при аутентификации
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
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

  const loadReviews = async () => {
    try {
      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login(loginData.username, loginData.password);
      if (response.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminAuthTime', Date.now().toString());
        setLoginData({ username: '', password: '' });
      } else {
        alert('Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    setActiveTab('cabins');
  };

  const handleSaveCabin = async (cabinData: Omit<Cabin, 'id'>) => {
    try {
      setIsLoading(true);
      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinData);
      } else {
        await addCabin(cabinData);
      }
      setEditingCabin(null);
      setShowAddForm(false);
      await fetchCabins();
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCabin = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот домик?')) {
      try {
        await deleteCabin(id);
        await fetchCabins();
      } catch (error) {
        console.error('Error deleting cabin:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      await apiService.updateSettings(settings);
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!settings.adminUsername || !settings.adminPassword) {
      alert('Заполните логин и пароль');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.updateCredentials(settings.adminUsername, settings.adminPassword);
      alert('Данные для входа обновлены!');
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Ошибка при обновлении данных для входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdminPath = async () => {
    if (!settings.adminPath) {
      alert('Введите новый путь для админки');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.updateAdminPath(settings.adminPath);
      alert(`Путь к админке изменен на: /${settings.adminPath}`);
    } catch (error) {
      console.error('Error updating admin path:', error);
      alert('Ошибка при обновлении пути к админке');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      setIsLoading(true);
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      setSettings(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setIsLoading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setSettings(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || []
    }));
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
          await apiService.deleteReview(reviewId);
        } else {
          return;
        }
      } else {
        await apiService.updateReview(reviewId, { approved: action === 'approve' });
      }
      await loadReviews();
    } catch (error) {
      console.error('Error handling review:', error);
      alert('Ошибка при обработке отзыва');
    }
  };

  // Форма входа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Home className="w-8 h-8 text-blue-600" />
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
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
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
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите пароль"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Админ панель</h1>
            </div>
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
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'cabins', name: 'Домики', icon: Home },
              { id: 'reviews', name: 'Отзывы', icon: MessageSquare },
              { id: 'settings', name: 'Настройки', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'cabins' && (
          <CabinsTab
            cabins={cabins}
            loading={loading}
            onEdit={setEditingCabin}
            onDelete={handleDeleteCabin}
            onAdd={() => setShowAddForm(true)}
            showAddForm={showAddForm}
            editingCabin={editingCabin}
            onSave={handleSaveCabin}
            onCancel={() => {
              setEditingCabin(null);
              setShowAddForm(false);
            }}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={reviews}
            onAction={handleReviewAction}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsChange={setSettings}
            onSave={handleSaveSettings}
            onUpdateCredentials={handleUpdateCredentials}
            onUpdateAdminPath={handleUpdateAdminPath}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeGalleryImage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Компонент для управления домиками
const CabinsTab: React.FC<{
  cabins: Cabin[];
  loading: boolean;
  onEdit: (cabin: Cabin) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  showAddForm: boolean;
  editingCabin: Cabin | null;
  onSave: (cabin: Omit<Cabin, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ cabins, loading, onEdit, onDelete, onAdd, showAddForm, editingCabin, onSave, onCancel, isLoading }) => {
  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (showAddForm || editingCabin) {
    return (
      <CabinForm
        cabin={editingCabin}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Управление домиками</h2>
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить домик
        </button>
      </div>

      {/* Список домиков горизонтально */}
      <div className="space-y-4">
        {cabins.map((cabin) => (
          <div key={cabin.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Изображение */}
                {cabin.images.length > 0 && (
                  <img
                    src={cabin.images[0]}
                    alt={cabin.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                
                {/* Информация */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{cabin.name}</h3>
                    {cabin.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cabin.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cabin.active ? 'Активен' : 'Скрыт'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cabin.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{cabin.pricePerNight.toLocaleString()} ₽/ночь</span>
                    <span>{cabin.bedrooms} сп.</span>
                    <span>{cabin.bathrooms} ван.</span>
                    <span>до {cabin.maxGuests} гостей</span>
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(cabin)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(cabin.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cabins.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Нет добавленных домиков</p>
        </div>
      )}
    </div>
  );
};

// Форма для добавления/редактирования домика
const CabinForm: React.FC<{
  cabin: Cabin | null;
  onSave: (cabin: Omit<Cabin, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ cabin, onSave, onCancel, isLoading }) => {
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
    featured: cabin?.featured || false,
    active: cabin?.active !== undefined ? cabin.active : true,
    distanceToSea: (cabin as any)?.distanceToSea || '',
    mapUrl: (cabin as any)?.mapUrl || ''
  });

  const [newAmenity, setNewAmenity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {cabin ? 'Редактировать домик' : 'Добавить домик'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
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
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setFormData({...formData, pricePerNight: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Локация
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Побережье Каспийского моря"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Расстояние до моря
            </label>
            <input
              type="text"
              value={formData.distanceToSea}
              onChange={(e) => setFormData({...formData, distanceToSea: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: 5 мин"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Спальни
            </label>
            <input
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ванные комнаты
            </label>
            <input
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимум гостей
            </label>
            <input
              type="number"
              value={formData.maxGuests}
              onChange={(e) => setFormData({...formData, maxGuests: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ссылка на карту (iframe src)
            </label>
            <input
              type="url"
              value={formData.mapUrl}
              onChange={(e) => setFormData({...formData, mapUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Вставьте ссылку для встраивания карты из Google Maps
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Удобства */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Удобства
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Добавить удобство"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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

        {/* Изображения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображения
          </label>
          <FileUpload onFileSelect={handleImageUpload} multiple />
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Настройки */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="mr-2"
            />
            Рекомендуемый
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="mr-2"
            />
            Активен (показывать на сайте)
          </label>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>Сохранение...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Компонент для управления отзывами
const ReviewsTab: React.FC<{
  reviews: Review[];
  onAction: (id: string, action: 'approve' | 'reject' | 'delete') => void;
}> = ({ reviews, onAction }) => {
  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление отзывами</h2>
        
        {/* Ожидающие модерации */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Ожидают модерации ({pendingReviews.length})
          </h3>
          
          {pendingReviews.length === 0 ? (
            <p className="text-gray-500">Нет отзывов на модерации</p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <ReviewCard key={review.id} review={review} onAction={onAction} />
              ))}
            </div>
          )}
        </div>

        {/* Одобренные */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Одобренные ({approvedReviews.length})
          </h3>
          
          {approvedReviews.length === 0 ? (
            <p className="text-gray-500">Нет одобренных отзывов</p>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} onAction={onAction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Карточка отзыва
const ReviewCard: React.FC<{
  review: Review;
  onAction: (id: string, action: 'approve' | 'reject' | 'delete') => void;
}> = ({ review, onAction }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 text-white font-bold">
            {review.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
            <p className="text-sm text-gray-500">{review.email}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
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

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {review.comment}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs rounded-full ${
          review.approved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {review.approved ? 'Одобрен' : 'На модерации'}
        </span>
        
        <div className="flex space-x-2">
          {!review.approved && (
            <button
              onClick={() => onAction(review.id, 'approve')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Одобрить
            </button>
          )}
          
          {review.approved && (
            <button
              onClick={() => onAction(review.id, 'reject')}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
            >
              Скрыть
            </button>
          )}
          
          <button
            onClick={() => onAction(review.id, 'delete')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент настроек
const SettingsTab: React.FC<{
  settings: AdminSettings;
  onSettingsChange: (settings: AdminSettings) => void;
  onSave: () => void;
  onUpdateCredentials: () => void;
  onUpdateAdminPath: () => void;
  onImageUpload: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  isLoading: boolean;
}> = ({ 
  settings, 
  onSettingsChange, 
  onSave, 
  onUpdateCredentials, 
  onUpdateAdminPath,
  onImageUpload,
  onRemoveImage,
  isLoading 
}) => {
  const updateSetting = (key: keyof AdminSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const addFeature = () => {
    const features = settings.whyChooseUsFeatures || [];
    updateSetting('whyChooseUsFeatures', [
      ...features,
      { title: '', description: '' }
    ]);
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const features = [...(settings.whyChooseUsFeatures || [])];
    features[index] = { ...features[index], [field]: value };
    updateSetting('whyChooseUsFeatures', features);
  };

  const removeFeature = (index: number) => {
    const features = settings.whyChooseUsFeatures || [];
    updateSetting('whyChooseUsFeatures', features.filter((_, i) => i !== index));
  };

  const addRule = () => {
    const rules = settings.accommodationRules || [];
    updateSetting('accommodationRules', [...rules, '']);
  };

  const updateRule = (index: number, value: string) => {
    const rules = [...(settings.accommodationRules || [])];
    rules[index] = value;
    updateSetting('accommodationRules', rules);
  };

  const removeRule = (index: number) => {
    const rules = settings.accommodationRules || [];
    updateSetting('accommodationRules', rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Настройки сайта</h2>
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Сохранение...' : 'Сохранить все'}
        </button>
      </div>

      {/* Hero секция */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Главная страница</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок Hero секции
            </label>
            <input
              type="text"
              value={settings.heroTitle || ''}
              onChange={(e) => updateSetting('heroTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Уютные домики и квартиры на берегу каспия"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подзаголовок Hero секции
            </label>
            <textarea
              value={settings.heroSubtitle || ''}
              onChange={(e) => updateSetting('heroSubtitle', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Отдохните от городской суеты..."
            />
          </div>
        </div>
      </div>

      {/* Секция "Почему выбирают нас" */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Секция "Почему выбирают нас"</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок секции
            </label>
            <input
              type="text"
              value={settings.whyChooseUsTitle || ''}
              onChange={(e) => updateSetting('whyChooseUsTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Почему выбирают нас"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подзаголовок секции
            </label>
            <textarea
              value={settings.whyChooseUsSubtitle || ''}
              onChange={(e) => updateSetting('whyChooseUsSubtitle', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Мы создаем идеальные условия..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Преимущества
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {(settings.whyChooseUsFeatures || []).map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">Преимущество {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Заголовок преимущества"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Описание преимущества"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Контактная информация */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.footerEmail || ''}
              onChange={(e) => updateSetting('footerEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
            <input
              type="tel"
              value={settings.footerPhone || ''}
              onChange={(e) => updateSetting('footerPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
            <input
              type="text"
              value={settings.footerAddress || ''}
              onChange={(e) => updateSetting('footerAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание в футере</label>
            <textarea
              value={settings.footerDescription || ''}
              onChange={(e) => updateSetting('footerDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Правила проживания */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Правила проживания</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время заезда</label>
              <input
                type="text"
                value={settings.checkInTime || ''}
                onChange={(e) => updateSetting('checkInTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="после 14:00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время выезда</label>
              <input
                type="text"
                value={settings.checkOutTime || ''}
                onChange={(e) => updateSetting('checkOutTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="до 12:00"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Дополнительные правила
              </label>
              <button
                type="button"
                onClick={addRule}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {(settings.accommodationRules || []).map((rule, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Правило проживания"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Галерея */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Галерея на главной странице</h3>
        
        <FileUpload onFileSelect={onImageUpload} multiple className="mb-4" />
        
        {settings.galleryImages && settings.galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.galleryImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Галерея ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Технические настройки */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Технические настройки</h3>
        
        <div className="space-y-6">
          {/* Данные для входа */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Данные для входа в админку</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                <input
                  type="text"
                  value={settings.adminUsername || ''}
                  onChange={(e) => updateSetting('adminUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                <input
                  type="password"
                  value={settings.adminPassword || ''}
                  onChange={(e) => updateSetting('adminPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={onUpdateCredentials}
              disabled={isLoading}
              className="mt-3 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Key className="w-4 h-4 mr-2" />
              Обновить данные для входа
            </button>
          </div>

          {/* Ссылка на админку */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Ссылка на админку</h4>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Путь к админке</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                    /
                  </span>
                  <input
                    type="text"
                    value={settings.adminPath || ''}
                    onChange={(e) => updateSetting('adminPath', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={onUpdateAdminPath}
              disabled={isLoading}
              className="mt-3 flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Link className="w-4 h-4 mr-2" />
              Обновить ссылку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;