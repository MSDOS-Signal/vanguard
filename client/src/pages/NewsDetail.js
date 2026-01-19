import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getNewsBySlug } from '../services/api';

const NewsDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNewsBySlug(slug);
        setArticle(data);
      } catch (e) {
        setError('无法加载新闻');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">{error || '未找到新闻'}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow p-8">
          <img src={article.featuredImage} alt={article.title} className="w-full h-64 object-cover rounded mb-6" />
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
          <div className="text-gray-500 mb-6">{new Date(article.publishDate).toLocaleDateString()} • {article.author} • {article.category}</div>
          {article.summary && (
            <p className="text-gray-700 mb-6 whitespace-pre-line">{article.summary}</p>
          )}
          <div className="prose max-w-none whitespace-pre-line">{article.content}</div>
        </motion.article>
      </div>
    </div>
  );
};

export default NewsDetail;
