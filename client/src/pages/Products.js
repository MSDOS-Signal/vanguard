import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/seo/SEO';
import { uploadFile, getAdminCategories, getProductCategories, createProduct, getProducts } from '../services/api';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  MessageCircle,
  Package,
  Clock,
  MapPin,
  Plus,
  ArrowRight
} from 'lucide-react';

const Products = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryList, setCategoryList] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    mainImage: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 从URL读取初始分类
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromQuery = params.get('category');
    if (categoryFromQuery) {
      setSelectedCategory(categoryFromQuery);
    }
  }, [location.search]);

  // 当分类变化时，同步到URL，便于从导航或刷新后保持筛选
  useEffect(() => {
    const search = selectedCategory && selectedCategory !== 'all'
      ? `?category=${encodeURIComponent(selectedCategory)}`
      : '';
    const current = new URLSearchParams(location.search).get('category') || '';
    const target = selectedCategory !== 'all' ? selectedCategory : '';
    if (current !== target) {
      navigate({ pathname: '/products', search }, { replace: true });
    }
  }, [selectedCategory]);

  // 从API获取产品数据
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [user?.role]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ limit: 100 }); // 获取所有产品
      const productsList = data.products || data || [];
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('获取产品数据失败:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let list = [];
      if (user?.role === 'admin') {
        const categories = await getAdminCategories();
        list = Array.isArray(categories) ? categories.filter(c => c.isActive !== false).map(c => ({ name: c.name })) : [];
      } else {
        const categories = await getProductCategories();
        list = Array.isArray(categories) ? categories.map(c => ({ name: c.name })) : [];
      }
      setCategoryList(list);
      if (!newProduct.category && list.length > 0) {
        setNewProduct(prev => ({ ...prev, category: list[0].name }));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      setCategoryList([]);
    }
  };

  // 搜索和筛选
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // 验证必填字段
      if (!newProduct.name || !newProduct.description || !newProduct.category) {
        throw new Error(t('fillAllFields'));
      }
      
      // 生成slug
      const slug = newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // 处理price字段
      let price = null;
      if (newProduct.price && !isNaN(parseFloat(newProduct.price))) {
        // 确保价格在合理范围内 (最多10位数字，2位小数)
        price = Math.min(parseFloat(newProduct.price), 99999999.99);
        price = parseFloat(price.toFixed(2));
      }
      
      // 确保category字段有效（来自管理员分类）
      const adminNames = categoryList.map(c => c.name);
      const category = adminNames.includes(newProduct.category) ? newProduct.category : (adminNames[0] || '');
      
      const productData = {
        name: newProduct.name,
        category: category, // 使用管理员分类名称
        description: newProduct.description || t('noDescription'),
        mainImage: newProduct.mainImage || '/api/placeholder/400/300',
        price: price,
        isPublished: true,
        slug: slug,
        images: [],
        seoKeywords: []
      };
      
      console.log('Sending product data:', productData); // 添加日志
      
      const addedProduct = await createProduct(productData);
      setProducts(prev => [...prev, addedProduct]);
      setNewProduct({
        name: '',
        category: 'CNC Machines',
        description: '',
        price: '',
        mainImage: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('添加产品失败:', error);
      // 可以添加错误提示给用户
      alert(t('createProductFailed'));
      // 添加详细的错误日志
      if (error.response && error.response.data && error.response.data.errors) {
        console.error('验证错误:', error.response.data.errors);
      }
    }
  };

  const handleUploadMainImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      setUploadError('');
      const result = await uploadFile(file, 'image');
      setNewProduct(prev => ({ ...prev, mainImage: result.url }));
    } catch (err) {
      console.error('图片上传失败:', err);
      setUploadError(t('imageUploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  // 构建分类选项，包括"全部"选项
  const categoryOptions = [
    { value: 'all', label: t('allCategories') },
    ...categoryList.map(category => ({
      value: category.name,
      label: category.name
    }))
  ];

  const sortOptions = [
    { value: 'name', label: t('sortByName') },
    { value: 'price', label: t('sortByPrice') },
    { value: 'rating', label: t('sortByRating') },
    { value: 'newest', label: t('sortByNewest') }
  ];

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
        title={t('ourProducts')} 
        description={t('exploreProducts') || "Discover our wide range of high-quality cold roll forming machines."}
        url="/products"
      />
      {/* Hero Section */}
      <div className="relative py-32 bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-primary-900/80 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')` }}
          />
        </div>
        <div className="container relative z-20 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-serif font-bold mb-6"
            >
              {t('ourProducts')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200 font-light"
            >
              {t('exploreProducts')}
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
                placeholder={t('searchProducts')}
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
                {categoryOptions.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Add Product Button (Admin only) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addProduct')}
              </button>
            )}

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('addProduct')}</h3>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('productName')}</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelCategory')}</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.filter(cat => cat.value !== 'all').map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('productDescription')}</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelPrice')}</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('productImage')}</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t('orPasteImageURL')}
                    value={newProduct.mainImage}
                    onChange={(e) => setNewProduct({...newProduct, mainImage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMainImage}
                    />
                    {uploading && (<span className="text-sm text-gray-500">{t('uploading')}</span>)}
                    {uploadError && (
                      <span className="text-sm text-red-600">{uploadError}</span>
                    )}
                  </div>
                  {newProduct.mainImage && (
                    <img
                      src={newProduct.mainImage}
                      alt="preview"
                      className="mt-2 w-full h-40 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('btnCreate')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t('btnCancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProductsFound')}</h3>
            <p className="text-gray-500">{t('tryAdjustingSearch')}</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id || product.id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col"
                  onClick={() => navigate(`/products/${product.slug}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                    <img
                      src={product.mainImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
                       <span className="text-white font-bold text-sm bg-primary-600 px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                         {t('viewDetails')}
                       </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-primary-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-500">(4.8)</span>
                      </div>
                      <div className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform flex items-center">
                        {t('learnMore')} <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Products;
