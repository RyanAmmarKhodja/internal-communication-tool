import React, { useState } from 'react';
import api from '../api';
import Loading from "../components/Loading"
import { NavLink } from 'react-router-dom';

const ShareEquipment = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    pricePerDay: '',
    location: '',
    condition: '',
    availability: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic will be handled later

    console.log('Form submitted:', formData);

    try{
      api.post("")
    }catch{

    }finally{

    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Partager mon matériel</h1>
          <p className="text-gray-600">Remplissez le formulaire pour mettre votre matériel en location</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Vélo de route Specialized Allez"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="velo">Vélo</option>
              <option value="camping">Camping</option>
              <option value="randonnee">Randonnée</option>
              <option value="nautique">Sports nautiques</option>
              <option value="ski">Ski & Snowboard</option>
              <option value="escalade">Escalade</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre matériel, ses caractéristiques..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 50 caractères</p>
          </div>

          {/* Photos Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 mb-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Cliquez pour ajouter des photos</p>
              <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <NavLink
              to="/"
              className="text-center flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </NavLink>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors"
            >
              Publier l'annonce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareEquipment;
