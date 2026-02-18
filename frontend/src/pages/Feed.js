import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight,
  Wrench, Car, Search, Loader2, Film, Cpu, HelpCircle,
  Tag, Trash2, User as UserIcon
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthProvider';

const PAGE_SIZE = 12;

/* ── Category & Type configs ── */

const CATEGORY_FILTERS = [
  { key: null, label: 'Toutes', icon: null },
  { key: 'COVOITURAGE', label: 'Covoiturage', icon: Car },
  { key: 'MATERIAL', label: 'Matériel', icon: Wrench },
  { key: 'MEDIAS', label: 'Médias', icon: Film },
  { key: 'OUTILS', label: 'Outils', icon: Cpu },
  { key: 'AUTRE', label: 'Autre', icon: HelpCircle },
];

const TYPE_FILTERS = [
  { key: null, label: 'Tout', emoji: null },
  { key: 'OFFER', label: 'Propositions', emoji: '🤝' },
  { key: 'DEMAND', label: 'Recherches', emoji: '🔍' },
];

const CATEGORY_CONFIG = {
  COVOITURAGE: { label: 'Covoiturage', color: 'blue', icon: Car },
  MATERIAL: { label: 'Matériel', color: 'orange', icon: Wrench },
  MEDIAS: { label: 'Médias', color: 'purple', icon: Film },
  OUTILS: { label: 'Outils', color: 'emerald', icon: Cpu },
  AUTRE: { label: 'Autre', color: 'gray', icon: HelpCircle },
};

const TYPE_BADGE = {
  OFFER: { label: 'Proposition', bg: 'bg-green-100', text: 'text-green-700' },
  DEMAND: { label: 'Recherche', bg: 'bg-red-100', text: 'text-red-700' },
};

/* ── Helpers ── */

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD}j`;
  return date.toLocaleDateString('fr-FR');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Feed Card ── */

function FeedCard({ post, currentUserId, onDeactivate }) {
  const navigate = useNavigate();
  const catKey = (post.category || 'AUTRE').toUpperCase();
  const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.AUTRE;
  const typeKey = (post.postType || 'OFFER').toUpperCase();
  const typeBadge = TYPE_BADGE[typeKey] || TYPE_BADGE.OFFER;
  const isCovoiturage = catKey === 'COVOITURAGE';
  const isAuthor = currentUserId && (currentUserId === post.authorId || currentUserId === post.author?.id);

  const gradientClass =
    catConfig.color === 'blue' ? 'from-blue-500 to-blue-600' :
      catConfig.color === 'orange' ? 'from-orange-500 to-orange-600' :
        catConfig.color === 'purple' ? 'from-purple-500 to-purple-600' :
          catConfig.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
            'from-gray-500 to-gray-600';

  const CatIcon = catConfig.icon;

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col"
    >
      {/* Header bar */}
      <div className={`bg-gradient-to-r ${gradientClass} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-white text-xs font-semibold flex items-center gap-1.5">
          <CatIcon className="w-3.5 h-3.5" /> {catConfig.label}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.bg} ${typeBadge.text}`}>
          {typeBadge.label}
        </span>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {post.title}
        </h3>

        {/* Covoiturage route */}
        {isCovoiturage && post.departureLocation && post.destinationLocation && (
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="font-semibold text-gray-700 truncate">{post.departureLocation}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="font-semibold text-gray-700 truncate">{post.destinationLocation}</span>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{post.content}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
          {isCovoiturage && post.departureTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.departureTime)}
            </span>
          )}
          {isCovoiturage && post.availableSeats != null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {post.availableSeats} place{post.availableSeats > 1 ? 's' : ''}
            </span>
          )}
          {!isCovoiturage && post.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {post.location}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            {post.author && (
              <span className="text-[11px] text-gray-500 truncate">
                {post.author.firstName} {post.author.lastName?.[0]}.
              </span>
            )}
            <span className="text-[11px] text-gray-400">· {timeAgo(post.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate(post.id);
                }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Désactiver"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
              Voir →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feed Page ── */

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/feed', { params });
      const data = res.data.data ?? res.data.items ?? [];
      setPosts(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Impossible de charger le fil. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, categoryFilter]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleTypeChange = (key) => {
    if (key !== typeFilter) {
      setTypeFilter(key);
      setPage(1);
    }
  };

  const handleCategoryChange = (key) => {
    if (key !== categoryFilter) {
      setCategoryFilter(key);
      setPage(1);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchFeed();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { q: searchTerm.trim() };
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/feed/search', { params });
      const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setPosts(data);
      setHasMore(false);
    } catch (err) {
      console.error('Search failed:', err);
      setError('La recherche a échoué.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (postId) => {
    if (!window.confirm('Voulez-vous vraiment désactiver cette annonce ?')) return;
    try {
      await api.patch(`/post/${postId}/deactivate`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to deactivate:', err);
      alert("Échec de la désactivation.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Annonces</h1>
          <p className="text-sm text-gray-500">Parcourez les offres et demandes de la communauté</p>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une annonce…"
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white"
            />
          </div>
        </form>

        {/* ── Type Filter (Offer / Demand) ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TYPE_FILTERS.map(({ key, label, emoji }) => {
            const active = typeFilter === key;
            return (
              <button
                key={label}
                onClick={() => handleTypeChange(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150
                  ${active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {emoji && <span>{emoji}</span>}
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Category Filter ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map(({ key, label, icon: Icon }) => {
            const active = categoryFilter === key;
            return (
              <button
                key={label}
                onClick={() => handleCategoryChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150
                  ${active
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchFeed}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Aucune annonce trouvée</h3>
            <p className="text-sm text-gray-500">
              Essayez une autre catégorie ou revenez plus tard.
            </p>
          </div>
        )}

        {/* ── Card Grid ── */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-center gap-4 mt-8 mb-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              <span className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-800">{page}</span>
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
