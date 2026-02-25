import React from 'react';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {post.author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900">{post.author}</p>
          <p className="text-xs text-gray-500">{post.time}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">{post.comments}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
