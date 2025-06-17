import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginForm from '../components/LoginForm';
import FileUpload from '../components/FileUpload';
import { cabins } from '../data/cabins';
import { Cabin } from '../types';
import { X, Plus, Edit, Trash, Settings, Phone, Mail, MapPin, Image, Key, Save, Globe, FileText } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  galleryImages: string[];
  footerDescription: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  accommodationRules: string[];
}

interface WhyChooseUsFeature {
  title: string;
  description: string;
}

interface AdminCredentials {
  username: string;
  password: string;
}

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'cabins' | 'settings' | 'gallery' | 'credentials' | 'content'>('cabins');
  const [cabinsList, setCabinsList] = useState<Cabin[]>(cabins);
  const [isAddingCabin, setIsAddingCabin] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    username: 'admin',
    password: 'admin123'
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'В гости',
    phone: '+7 965 411-15-55',
    email: 'info@vgosti.ru',
    address: 'Приморский бульвар, 123, Морской город, Россия',
    heroTitle: 'Уютные домики и квартиры на берегу каспия',
    heroSubtitle: 'Отдохните от городской суеты в наших комфортабельных объектах с живописным видом на Каспийское море',
    galleryImages: [
      'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg',
      'https://images.pexels.com/photos/4846293/pexels-photo-4846293.jpeg',
      'https://images.pexels.com/photos/4846265/pexels-photo-4846265.jpeg',
      'https://images.pexels.com/photos/4846437/pexels-photo-4846437.jpeg',
      'https://images.pexels.com/photos/4846436/pexels-photo-4846436.jpeg'
    ],
    footerDescription: 'Уютные домики и современные квартиры на берегу моря для незабываемого отдыха. Идеальное место для спокойного отдыха и наслаждения морским пейзажем.',
    footerPhone: '+7 (999) 123-45-67',
    footerEmail: 'info@vgosti.ru',
    footerAddress: 'Приморский бульвар, 123, Морской город, Россия',
    accommodationRules: [
      'Заезд после 14:00, выезд до 12:00',
      'Курение запрещено',
      'Без вечеринок и мероприятий',
      'Разрешено проживание с домашними животными'
    ]
  });

  const [whyChooseUsFeatures, setWhyChooseUsFeatures] = useState<WhyChooseUsFeature[]>([
    {
      title: 'Лучшая локация',
      description: 'Все наши объекты расположены в живописных местах с прямым доступом к Каспийскому морю и потрясающими видами.'
    },
    {
      title: 'Близость к морю',
      description: 'Дорога до пляжа занимает не более 5 минут пешком от любого нашего объекта недвижимости.'
    },
    {
      title: 'Комфорт и уют',
      description: 'Каждый домик и квартира полностью оборудованы всем необходимым для комфортного отдыха.'
    },
    {
      title: 'Безопасное бронирование',
      description: 'Гарантированное бронирование без скрытых платежей и дополнительных комиссий.'
    }
  ]);
  
  const [newCabin, setNewCabin] = useState<Partial<Cabin>>({
    name: '',
    description: '',
    pricePerNight: 0,
    location: 'Побережье Каспийского моря',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    images: [],
    featured: false
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  const [newRule, setNewRule] = useState('');

  const handleLogin = (username: string, password: string): boolean => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleFileUpload = (file: File, type: 'cabin' | 'gallery') => {
    // Simulate file upload - in real app, this would upload to server
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      if (type === 'cabin') {
        setNewCabin({
          ...newCabin,
          images: [...(newCabin.images || []), imageUrl]
        });
      } else {
        setSiteSettings({
          ...siteSettings,
          galleryImages: [...siteSettings.galleryImages, imageUrl]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCabin = () => {
    if (editingCabin) {
      setCabinsList(cabinsList.map(cabin => 
        cabin.id === editingCabin.id 
          ? { ...cabin, ...newCabin } as Cabin 
          : cabin
      ));
      setEditingCabin(null);
    } else {
      const cabin: Cabin = {
        id: Date.now().toString(),
        ...newCabin as Omit<Cabin, 'id'>
      };
      setCabinsList([...cabinsList, cabin]);
    }
    
    setNewCabin({
      name: '',
      description: '',
      pricePerNight: 0,
      location: 'Побережье Каспийского моря',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: [],
      images: [],
      featured: false
    });
    
    setIsAddingCabin(false);
  };

  const handleEditCabin = (cabin: Cabin) => {
    setEditingCabin(cabin);
    setNewCabin({ ...cabin });
    setIsAddingCabin(true);
  };

  const handleDeleteCabin = (id: string) => {
    setCabinsList(cabinsList.filter(cabin => cabin.id !== id));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !newCabin.amenities?.includes(newAmenity)) {
      setNewCabin({
        ...newCabin,
        amenities: [...(newCabin.amenities || []), newAmenity]
      });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setNewCabin({
      ...newCabin,
      amenities: newCabin.amenities?.filter(a => a !== amenity)
    });
  };

  const handleRemoveImage = (image: string, type: 'cabin' | 'gallery') => {
    if (type === 'cabin') {
      setNewCabin({
        ...newCabin,
        images: newCabin.images?.filter(img => img !== image)
      });
    } else {
      setSiteSettings({
        ...siteSettings,
        galleryImages: siteSettings.galleryImages.filter(img => img !== image)
      });
    }
  };

  const handleSaveCredentials = () => {
    // In a real app, this would save to a secure backend
    alert('Учетные данные сохранены!');
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    alert('Настройки сохранены!');
  };

  const handleUpdateWhyChooseUsFeature = (index: number, field: 'title' | 'description', value: string) => {
    const updatedFeatures = [...whyChooseUsFeatures];
    updatedFeatures[index][field] = value;
    setWhyChooseUsFeatures(updatedFeatures);
  };

  const handleAddRule = () => {
    if (newRule.trim() && !siteSettings.accommodationRules.includes(newRule)) {
      setSiteSettings({
        ...siteSettings,
        accommodationRules: [...siteSettings.accommodationRules, newRule]
      });
      setNewRule('');
    }
  };

  const handleRemoveRule = (rule: string) => {
    setSiteSettings({
      ...siteSettings,
      accommodationRules: siteSettings.accommodationRules.filter(r => r !== rule)
    });
  };

  const handleUpdateRule = (index: number, value: string) => {
    const updatedRules = [...siteSettings.accommodationRules];
    updatedRules[index] = value;
    setSiteSettings({
      ...siteSettings,
      accommodationRules: updatedRules
    });
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header phone={siteSettings.phone} />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Панель администратора</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'cabins', label: 'Домики', icon: <Settings className="w-5 h-5" /> },
                  { id: 'content', label: 'Контент сайта', icon: <Globe className="w-5 h-5" /> },
                  { id: 'settings', label: 'Настройки', icon: <Phone className="w-5 h-5" /> },
                  { id: 'gallery', label: 'Галерея', icon: <Image className="w-5 h-5" /> },
                  { id: 'credentials', label: 'Безопасность', icon: <Key className="w-5 h-5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
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
                  onClick={() => setIsAddingCabin(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить домик
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цена/ночь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Спальни
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Популярный
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cabinsList.map((cabin) => (
                      <tr key={cabin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg overflow-hidden mr-4">
                              <img
                                src={cabin.images[0]}
                                alt={cabin.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{cabin.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cabin.pricePerNight} ₽
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cabin.bedrooms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              cabin.featured
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cabin.featured ? 'Да' : 'Нет'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCabin(cabin)}
                            className="text-blue-600 hover:text-blue-900 mr-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCabin(cabin.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Главная страница</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Заголовок героя
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroTitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Подзаголовок героя
                  </label>
                  <textarea
                    value={siteSettings.heroSubtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Почему выбирают нас</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {whyChooseUsFeatures.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Заголовок блока {index + 1}
                        </label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleUpdateWhyChooseUsFeature(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Описание блока {index + 1}
                        </label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => handleUpdateWhyChooseUsFeature(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation Rules Section */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center mb-6">
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Правила проживания</h2>
                </div>
                
                <div className="mb-6">
                  <div className="flex mb-3">
                    <input
                      type="text"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Добавить новое правило..."
                      className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddRule}
                      className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {siteSettings.accommodationRules.map((rule, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => handleUpdateRule(index, e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
                        />
                        <button
                          onClick={() => handleRemoveRule(rule)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Content */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Контакты в футере</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Описание компании
                      </label>
                      <textarea
                        value={siteSettings.footerDescription}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footerDescription: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Телефон в футере
                      </label>
                      <input
                        type="text"
                        value={siteSettings.footerPhone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footerPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email в футере
                      </label>
                      <input
                        type="email"
                        value={siteSettings.footerEmail}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footerEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Адрес в футере
                      </label>
                      <textarea
                        value={siteSettings.footerAddress}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footerAddress: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center mx-auto"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Сохранить все изменения
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Основные настройки</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Название сайта
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Основной телефон
                    </label>
                    <input
                      type="text"
                      value={siteSettings.phone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Основной Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Основной адрес
                    </label>
                    <textarea
                      value={siteSettings.address}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление галереей</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Загрузить новые изображения</h3>
                <FileUpload
                  onFileSelect={(file) => handleFileUpload(file, 'gallery')}
                  multiple={true}
                  className="mb-4"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {siteSettings.galleryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Галерея ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => handleRemoveImage(image, 'gallery')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки безопасности</h2>
              
              <div className="max-w-md">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Логин администратора
                  </label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Пароль администратора
                  </label>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSaveCredentials}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Сохранить учетные данные
                </button>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Важно:</strong> После изменения учетных данных вам потребуется войти заново с новыми данными.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Add/Edit Cabin Modal */}
      {isAddingCabin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingCabin ? 'Редактировать домик' : 'Добавить новый домик'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingCabin(false);
                    setEditingCabin(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Название домика
                    </label>
                    <input
                      type="text"
                      value={newCabin.name}
                      onChange={(e) => setNewCabin({ ...newCabin, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Описание
                    </label>
                    <textarea
                      value={newCabin.description}
                      onChange={(e) => setNewCabin({ ...newCabin, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Цена за ночь (₽)
                      </label>
                      <input
                        type="number"
                        value={newCabin.pricePerNight}
                        onChange={(e) => setNewCabin({ ...newCabin, pricePerNight: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Макс. количество гостей
                      </label>
                      <input
                        type="number"
                        value={newCabin.maxGuests}
                        onChange={(e) => setNewCabin({ ...newCabin, maxGuests: Number(e.target.value) })}
                        min={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Количество спален
                      </label>
                      <input
                        type="number"
                        value={newCabin.bedrooms}
                        onChange={(e) => setNewCabin({ ...newCabin, bedrooms: Number(e.target.value) })}
                        min={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Количество ванных
                      </label>
                      <input
                        type="number"
                        value={newCabin.bathrooms}
                        onChange={(e) => setNewCabin({ ...newCabin, bathrooms: Number(e.target.value) })}
                        min={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={newCabin.featured}
                        onChange={(e) => setNewCabin({ ...newCabin, featured: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-3 block text-gray-700 font-medium">
                        Отметить как популярный домик
                      </label>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Удобства
                    </label>
                    <div className="flex mb-3">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Например: Wi-Fi, Барбекю..."
                        className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddAmenity}
                        className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
                      >
                        Добавить
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newCabin.amenities?.map((amenity, index) => (
                        <div
                          key={index}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center"
                        >
                          <span>{amenity}</span>
                          <button
                            onClick={() => handleRemoveAmenity(amenity)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Изображения домика
                    </label>
                    <FileUpload
                      onFileSelect={(file) => handleFileUpload(file, 'cabin')}
                      multiple={true}
                      className="mb-4"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      {newCabin.images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Изображение ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg shadow-md"
                          />
                          <button
                            onClick={() => handleRemoveImage(image, 'cabin')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsAddingCabin(false);
                    setEditingCabin(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddCabin}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
                >
                  {editingCabin ? 'Сохранить изменения' : 'Добавить домик'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AdminPage;