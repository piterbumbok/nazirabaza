import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Upload, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  LogOut,
  Star,
  MessageSquare,
  Check,
  Clock,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';
import LoginForm from '../components/LoginForm';
import FileUpload from '../components/FileUpload';
import { useAdminCabins } from '../hooks/useCabins';
import { Cabin } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { apiService } from '../services/api';
import ReviewModal from '../components/ReviewModal';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [adminPath, setAdminPath] = useState('admin');
  const [loading, setLoading] = useState(false);

  // Состояние для запоминания входа
  useEffect(() => {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (savedLogin === 'true' && loginTime) {
      const now = new Date().getTime();
      const loginTimestamp = parseInt(loginTime);
      const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
      
      if (now - loginTimestamp < thirtyMinutes) {
        setIsLoggedIn(true);
      } else {
        // Время истекло, очищаем данные
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
      }
    }
  }, []);

  const { cabins, loading: cabinsLoading, fetchCabins, addCabin, updateCabin, deleteCabin } = useAdminCabins();

  const [newCabin, setNewCabin] = useState<Omit<Cabin, 'id'>>({
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
    active: true
  });

  // Дополнительные поля для домиков
  const [cabinExtras, setCabinExtras] = useState<{
    distanceToSea: string;
    mapUrl: string;
  }>({
    distanceToSea: '',
    mapUrl: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadReviews();
      loadSettings();
      loadAdminPath();
    }
  }, [isLoggedIn]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setIsLoggedIn(true);
        // Сохраняем состояние входа на 30 минут
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', new Date().getTime().toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
  };

  const loadReviews = async () => {
    try {
      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

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
      const pathData = await apiService.getAdminPath();
      setAdminPath(pathData.path);
    } catch (error) {
      console.error('Error loading admin path:', error);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      setLoading(true);
      const results = await apiService.uploadImages(files);
      
      if (editingCabin) {
        setEditingCabin({
          ...editingCabin,
          images: [...editingCabin.images, ...results.imageUrls]
        });
      } else {
        setNewCabin({
          ...newCabin,
          images: [...newCabin.images, ...results.imageUrls]
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    if (editingCabin) {
      const newImages = editingCabin.images.filter((_, i) => i !== index);
      setEditingCabin({ ...editingCabin, images: newImages });
    } else {
      const newImages = newCabin.images.filter((_, i) => i !== index);
      setNewCabin({ ...newCabin, images: newImages });
    }
  };

  const handleSaveCabin = async () => {
    try {
      setLoading(true);
      const cabinData = editingCabin || newCabin;
      
      // Добавляем дополнительные поля
      const cabinWithExtras = {
        ...cabinData,
        distanceToSea: cabinExtras.distanceToSea,
        mapUrl: cabinExtras.mapUrl
      };

      if (editingCabin) {
        await updateCabin(editingCabin.id, cabinWithExtras);
        setEditingCabin(null);
      } else {
        await addCabin(cabinWithExtras);
        setNewCabin({
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
          active: true
        });
        setCabinExtras({ distanceToSea: '', mapUrl: '' });
        setShowAddForm(false);
      }
      
      await fetchCabins();
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении домика');
    } finally {
      setLoading(false);
    }
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

  const toggleCabinActive = async (cabin: Cabin) => {
    try {
      await updateCabin(cabin.id, { ...cabin, active: !cabin.active });
      await fetchCabins();
    } catch (error) {
      console.error('Error toggling cabin active status:', error);
      alert('Ошибка при изменении статуса домика');
    }
  };

  const handleReviewAction = async (reviewId: string, approved: boolean) => {
    try {
      await apiService.updateReview(reviewId, { approved });
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Ошибка при обновлении отзыва');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await apiService.deleteReview(reviewId);
        await loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Ошибка при удалении отзыва');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await apiService.updateSettings(settings);
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    try {
      setLoading(true);
      await apiService.updateCredentials(credentials.username, credentials.password);
      alert('Данные для входа обновлены!');
      setCredentials({ username: '', password: '' });
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Ошибка при обновлении данных для входа');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdminPath = async () => {
    try {
      setLoading(true);
      await apiService.updateAdminPath(adminPath);
      alert('Ссылка на админку обновлена! Новая ссылка: /' + adminPath);
    } catch (error) {
      console.error('Error updating admin path:', error);
      alert('Ошибка при обновлении ссылки на админку');
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = (cabin: Cabin | Omit<Cabin, 'id'>, amenity: string) => {
    if (!amenity.trim()) return;
    
    const newAmenities = [...cabin.amenities, amenity.trim()];
    
    if (editingCabin) {
      setEditingCabin({ ...editingCabin, amenities: newAmenities });
    } else {
      setNewCabin({ ...newCabin, amenities: newAmenities });
    }
  };

  const removeAmenity = (cabin: Cabin | Omit<Cabin, 'id'>, index: number) => {
    const newAmenities = cabin.amenities.filter((_, i) => i !== index);
    
    if (editingCabin) {
      setEditingCabin({ ...editingCabin, amenities: newAmenities });
    } else {
      setNewCabin({ ...newCabin, amenities: newAmenities });
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const currentCabin = editingCabin || newCabin;

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
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'cabins', label: 'Домики', icon: Home },
            { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
            { id: 'settings', label: 'Настройки', icon: Settings }
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
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Домики */}
        {activeTab === 'cabins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Управление домиками</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить домик
              </button>
            </div>

            {cabinsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {cabins.map((cabin) => (
                  <div key={cabin.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-lg font-bold text-gray-900">{cabin.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cabin.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cabin.active ? 'Активен' : 'Скрыт'}
                          </span>
                          {cabin.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Популярный
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Цена за ночь</span>
                            <p className="font-medium">{formatPrice(cabin.pricePerNight)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Спальни/Ванные</span>
                            <p className="font-medium">{cabin.bedrooms}/{cabin.bathrooms}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Макс. гостей</span>
                            <p className="font-medium">{cabin.maxGuests}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Изображений</span>
                            <p className="font-medium">{cabin.images.length}</p>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{truncateText(cabin.description, 150)}</p>
                        
                        {cabin.images.length > 0 && (
                          <div className="flex space-x-2 mb-4">
                            {cabin.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${cabin.name} ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ))}
                            {cabin.images.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                +{cabin.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => toggleCabinActive(cabin)}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            cabin.active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {cabin.active ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Скрыть
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Показать
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingCabin(cabin);
                            setCabinExtras({
                              distanceToSea: (cabin as any).distanceToSea || '',
                              mapUrl: (cabin as any).mapUrl || ''
                            });
                          }}
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Редактировать
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCabin(cabin.id)}
                          className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Форма добавления/редактирования домика */}
            {(showAddForm || editingCabin) && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        {editingCabin ? 'Редактировать домик' : 'Добавить домик'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingCabin(null);
                          setShowAddForm(false);
                          setCabinExtras({ distanceToSea: '', mapUrl: '' });
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название *
                        </label>
                        <input
                          type="text"
                          value={currentCabin.name}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, name: e.target.value });
                            } else {
                              setNewCabin({ ...newCabin, name: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Название домика"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Цена за ночь *
                        </label>
                        <input
                          type="number"
                          value={currentCabin.pricePerNight}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, pricePerNight: parseInt(e.target.value) || 0 });
                            } else {
                              setNewCabin({ ...newCabin, pricePerNight: parseInt(e.target.value) || 0 });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Локация
                        </label>
                        <input
                          type="text"
                          value={currentCabin.location}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, location: e.target.value });
                            } else {
                              setNewCabin({ ...newCabin, location: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Побережье Каспийского моря"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Расстояние до моря
                        </label>
                        <input
                          type="text"
                          value={cabinExtras.distanceToSea}
                          onChange={(e) => setCabinExtras({ ...cabinExtras, distanceToSea: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5 мин"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ссылка на карту
                        </label>
                        <div className="flex">
                          <div className="flex-shrink-0 flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="url"
                            value={cabinExtras.mapUrl}
                            onChange={(e) => setCabinExtras({ ...cabinExtras, mapUrl: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://maps.google.com/embed?..."
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Вставьте ссылку для встраивания карты (iframe src)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Спальни
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={currentCabin.bedrooms}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, bedrooms: parseInt(e.target.value) || 1 });
                            } else {
                              setNewCabin({ ...newCabin, bedrooms: parseInt(e.target.value) || 1 });
                            }
                          }}
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
                          value={currentCabin.bathrooms}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, bathrooms: parseInt(e.target.value) || 1 });
                            } else {
                              setNewCabin({ ...newCabin, bathrooms: parseInt(e.target.value) || 1 });
                            }
                          }}
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
                          value={currentCabin.maxGuests}
                          onChange={(e) => {
                            if (editingCabin) {
                              setEditingCabin({ ...editingCabin, maxGuests: parseInt(e.target.value) || 1 });
                            } else {
                              setNewCabin({ ...newCabin, maxGuests: parseInt(e.target.value) || 1 });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentCabin.featured}
                            onChange={(e) => {
                              if (editingCabin) {
                                setEditingCabin({ ...editingCabin, featured: e.target.checked });
                              } else {
                                setNewCabin({ ...newCabin, featured: e.target.checked });
                              }
                            }}
                            className="mr-2"
                          />
                          Популярный
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentCabin.active !== false}
                            onChange={(e) => {
                              if (editingCabin) {
                                setEditingCabin({ ...editingCabin, active: e.target.checked });
                              } else {
                                setNewCabin({ ...newCabin, active: e.target.checked });
                              }
                            }}
                            className="mr-2"
                          />
                          Активен
                        </label>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание *
                      </label>
                      <textarea
                        value={currentCabin.description}
                        onChange={(e) => {
                          if (editingCabin) {
                            setEditingCabin({ ...editingCabin, description: e.target.value });
                          } else {
                            setNewCabin({ ...newCabin, description: e.target.value });
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Описание домика..."
                      />
                    </div>

                    {/* Удобства */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Удобства
                      </label>
                      <div className="space-y-2">
                        {currentCabin.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={amenity}
                              onChange={(e) => {
                                const newAmenities = [...currentCabin.amenities];
                                newAmenities[index] = e.target.value;
                                if (editingCabin) {
                                  setEditingCabin({ ...editingCabin, amenities: newAmenities });
                                } else {
                                  setNewCabin({ ...newCabin, amenities: newAmenities });
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removeAmenity(currentCabin, index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addAmenity(currentCabin, '')}
                          className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить удобство
                        </button>
                      </div>
                    </div>

                    {/* Изображения */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Изображения
                      </label>
                      
                      {currentCabin.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {currentCabin.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Изображение ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <FileUpload
                        onFileSelect={handleImageUpload}
                        multiple={true}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        onClick={() => {
                          setEditingCabin(null);
                          setShowAddForm(false);
                          setCabinExtras({ distanceToSea: '', mapUrl: '' });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveCabin}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Сохранение...' : 'Сохранить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Отзывы */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Управление отзывами</h2>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{review.name}</h3>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.approved ? 'Одобрен' : 'На модерации'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {truncateText(review.comment, 200)}
                        {review.comment.length > 200 && (
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="text-blue-600 hover:text-blue-700 ml-2"
                          >
                            Читать полностью
                          </button>
                        )}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        {review.email} • {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {!review.approved ? (
                        <button
                          onClick={() => handleReviewAction(review.id, true)}
                          className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Одобрить
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReviewAction(review.id, false)}
                          className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Снять с публикации
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
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

        {/* Настройки */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Настройки сайта</h2>
            
            {/* Основные настройки */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
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
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 965 411-15-55"
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
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={settings.whyChooseUsTitle || ''}
                    onChange={(e) => setSettings({ ...settings, whyChooseUsTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Почему выбирают нас"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подзаголовок
                  </label>
                  <textarea
                    value={settings.whyChooseUsSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, whyChooseUsSubtitle: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали."
                  />
                </div>
              </div>
            </div>

            {/* Данные для входа */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Данные для входа в админку</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый логин
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateCredentials}
                disabled={loading || !credentials.username || !credentials.password}
                className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Сохранение...' : 'Обновить данные для входа'}
              </button>
            </div>

            {/* Ссылка на админку */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ссылка на админку</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Путь к админке
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {window.location.origin}/
                    </span>
                    <input
                      type="text"
                      value={adminPath}
                      onChange={(e) => setAdminPath(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateAdminPath}
                  disabled={loading || !adminPath}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Сохранение...' : 'Обновить'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить все настройки'}
              </button>
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