import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Eye, 
  EyeOff, 
  Settings, 
  Users, 
  MessageSquare,
  Check,
  Star,
  Image as ImageIcon,
  MapPin,
  Clock
} from 'lucide-react';
import LoginForm from '../components/LoginForm';
import FileUpload from '../components/FileUpload';
import { useAdminCabins } from '../hooks/useCabins';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
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

interface SiteSettings {
  siteName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  phone?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerAddress?: string;
  footerDescription?: string;
  galleryImages?: string[];
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
  whyChooseUsFeatures?: Array<{
    title: string;
    description: string;
  }>;
  defaultDistanceToSea?: string;
  defaultMapUrl?: string;
}

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
  'Прямой выход к морю',
  'Детская площадка',
  'Сауна',
  'Джакузи',
  'Бассейн'
];

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('cabins');
  const [editingCabin, setEditingCabin] = useState<any>(null);
  const [isAddingCabin, setIsAddingCabin] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { cabins, loading, fetchCabins, addCabin, updateCabin, deleteCabin } = useAdminCabins();

  const [newCabin, setNewCabin] = useState({
    name: '',
    description: '',
    pricePerNight: 0,
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [] as string[],
    images: [] as string[],
    featured: false,
    active: true,
    distanceToSea: '',
    mapUrl: ''
  });

  useEffect(() => {
    loadSettings();
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
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

  const handleImageUpload = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      if (isAddingCabin) {
        setNewCabin(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }));
      } else if (editingCabin) {
        setEditingCabin(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleGalleryImageUpload = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.imageUrl);
      
      setSettings(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Ошибка при загрузке изображений галереи');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number, isGallery = false) => {
    if (isGallery) {
      setSettings(prev => ({
        ...prev,
        galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || []
      }));
    } else if (isAddingCabin) {
      setNewCabin(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else if (editingCabin) {
      setEditingCabin(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveCabin = async () => {
    try {
      const cabinData = isAddingCabin ? newCabin : editingCabin;
      
      if (isAddingCabin) {
        await addCabin(cabinData);
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
          active: true,
          distanceToSea: '',
          mapUrl: ''
        });
        setIsAddingCabin(false);
      } else {
        await updateCabin(editingCabin.id, cabinData);
        setEditingCabin(null);
      }
      
      await fetchCabins();
      alert('Домик сохранен!');
    } catch (error) {
      console.error('Error saving cabin:', error);
      alert('Ошибка при сохранении домика');
    }
  };

  const handleDeleteCabin = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот домик?')) {
      try {
        await deleteCabin(id);
        alert('Домик удален!');
      } catch (error) {
        console.error('Error deleting cabin:', error);
        alert('Ошибка при удалении домика');
      }
    }
  };

  const toggleCabinActive = async (cabin: any) => {
    try {
      await updateCabin(cabin.id, { ...cabin, active: !cabin.active });
      await fetchCabins();
    } catch (error) {
      console.error('Error toggling cabin active status:', error);
      alert('Ошибка при изменении статуса домика');
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

  const toggleAmenity = (amenity: string, isEditing = false) => {
    if (isEditing && editingCabin) {
      const amenities = editingCabin.amenities.includes(amenity)
        ? editingCabin.amenities.filter((a: string) => a !== amenity)
        : [...editingCabin.amenities, amenity];
      setEditingCabin({ ...editingCabin, amenities });
    } else if (isAddingCabin) {
      const amenities = newCabin.amenities.includes(amenity)
        ? newCabin.amenities.filter(a => a !== amenity)
        : [...newCabin.amenities, amenity];
      setNewCabin({ ...newCabin, amenities });
    }
  };

  const addCustomAmenity = (customAmenity: string, isEditing = false) => {
    if (customAmenity.trim()) {
      if (isEditing && editingCabin) {
        setEditingCabin({
          ...editingCabin,
          amenities: [...editingCabin.amenities, customAmenity.trim()]
        });
      } else if (isAddingCabin) {
        setNewCabin({
          ...newCabin,
          amenities: [...newCabin.amenities, customAmenity.trim()]
        });
      }
    }
  };

  const removeCustomAmenity = (amenity: string, isEditing = false) => {
    if (isEditing && editingCabin) {
      setEditingCabin({
        ...editingCabin,
        amenities: editingCabin.amenities.filter((a: string) => a !== amenity)
      });
    } else if (isAddingCabin) {
      setNewCabin({
        ...newCabin,
        amenities: newCabin.amenities.filter(a => a !== amenity)
      });
    }
  };

  const addFeature = () => {
    const features = settings.whyChooseUsFeatures || [];
    setSettings({
      ...settings,
      whyChooseUsFeatures: [...features, { title: '', description: '' }]
    });
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const features = [...(settings.whyChooseUsFeatures || [])];
    features[index] = { ...features[index], [field]: value };
    setSettings({ ...settings, whyChooseUsFeatures: features });
  };

  const removeFeature = (index: number) => {
    const features = settings.whyChooseUsFeatures || [];
    setSettings({
      ...settings,
      whyChooseUsFeatures: features.filter((_, i) => i !== index)
    });
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
          await apiService.deleteReview(reviewId);
          setReviews(reviews.filter(r => r.id !== reviewId));
        }
      } else {
        const approved = action === 'approve';
        await apiService.updateReview(reviewId, { approved });
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, approved } : r
        ));
      }
    } catch (error) {
      console.error('Error handling review action:', error);
      alert('Ошибка при обработке отзыва');
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
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
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Выйти
            </button>
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
                { id: 'settings', name: 'Настройки сайта', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Cabins Tab */}
        {activeTab === 'cabins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Управление домиками</h2>
              <button
                onClick={() => setIsAddingCabin(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить домик
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cabins.map((cabin) => (
                  <div 
                    key={cabin.id} 
                    className={`bg-white rounded-lg shadow-sm border p-6 ${
                      !cabin.active ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{cabin.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleCabinActive(cabin)}
                          className={`p-2 rounded-lg transition-colors ${
                            cabin.active 
                              ? 'text-green-600 hover:bg-green-100' 
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                          title={cabin.active ? 'Скрыть домик' : 'Показать домик'}
                        >
                          {cabin.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setEditingCabin(cabin)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCabin(cabin.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {!cabin.active && (
                      <div className="mb-3 px-3 py-1 bg-red-100 border border-red-300 rounded-lg">
                        <span className="text-red-700 text-sm font-medium">Скрыт с сайта</span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{cabin.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p><strong>Цена:</strong> {formatPrice(cabin.pricePerNight)} / ночь</p>
                      <p><strong>Гости:</strong> до {cabin.maxGuests}</p>
                      <p><strong>Спальни:</strong> {cabin.bedrooms}</p>
                      <p><strong>Изображений:</strong> {cabin.images.length}</p>
                      {cabin.featured && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Рекомендуемый
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Cabin Modal */}
            {(isAddingCabin || editingCabin) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">
                        {isAddingCabin ? 'Добавить домик' : 'Редактировать домик'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingCabin(false);
                          setEditingCabin(null);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название *
                          </label>
                          <input
                            type="text"
                            value={isAddingCabin ? newCabin.name : editingCabin?.name || ''}
                            onChange={(e) => {
                              if (isAddingCabin) {
                                setNewCabin({ ...newCabin, name: e.target.value });
                              } else {
                                setEditingCabin({ ...editingCabin, name: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание *
                          </label>
                          <textarea
                            rows={4}
                            value={isAddingCabin ? newCabin.description : editingCabin?.description || ''}
                            onChange={(e) => {
                              if (isAddingCabin) {
                                setNewCabin({ ...newCabin, description: e.target.value });
                              } else {
                                setEditingCabin({ ...editingCabin, description: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Цена за ночь (₽) *
                          </label>
                          <input
                            type="number"
                            value={isAddingCabin ? newCabin.pricePerNight : editingCabin?.pricePerNight || 0}
                            onChange={(e) => {
                              if (isAddingCabin) {
                                setNewCabin({ ...newCabin, pricePerNight: parseInt(e.target.value) });
                              } else {
                                setEditingCabin({ ...editingCabin, pricePerNight: parseInt(e.target.value) });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Локация
                          </label>
                          <input
                            type="text"
                            value={isAddingCabin ? newCabin.location : editingCabin?.location || ''}
                            onChange={(e) => {
                              if (isAddingCabin) {
                                setNewCabin({ ...newCabin, location: e.target.value });
                              } else {
                                setEditingCabin({ ...editingCabin, location: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Например: Побережье Каспийского моря"
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
                              value={isAddingCabin ? newCabin.bedrooms : editingCabin?.bedrooms || 1}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, bedrooms: parseInt(e.target.value) });
                                } else {
                                  setEditingCabin({ ...editingCabin, bedrooms: parseInt(e.target.value) });
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
                              value={isAddingCabin ? newCabin.bathrooms : editingCabin?.bathrooms || 1}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, bathrooms: parseInt(e.target.value) });
                                } else {
                                  setEditingCabin({ ...editingCabin, bathrooms: parseInt(e.target.value) });
                                }
                              }}
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
                              value={isAddingCabin ? newCabin.maxGuests : editingCabin?.maxGuests || 2}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, maxGuests: parseInt(e.target.value) });
                                } else {
                                  setEditingCabin({ ...editingCabin, maxGuests: parseInt(e.target.value) });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              До моря
                            </label>
                            <input
                              type="text"
                              value={isAddingCabin ? newCabin.distanceToSea : editingCabin?.distanceToSea || ''}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, distanceToSea: e.target.value });
                                } else {
                                  setEditingCabin({ ...editingCabin, distanceToSea: e.target.value });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={settings.defaultDistanceToSea || "5 мин"}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              По умолчанию: {settings.defaultDistanceToSea || "5 мин"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Карта (URL)
                            </label>
                            <input
                              type="url"
                              value={isAddingCabin ? newCabin.mapUrl : editingCabin?.mapUrl || ''}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, mapUrl: e.target.value });
                                } else {
                                  setEditingCabin({ ...editingCabin, mapUrl: e.target.value });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="https://maps.google.com/..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Если не указано, используется общая карта
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isAddingCabin ? newCabin.featured : editingCabin?.featured || false}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, featured: e.target.checked });
                                } else {
                                  setEditingCabin({ ...editingCabin, featured: e.target.checked });
                                }
                              }}
                              className="mr-2"
                            />
                            Рекомендуемый
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isAddingCabin ? newCabin.active : editingCabin?.active !== false}
                              onChange={(e) => {
                                if (isAddingCabin) {
                                  setNewCabin({ ...newCabin, active: e.target.checked });
                                } else {
                                  setEditingCabin({ ...editingCabin, active: e.target.checked });
                                }
                              }}
                              className="mr-2"
                            />
                            Активный (показывать на сайте)
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Amenities */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Удобства
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {STANDARD_AMENITIES.map((amenity) => (
                              <label key={amenity} className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={(isAddingCabin ? newCabin.amenities : editingCabin?.amenities || []).includes(amenity)}
                                  onChange={() => toggleAmenity(amenity, !isAddingCabin)}
                                  className="mr-2"
                                />
                                {amenity}
                              </label>
                            ))}
                          </div>

                          {/* Custom amenities */}
                          <div className="space-y-2">
                            {(isAddingCabin ? newCabin.amenities : editingCabin?.amenities || [])
                              .filter(amenity => !STANDARD_AMENITIES.includes(amenity))
                              .map((amenity, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                  <span className="text-sm">{amenity}</span>
                                  <button
                                    onClick={() => removeCustomAmenity(amenity, !isAddingCabin)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                          </div>

                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Добавить свое удобство"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addCustomAmenity(e.currentTarget.value, !isAddingCabin);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addCustomAmenity(input.value, !isAddingCabin);
                                input.value = '';
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Images */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Изображения
                          </label>
                          
                          <FileUpload 
                            onFileSelect={handleImageUpload}
                            className="mb-4"
                          />
                          
                          {uploadingImages && (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-blue-600">Загрузка изображений...</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            {(isAddingCabin ? newCabin.images : editingCabin?.images || []).map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Изображение ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                      <button
                        onClick={() => {
                          setIsAddingCabin(false);
                          setEditingCabin(null);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveCabin}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Управление отзывами</h2>
              <button
                onClick={loadReviews}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Обновить
              </button>
            </div>

            {loadingReviews ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Отзывов пока нет</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className={`bg-white rounded-lg shadow-sm border p-6 ${
                        !review.approved ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 text-white font-bold text-lg">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{review.name}</h3>
                            <p className="text-sm text-gray-500">{review.email}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            {!review.approved ? (
                              <button
                                onClick={() => handleReviewAction(review.id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Одобрить"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReviewAction(review.id, 'reject')}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                title="Скрыть"
                              >
                                <EyeOff className="w-5 h-5" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleReviewAction(review.id, 'delete')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(review.comment)}
                        </p>
                        
                        {review.comment.length > 150 && (
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Читать полностью
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          review.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.approved ? 'Опубликован' : 'На модерации'}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {review.comment.length} символов
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Review Modal */}
            {selectedReview && (
              <ReviewModal
                review={selectedReview}
                isOpen={!!selectedReview}
                onClose={() => setSelectedReview(null)}
              />
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">Настройки сайта</h2>

            {/* Basic Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Основные настройки</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Главная секция</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок
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
                    Подзаголовок
                  </label>
                  <textarea
                    rows={3}
                    value={settings.heroSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Отдохните от городской суеты в наших комфортабельных объектах с живописным видом на Каспийское море"
                  />
                </div>
              </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Секция "Почему выбирают нас"</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок секции
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
                    Описание секции
                  </label>
                  <textarea
                    rows={3}
                    value={settings.whyChooseUsSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, whyChooseUsSubtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Преимущества
                    </label>
                    <button
                      onClick={addFeature}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Добавить
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(settings.whyChooseUsFeatures || []).map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Преимущество {index + 1}</h4>
                          <button
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Заголовок преимущества"
                          />
                          <textarea
                            rows={2}
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Описание преимущества"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Default Values */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Значения по умолчанию</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Расстояние до моря по умолчанию
                  </label>
                  <input
                    type="text"
                    value={settings.defaultDistanceToSea || ''}
                    onChange={(e) => setSettings({ ...settings, defaultDistanceToSea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5 мин"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Используется, если не указано индивидуально для домика
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Карта по умолчанию (URL)
                  </label>
                  <input
                    type="url"
                    value={settings.defaultMapUrl || ''}
                    onChange={(e) => setSettings({ ...settings, defaultMapUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Используется, если не указана индивидуальная карта для домика
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Галерея на главной странице</h3>
              
              <FileUpload 
                onFileSelect={handleGalleryImageUpload}
                className="mb-4"
              />
              
              {uploadingImages && (
                <div className="flex items-center justify-center py-4 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-blue-600">Загрузка изображений...</span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(settings.galleryImages || []).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Галерея ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index, true)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки подвала</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон в подвале
                  </label>
                  <input
                    type="text"
                    value={settings.footerPhone || ''}
                    onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })}
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
                    onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })}
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
                    onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Приморский бульвар, 123, Морской город, Россия"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание в подвале
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription || ''}
                    onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Уютные домики и современные квартиры на берегу моря для незабываемого отдыха..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                Сохранить настройки
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;