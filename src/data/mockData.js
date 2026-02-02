export const CATEGORIES = [
    { id: '1', name: 'Mountain', icon: 'bicycle' },
    { id: '2', name: 'Road', icon: 'bicycle-outline' }, // Example icons
    { id: '3', name: 'Hybrid', icon: 'bicycle' },
    { id: '4', name: 'Fixie', icon: 'bicycle' },
];

export const PRODUCTS = [
    {
        id: '1',
        name: 'Trek Marlin 7',
        category: 'Mountain',
        price: 15500000,
        oldPrice: 17000000,
        image: 'https://images.unsplash.com/photo-1576435728678-be95f39e8ab6?w=500&auto=format&fit=crop&q=60',
        condition: 'Used',
        location: 'Hà Nội',
        rating: 4.5,
        specs: {
            weight: '13.2 kg',
            frameMaterial: 'Alpha Gold Aluminum',
            groupset: 'Shimano Deore',
            wheelset: 'Bontrager Connection',
            braking: 'Hydraulic Disc',
            gears: '20 Speed',
        }
    },
    {
        id: '2',
        name: 'Giant Escape 3',
        category: 'Hybrid',
        price: 8500000,
        image: 'https://images.unsplash.com/photo-1485965120184-e224f723d62c?w=500&auto=format&fit=crop&q=60',
        condition: 'New',
        location: 'TP. HCM',
        rating: 5.0,
        specs: {
            weight: '11.5 kg',
            frameMaterial: 'ALUXX Aluminum',
            groupset: 'Shimano Altus',
            wheelset: 'Giant S-R2',
            braking: 'Mechanical Disc',
            gears: '21 Speed',
        }
    },
    {
        id: '3',
        name: 'Specialized Allez',
        category: 'Road',
        price: 22000000,
        image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop&q=60',
        condition: 'Used',
        location: 'Đà Nẵng',
        rating: 4.0,
        specs: {
            weight: '9.2 kg',
            frameMaterial: 'E5 Premium Aluminum',
            groupset: 'Shimano 105',
            wheelset: 'DT R470',
            braking: 'Rim Brake',
            gears: '22 Speed',
        }
    },
    {
        id: '4',
        name: 'Aventon Mataro',
        category: 'Fixie',
        price: 9000000,
        image: 'https://images.unsplash.com/photo-1507035895480-2b3156c311a6?w=500&auto=format&fit=crop&q=60',
        condition: 'Like New',
        location: 'Hà Nội',
        rating: 4.8,
        specs: {
            weight: '8.6 kg',
            frameMaterial: '6061 Aluminum',
            groupset: 'Single Speed',
            wheelset: 'Aventon Push',
            braking: 'Front Caliper',
            gears: '1 Speed',
        }
    },
];
