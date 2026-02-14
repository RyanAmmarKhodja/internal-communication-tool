import React from 'react';
import PostCard from '../components/PostCard';
import EquipmentCard from '../components/EquipmentCard';
import CovoiturageCard from '../components/CovoiturageCard';
import CreatePostWidget from '../components/CreatePostWidget';

const Home = () => {
  // Mock data for demonstration
  const recentPosts = [
    {
      id: 1,
      author: 'Marie Dubois',
      time: 'Il y a 2 heures',
      content: 'Bonjour à tous ! Je cherche des conseils pour mon premier marathon. Des recommandations ?',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      author: 'Thomas Martin',
      time: 'Il y a 5 heures',
      content: 'Super session d\'entraînement ce matin au parc ! Qui était là ?',
      likes: 8,
      comments: 3
    }
  ];

  const equipment = [
    {
      id: 1,
      title: 'Vélo de route Specialized',
      price: '15€/jour',
      location: 'Paris 15ème',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Tente 4 places Quechua',
      price: '10€/jour',
      location: 'Lyon 3ème',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop'
    }
  ];

  const covoiturages = [
    {
      id: 1,
      from: 'Paris',
      to: 'Lyon',
      date: '15 Fév',
      price: '25€',
      seats: 3
    },
    {
      id: 2,
      from: 'Marseille',
      to: 'Nice',
      date: '16 Fév',
      price: '15€',
      seats: 2
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Create Post Widget */}
        <div className="mb-6">
          <CreatePostWidget />
        </div>

        {/* Main Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Publications récentes</h2>
            {recentPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Sidebar - Equipment & Covoiturage */}
          <div className="space-y-6">
            {/* Equipment Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Matériel disponible</h2>
                <a href="/equipment" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Voir tout →
                </a>
              </div>
              <div className="space-y-3">
                {equipment.map(item => (
                  <EquipmentCard key={item.id} equipment={item} compact />
                ))}
              </div>
            </div>

            {/* Covoiturage Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Covoiturages</h2>
                <a href="/covoiturage" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Voir tout →
                </a>
              </div>
              <div className="space-y-3">
                {covoiturages.map(ride => (
                  <CovoiturageCard key={ride.id} ride={ride} compact />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
