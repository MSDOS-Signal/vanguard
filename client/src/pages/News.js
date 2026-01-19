import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/seo/SEO';
import api, { getNews } from '../services/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  MessageCircle,
  FileText,
  Clock,
  Tag
} from 'lucide-react';

const News = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // 从API获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNews();
        // 使用从API获取的数据
        const apiNews = response.news.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          category: item.category,
          content: item.summary, // 使用summary作为内容预览
          author: item.author,
          publishDate: new Date(item.publishDate).toLocaleDateString(),
          viewCount: item.viewCount,
          status: item.isPublished ? 'published' : 'draft',
          image: item.featuredImage
        }));
        setNews(apiNews);
        setFilteredNews(apiNews);
      } catch (error) {
        console.error('获取新闻数据失败:', error);
        // 如果API调用失败，使用默认示例数据
        const defaultNews = [
          {
            id: 1,
            title: 'Company Achieves ISO 9001 Quality Management Certification',
            category: 'Company News',
            content: 'We are pleased to announce that Vanguard Machinery Trading Company has successfully obtained ISO 9001:2015 Quality Management System certification...',
            author: 'Admin',
            publishDate: '2024-01-15',
            viewCount: 156,
            status: 'published',
            image: '/api/placeholder/400/250'
          }
        ];
        setNews(defaultNews);
        setFilteredNews(defaultNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let filtered = news.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 按发布日期排序（最新的在前）
    filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    setFilteredNews(filtered);
  }, [news, searchTerm, selectedCategory]);

  const [categories, setCategories] = useState(['all']);

  // 从后台获取分类（与 Admin 管理一致）
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/news/categories');
        const list = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
        setCategories(['all', ...list]);
      } catch (e) {
        // 回退：如果接口异常，保持默认 only 'all'
        setCategories(['all']);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO 
        title={t('latestNews')} 
        description={t('stayUpdatedIndustry') || "Stay updated with the latest news and trends in the roll forming industry."}
        url="/news"
      />
      {/* Hero Section */}
      <div className="relative py-32 bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-primary-900/90 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')` }}
          />
        </div>
        <div className="container relative z-20 mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-serif font-bold mb-6"
            >
              {t('latestNews')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light"
            >
              {t('stayUpdatedIndustry')}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchNews')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('allCategories') : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noNewsFound')}</h3>
            <p className="text-gray-500">{t('tryAdjustingSearch')}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col h-full"
              >
                {/* Article Image */}
                <div className="relative overflow-hidden aspect-[16/9] bg-gray-200">
                  <img
                    src={article.image || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-primary-700 backdrop-blur-sm shadow-sm">
                      <Tag className="w-3 h-3 mr-1" />
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-primary-500" />
                      {article.publishDate}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-primary-500" />
                      {article.author}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors font-serif">
                    <a href={`/news/${article.slug}`}>
                      {article.title}
                    </a>
                  </h2>

                  <p className="text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                    {article.content}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.viewCount}
                    </div>
                    <a 
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700 transition-colors group/link"
                    >
                      {t('readMore')}
                      <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;