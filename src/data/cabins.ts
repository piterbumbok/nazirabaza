import { Cabin } from '../types';

export const cabins: Cabin[] = [
  {
    id: '1',
    name: 'Морской бриз',
    description: 'Уютный домик с видом на Каспийское море, идеальный для романтического отдыха. Просторная терраса, собственный выход к пляжу, полностью оборудованная кухня и барбекю-зона.',
    pricePerNight: 5000,
    location: 'Побережье Каспийского моря',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Кондиционер', 'Терраса', 'Барбекю', 'Прямой выход к морю'],
    images: [
      'https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg',
      'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg',
      'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg'
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Семейный причал',
    description: 'Просторный двухэтажный домик для всей семьи. Три спальни, большая гостиная с панорамными окнами и потрясающим видом на Каспийское море.',
    pricePerNight: 8500,
    location: 'Побережье Каспийского моря',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['Wi-Fi', 'Кондиционер', 'Стиральная машина', 'Парковка', 'Детская площадка'],
    images: [
      'https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg',
      'https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg',
      'https://images.pexels.com/photos/4450337/pexels-photo-4450337.jpeg'
    ],
    featured: true
  },
  {
    id: '3',
    name: 'Лазурная лагуна',
    description: 'Современный дом в средиземноморском стиле с собственным бассейном. Расположен в тихой бухте с кристально чистой водой.',
    pricePerNight: 12000,
    location: 'Побережье Каспийского моря',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    amenities: ['Бассейн', 'Сауна', 'Джакузи', 'Зона для барбекю', 'Умный дом'],
    images: [
      'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg'
    ],
    featured: false
  },
  {
    id: '4',
    name: 'Песчаный берег',
    description: 'Аутентичный деревянный домик в рыбацком стиле. Идеальное место для тех, кто ценит единение с природой и морской пейзаж.',
    pricePerNight: 4500,
    location: 'Побережье Каспийского моря',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ['Терраса', 'Гамаки', 'Барбекю', 'Каяки', 'Рыболовные снасти'],
    images: [
      'https://images.pexels.com/photos/2249958/pexels-photo-2249958.jpeg',
      'https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg',
      'https://images.pexels.com/photos/2507016/pexels-photo-2507016.jpeg'
    ],
    featured: true
  }
];