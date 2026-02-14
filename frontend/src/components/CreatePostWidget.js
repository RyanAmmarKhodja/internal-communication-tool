import React, { useState } from 'react';

const CreatePostWidget = () => {
  const [activeTab, setActiveTab] = useState('post');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Tab Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'post'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Publier
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'equipment'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Partager du matériel
        </button>
        <button
          onClick={() => setActiveTab('ride')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ride'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Proposer un trajet
        </button>
      </div>

      {/* Post Content */}
      {activeTab === 'post' && (
        <div>
          <textarea
            placeholder="Quoi de neuf ?"
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex justify-end mt-3">
            <button className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium">
              Publier
            </button>
          </div>
        </div>
      )}

      {/* Equipment Redirect */}
      {activeTab === 'equipment' && (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Partagez votre matériel avec la communauté</p>
          <a
            href="/share-equipment"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Créer une annonce
          </a>
        </div>
      )}

      {/* Ride Redirect */}
      {activeTab === 'ride' && (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Proposez un trajet à la communauté</p>
          <a
            href="/share-ride"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Créer un trajet
          </a>
        </div>
      )}
    </div>
  );
};

export default CreatePostWidget;
