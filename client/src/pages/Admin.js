import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  uploadFile, 
  createProduct, 
  createNews, 
  getProducts, 
  getNews, 
  getContactInquiries, 
  getUsers, 
  deleteProduct, 
  updateProduct,
  updateNews,
  deleteNews,
  createUser,
  updateUser,
  deleteUser,
  updateContactStatus,
  respondToInquiry,
  getDashboardStats,
  getAdminCategories,
  getAdminProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryUsage,
  getSeoConfig,
  saveSeoConfig
} from '../services/api';
import { 
  LayoutDashboard,
  Package,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Tag,
  FolderOpen,
  Globe
} from 'lucide-react';

const Admin = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_recent_activities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [seoConfig, setSeoConfig] = useState({
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    ogImage: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: ''
  });
  const [seoLoading, setSeoLoading] = useState(false);

  // 添加活动记录的函数
  const addActivity = (type, action, item) => {
    const newActivity = {
      type,
      action,
      item,
      time: new Date().toISOString()
    };
    setRecentActivities(prev => {
      const next = [newActivity, ...prev].slice(0, 20);
      try { localStorage.setItem('admin_recent_activities', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Persist recent activities if changed externally
  useEffect(() => {
    try { localStorage.setItem('admin_recent_activities', JSON.stringify(recentActivities.slice(0, 20))); } catch {}
  }, [recentActivities]);

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 容错获取，避免一个接口失败导致全部为空
        const results = await Promise.allSettled([
          getAdminProducts(),
          getNews({ limit: 100 }),
          getContactInquiries({ limit: 100 }),
          getUsers({ limit: 100 }),
          getAdminCategories(),
          getDashboardStats(),
          getSeoConfig()
        ]);

        const [pRes, nRes, cRes, uRes, catRes, dashRes, seoRes] = results;
        const productsData = pRes.status === 'fulfilled' ? pRes.value : [];
        const newsData = nRes.status === 'fulfilled' ? nRes.value : [];
        const contactsData = cRes.status === 'fulfilled' ? cRes.value : [];
        const usersData = uRes.status === 'fulfilled' ? uRes.value : [];
        const categoriesData = catRes.status === 'fulfilled' ? catRes.value : [];
        const dashboard = dashRes.status === 'fulfilled' ? dashRes.value : null;
        const seoData = seoRes.status === 'fulfilled' ? seoRes.value : {};

        if (seoData && Object.keys(seoData).length > 0) {
          setSeoConfig(prev => ({ ...prev, ...seoData }));
        }

        const prodList = productsData.products || productsData || [];
        const newsList = newsData.news || newsData || [];
        const contactList = contactsData.contacts || contactsData || [];
        const userList = usersData.users || usersData || [];
        setProducts(prodList);
        setNews(newsList);
        setContacts(contactList);
        setUsers(userList);
        setCategories(categoriesData || []);
        // Fallback if counts missing or zeros unexpectedly
        const counts = dashboard?.counts;
        if (counts && (counts.products || counts.news || counts.contacts || counts.users)) {
          setDashboardStats(counts);
        } else {
          setDashboardStats({
            products: Array.isArray(prodList) ? prodList.length : 0,
            news: Array.isArray(newsList) ? newsList.length : 0,
            contacts: Array.isArray(contactList) ? contactList.length : 0,
            users: Array.isArray(userList) ? userList.length : 0
          });
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 如果API调用失败，设置空数组
        setProducts([]);
        setNews([]);
        setContacts([]);
        setUsers([]);
        setCategories([]);
        setDashboardStats(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Dedicated refresher for dashboard counters
  const refreshDashboardStats = async () => {
    try {
      const dashboard = await getDashboardStats();
      setDashboardStats(dashboard?.counts || null);
    } catch {}
  };

  // 禁用自动刷新，避免在填写表单时造成干扰
  // 用户可以通过手动刷新或重新进入页面来更新数据
  // useEffect(() => {
  //   if (activeTab === 'dashboard') {
  //     const id = setInterval(() => {
  //       refreshDashboardStats();
  //     }, 30000); // 30s 刷新一次，减少刷新频率
  //     return () => clearInterval(id);
  //   }
  // }, [activeTab]);

  // 产品管理函数
  const handleAddProduct = () => {
    setEditingItem(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingItem(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('确定要删除这个产品吗？')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        addActivity('product', '删除了产品', '已删除');
        refreshDashboardStats();
      } catch (error) {
        console.error('删除产品失败:', error);
        alert('删除产品失败');
      }
    }
  };

  // 更新产品提交函数，添加活动记录
  const handleProductSubmit = async (productData) => {
    try {
      // 验证必填字段
      if (!productData.name || !productData.description || !productData.category) {
        throw new Error('请填写所有必填字段');
      }
      
      // 生成slug
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // 处理price字段
      let price = null;
      if (productData.price && !isNaN(parseFloat(productData.price))) {
        // 确保价格在合理范围内 (最多10位数字，2位小数)
        price = Math.min(parseFloat(productData.price), 99999999.99);
        price = parseFloat(price.toFixed(2));
      }
      
      // 确保category字段有效
      const category = productData.category || (categories.length > 0 ? categories[0].name : '默认分类');
      
      // 调整数据格式以匹配API要求
      const apiProductData = {
        name: productData.name,
        category: category, // 确保category字段有效
        description: productData.description || '暂无描述',
        mainImage: productData.mainImage || '/api/placeholder/400/300',
        price: price,
        isPublished: productData.status === 'published',
        isFeatured: false,
        slug: slug,
        images: [],
        seoKeywords: []
      };

      console.log('Sending product data:', apiProductData); // 添加日志
      
      if (editingItem) {
        // 编辑现有产品，调用更新API
        const updatedProduct = await updateProduct(editingItem.id, apiProductData);
        setProducts(products.map(p => 
          p.id === editingItem.id ? updatedProduct : p
        ));
        addActivity('product', '编辑了产品', productData.name);
        refreshDashboardStats();
      } else {
        // 添加新产品到数据库
        const newProduct = await createProduct(apiProductData);
        
        setProducts([...products, newProduct]);
        addActivity('product', '添加了新产品', productData.name);
        refreshDashboardStats();
      }
      
      // 关闭模态框并重置状态
      setShowProductModal(false);
      setEditingItem(null);
      
      // 显示成功消息
      alert('产品保存成功！');
      
    } catch (error) {
      console.error('创建产品失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '创建产品失败，请检查所有必填字段是否已填写';
      
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          const errorDetails = error.response.data.errors.map(err => err.msg).join(', ');
          errorMessage = `创建产品失败: ${errorDetails}`;
        } else if (error.response.data.message) {
          errorMessage = `创建产品失败: ${error.response.data.message}`;
        }
      }
      
      alert(errorMessage);
      
      // 添加详细的错误日志
      if (error.response && error.response.data && error.response.data.errors) {
        console.error('验证错误:', error.response.data.errors);
      }
    }
  };

  // 新闻管理函数
  const handleAddNews = () => {
    setEditingItem(null);
    setShowNewsModal(true);
  };

  const handleEditNews = (news) => {
    setEditingItem(news);
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('确定要删除这篇新闻吗？')) {
      try {
        await deleteNews(newsId);
        setNews(news.filter(n => n.id !== newsId));
        addActivity('news', '删除了新闻', '已删除');
        refreshDashboardStats();
      } catch (error) {
        console.error('删除新闻失败:', error);
        alert('删除新闻失败');
      }
    }
  };

  // 更新新闻提交函数，添加活动记录
  const handleNewsSubmit = async (newsData) => {
    try {
      if (editingItem) {
        // 编辑现有新闻，调用更新API
        const updatedNews = await updateNews(editingItem.id, {
          ...newsData,
          isPublished: newsData.status === 'published',
          summary: newsData.summary || (newsData.content.substring(0, 200) + '...'),
          author: newsData.author || 'Admin',
          category: newsData.category || 'General' // 如果没有分类，使用默认值
        });
        setNews(news.map(n => 
          n.id === editingItem.id ? updatedNews : n
        ));
        addActivity('news', '编辑了新闻', newsData.title);
        refreshDashboardStats();
      } else {
        // 添加新闻到数据库
        const newNews = await createNews({
          ...newsData,
          isPublished: newsData.status === 'published',
          summary: newsData.summary || (newsData.content.substring(0, 200) + '...'),
          author: newsData.author || 'Admin',
          category: newsData.category || 'General' // 如果没有分类，使用默认值
        });
        
        setNews([...news, newNews]);
        addActivity('news', '发布了新闻', newsData.title);
        refreshDashboardStats();
      }
      
      // 关闭模态框并重置状态
      setShowNewsModal(false);
      setEditingItem(null);
      
      // 显示成功消息
      alert('新闻保存成功！');
      
    } catch (error) {
      console.error('创建新闻失败:', error);
      let errorMessage = '创建/更新新闻失败，请检查必填字段是否完整（标题/摘要/内容/作者/封面图）';
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      alert(errorMessage);
    }
  };

  // 用户管理函数
  const handleAddUser = () => {
    setEditingItem(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingItem(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        addActivity('user', '删除了用户', '已删除');
        refreshDashboardStats();
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
      }
    }
  };

  // 更新用户提交函数，添加活动记录
  const handleUserSubmit = async (userData) => {
    try {
      if (editingItem) {
        // 编辑现有用户，调用更新API
        const updatedUser = await updateUser(editingItem.id, userData);
        setUsers(users.map(u => 
          u.id === editingItem.id ? updatedUser : u
        ));
        addActivity('user', '编辑了用户', userData.username);
      } else {
        // 添加新用户到数据库
        const newUser = await createUser({
          ...userData,
          role: 'admin',
          isActive: true
        });
        setUsers([...users, newUser]);
        addActivity('user', '添加了新用户', userData.username);
        refreshDashboardStats();
      }
      setShowUserModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('创建用户失败:', error);
      alert('创建用户失败，请检查所有必填字段');
    }
  };

  // 联系管理函数
  const handleContactStatusChange = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus);
      setContacts(contacts.map(c => 
        c.id === contactId ? { ...c, status: newStatus } : c
      ));
      addActivity('contact', '更新了联系状态', newStatus);
    } catch (error) {
      console.error('更新联系状态失败:', error);
      alert('更新联系状态失败');
    }
  };

  // 分类管理函数
  const handleAddCategory = () => {
    setEditingItem(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingItem(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      // 检查分类使用情况
      const usage = await getCategoryUsage(categoryId);
      if (usage.totalUsage > 0) {
        alert(`无法删除分类，该分类正在被 ${usage.productCount} 个产品和 ${usage.newsCount} 篇新闻使用。`);
        return;
      }

      if (window.confirm('确定要删除这个分类吗？')) {
        await deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
        addActivity('category', '删除了分类', '已删除');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('删除分类失败');
    }
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      if (editingItem) {
        // 编辑现有分类
        const updatedCategory = await updateCategory(editingItem.id, categoryData);
        setCategories(categories.map(c => 
          c.id === editingItem.id ? updatedCategory : c
        ));
        addActivity('category', '编辑了分类', categoryData.name);
      } else {
        // 添加新分类
        const newCategory = await createCategory(categoryData);
        setCategories([...categories, newCategory]);
        addActivity('category', '添加了新分类', categoryData.name);
      }
      setShowCategoryModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('创建分类失败:', error);
      alert('创建分类失败，请检查分类名称是否已存在');
    }
  };

  const handleContactPriorityChange = async (contactId, newPriority) => {
    try {
      await updateContactStatus(contactId, newPriority);
      setContacts(contacts.map(c => 
        c.id === contactId ? { ...c, priority: newPriority } : c
      ));
      addActivity('contact', '更新了联系优先级', newPriority);
    } catch (error) {
      console.error('更新联系优先级失败:', error);
      alert('更新联系优先级失败');
    }
  };

  // 筛选和搜索
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && product.isPublished) ||
                         (selectedStatus === 'draft' && !product.isPublished);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const menuItems = [
    { id: 'dashboard', label: t('adminDashboard'), icon: LayoutDashboard, color: 'blue' },
    { id: 'products', label: t('adminProducts'), icon: Package, color: 'green' },
    { id: 'news', label: t('adminNews'), icon: FileText, color: 'purple' },
    { id: 'categories', label: '分类管理', icon: Tag, color: 'teal' },
    { id: 'users', label: t('adminUsers'), icon: Users, color: 'orange' },
    { id: 'contacts', label: t('adminContacts'), icon: MessageSquare, color: 'red' },
    { id: 'seo', label: t('adminSEO'), icon: Settings, color: 'indigo' }
  ];

  const stats = [
    { label: t('statTotalProducts'), value: (dashboardStats?.products ?? products.length).toString(), change: '+12', changeType: 'positive' },
    { label: t('statTotalNews'), value: (dashboardStats?.news ?? news.length).toString(), change: '+5', changeType: 'positive' },
    { label: t('statTotalUsers'), value: (dashboardStats?.users ?? users.length).toString(), change: '+23', changeType: 'positive' },
    { label: t('statUnreadMessages'), value: (dashboardStats?.unread ?? contacts.filter(c => !c.isRead).length).toString(), change: '', changeType: 'negative' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivities')}</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <span className="font-medium">{activity.action}</span>
                <span className="text-gray-600">: {activity.item}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleAddProduct}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{t('addProduct')}</span>
          </button>
          <button 
            onClick={handleAddNews}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{t('publishNewsBtn')}</span>
          </button>
          <button 
            onClick={handleAddUser}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Users className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{t('manageUsersBtn')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <Settings className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">{t('systemSettingsBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('adminProducts')}</h2>
          <p className="text-gray-600">{t('quickActions')}</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.filter(cat => cat.isActive).map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有状态</option>
            <option value="published">{t('statusPublished')}</option>
            <option value="draft">{t('statusDraft')}</option>
            <option value="archived">{t('statusArchived')}</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('adminProducts')} ({filteredProducts.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelProduct')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelPrice')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelCreatedAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                        {product.mainImage && (
                          <img 
                            src={product.mainImage} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description ? product.description.substring(0, 50) + '...' : t('noDescription')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.price ? `¥${parseFloat(product.price).toLocaleString()}` : t('priceNegotiable')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.isPublished ? t('statusPublished') : t('statusDraft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : t('unknown')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('btnEdit')}
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('btnDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('adminNews')}</h2>
          <p className="text-gray-600">{t('quickActions')}</p>
        </div>
        <button 
          onClick={handleAddNews}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('publishNewsBtn')}</span>
        </button>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('adminNews')} ({news.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelTitle')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelAuthor')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelPublishDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelViews')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.isPublished ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '未发布'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.viewCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditNews(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('adminUsers')}</h2>
          <p className="text-gray-600">{t('quickActions')}</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addUser')}</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('adminUsers')} ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelUsername')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelEmail')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelRole')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelLastLogin')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role === 'admin' ? t('adminRole') : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? t('userActive') : t('userInactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('neverLoggedIn')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('btnEdit')}
                    </button>
                    {user.id !== 1 && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('adminContacts')}</h2>
          <p className="text-gray-600">{t('quickActions')}</p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('adminContacts')} ({contacts.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelCustomerInfo')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelSubject')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelPriority')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelCreatedAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('labelActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className={!contact.isRead ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                        {!contact.isRead && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      <div className="text-sm text-gray-500">{contact.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={contact.status}
                      onChange={(e) => handleContactStatusChange(contact.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="New">{t('contactStatusNew')}</option>
                      <option value="In Progress">{t('contactStatusInProgress')}</option>
                      <option value="Responded">{t('contactStatusResponded')}</option>
                      <option value="Closed">{t('contactStatusClosed')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={contact.priority}
                      onChange={(e) => handleContactPriorityChange(contact.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Low">{t('priorityLow')}</option>
                      <option value="Medium">{t('priorityMedium')}</option>
                      <option value="High">{t('priorityHigh')}</option>
                      <option value="Urgent">{t('priorityUrgent')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : t('unknown')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href={`/chat?thread=${contact.id}`} className="text-blue-600 hover:text-blue-900">{t('view')}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 产品模态框组件
  const ProductModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [formData, setFormData] = useState({
      name: '',
      category: '',
      price: '',
      status: 'draft',
      description: '',
      specifications: '',
      mainImage: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // 当模态框打开或产品数据变化时，重置表单数据
    useEffect(() => {
      if (isOpen) {
        setFormData({
          name: product?.name || '',
          category: product?.category || '',
          price: product?.price || '',
          status: product?.isPublished ? 'published' : 'draft',
          description: product?.description || '',
          specifications: product?.specifications || '',
          mainImage: product?.mainImage || ''
        });
      } else {
        // 模态框关闭时重置表单
        setFormData({
          name: '',
          category: '',
          price: '',
          status: 'draft',
          description: '',
          specifications: '',
          mainImage: ''
        });
        setUploading(false);
        setUploadError('');
      }
    }, [isOpen, product]);

    const handleUploadImage = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        setUploading(true);
        setUploadError('');
        const result = await uploadFile(file, 'image');
        setFormData(prev => ({ ...prev, mainImage: result.url }));
      } catch (err) {
        setUploadError('图片上传失败，请重试');
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {product ? t('editProduct') : t('addProduct')}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('productName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelCategory')} *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择分类</option>
                  {categories.filter(cat => cat.isActive).map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('labelPrice')}</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDescription')} *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('technicalSpecifications')}</label>
              <textarea
                value={formData.specifications}
                onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productImage')}</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t('orPasteImageURL')}
                  value={formData.mainImage}
                  onChange={(e) => setFormData({...formData, mainImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input type="file" accept="image/*" onChange={handleUploadImage} />
                {uploading && <span className="text-sm text-gray-500">{t('uploading')}</span>}
                {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
                {formData.mainImage && (
                  <img src={formData.mainImage} alt="预览" className="mt-2 w-full h-40 object-cover rounded" />
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {product ? t('updateProduct') : t('addProduct')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 新闻模态框组件
  const NewsModal = ({ isOpen, onClose, onSubmit, news }) => {
    const [formData, setFormData] = useState({
      title: '',
      category: '',
      status: 'published',
      summary: '',
      content: '',
      featuredImage: ''
    });

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // 当模态框打开或新闻数据变化时，重置表单数据
    useEffect(() => {
      if (isOpen) {
        setFormData({
          title: news?.title ?? '',
          category: news?.category ?? '',
          status: news?.isPublished ? 'published' : 'published',
          summary: news?.summary ?? '',
          content: news?.content ?? '',
          featuredImage: news?.featuredImage ?? ''
        });
      } else {
        // 模态框关闭时重置表单
        setFormData({
          title: '',
          category: '',
          status: 'published',
          summary: '',
          content: '',
          featuredImage: ''
        });
        setUploading(false);
        setUploadError('');
      }
    }, [isOpen, news]);

    const handleUploadFeatured = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        setUploading(true);
        setUploadError('');
        const result = await uploadFile(file, 'image');
        setFormData(prev => ({ ...prev, featuredImage: result.url }));
      } catch (err) {
        setUploadError('封面图上传失败，请重试');
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    // 移除了自动草稿保存功能，避免状态冲突导致表单刷新

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {news ? '编辑新闻' : '发布新闻'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择分类（可选）</option>
                  {categories.filter(cat => cat.isActive).map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">摘要 *</label>
              <textarea
                required
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">封面图 *</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="或粘贴图片URL"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input type="file" accept="image/*" onChange={handleUploadFeatured} />
                {uploading && <span className="text-sm text-gray-500">正在上传...</span>}
                {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
                {formData.featuredImage && (
                  <img src={formData.featuredImage} alt="预览" className="mt-2 w-full h-40 object-cover rounded" />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {news ? '更新新闻' : '发布新闻'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 分类模态框组件
  const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      isActive: true
    });

    // 当模态框打开或分类数据变化时，重置表单数据
    useEffect(() => {
      if (isOpen) {
        setFormData({
          name: category?.name || '',
          description: category?.description || '',
          isActive: category?.isActive !== undefined ? category.isActive : true
        });
      } else {
        // 模态框关闭时重置表单
        setFormData({
          name: '',
          description: '',
          isActive: true
        });
      }
    }, [isOpen, category]);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {category ? '编辑分类' : '添加分类'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类名称 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="请输入分类名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="请输入分类描述（可选）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'active'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {category ? '更新分类' : '添加分类'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 用户模态框组件
  const UserModal = ({ isOpen, onClose, onSubmit, user }) => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: true
    });

    // 当模态框打开或用户数据变化时，重置表单数据
    useEffect(() => {
      if (isOpen) {
        setFormData({
          username: user?.username || '',
          email: user?.email || '',
          password: '',
          role: user?.role || 'admin',
          isActive: user?.isActive !== undefined ? user.isActive : true
        });
      } else {
        // 模态框关闭时重置表单
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'admin',
          isActive: true
        });
      }
    }, [isOpen, user]);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {user ? '编辑用户' : '添加用户'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">管理员</option>
                  <option value="editor">编辑</option>
                  <option value="user">用户</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'active'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {user ? '更新用户' : '添加用户'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">分类管理</h2>
          <p className="text-gray-600">管理产品和新闻的分类</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>添加分类</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">分类列表 ({categories.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-teal-600 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.description || '无描述'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '未知'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleSaveSeoConfig = async (e) => {
    e.preventDefault();
    try {
      setSeoLoading(true);
      await saveSeoConfig(seoConfig);
      toast.success('SEO设置已保存');
      addActivity('update', 'updated SEO settings', { name: 'SEO Settings' });
    } catch (error) {
      console.error('保存SEO设置失败:', error);
      toast.error('保存失败');
    } finally {
      setSeoLoading(false);
    }
  };

  const renderSEO = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO设置</h2>
          <p className="text-gray-600">配置全局SEO信息和社交媒体链接</p>
        </div>
        <button 
          onClick={handleSaveSeoConfig}
          disabled={seoLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {seoLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span>保存设置</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic SEO Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            基础 SEO 信息
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站标题 (Site Title)</label>
              <input
                type="text"
                value={seoConfig.siteTitle}
                onChange={(e) => setSeoConfig({...seoConfig, siteTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vanguard Machinery"
              />
              <p className="mt-1 text-xs text-gray-500">显示在浏览器标签页和搜索结果标题中</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认描述 (Default Description)</label>
              <textarea
                value={seoConfig.siteDescription}
                onChange={(e) => setSeoConfig({...seoConfig, siteDescription: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leading manufacturer of cold roll forming machines..."
              />
              <p className="mt-1 text-xs text-gray-500">建议 150-160 个字符，用于搜索引擎摘要</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认关键词 (Default Keywords)</label>
              <input
                type="text"
                value={seoConfig.siteKeywords}
                onChange={(e) => setSeoConfig({...seoConfig, siteKeywords: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="cold roll forming, machinery, manufacturing..."
              />
              <p className="mt-1 text-xs text-gray-500">用逗号分隔关键词</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认分享图片 URL (OG Image)</label>
              <input
                type="text"
                value={seoConfig.ogImage}
                onChange={(e) => setSeoConfig({...seoConfig, ogImage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            社交媒体链接
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="text"
                value={seoConfig.facebook}
                onChange={(e) => setSeoConfig({...seoConfig, facebook: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter (X)</label>
              <input
                type="text"
                value={seoConfig.twitter}
                onChange={(e) => setSeoConfig({...seoConfig, twitter: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/your-handle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                value={seoConfig.linkedin}
                onChange={(e) => setSeoConfig({...seoConfig, linkedin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/company/your-company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="text"
                value={seoConfig.instagram}
                onChange={(e) => setSeoConfig({...seoConfig, instagram: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/your-profile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'news':
        return renderNews();
      case 'categories':
        return renderCategories();
      case 'users':
        return renderUsers();
      case 'contacts':
        return renderContacts();
      case 'seo':
        return renderSEO();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Vanguard Machinery
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'news' && renderNews()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'contacts' && renderContacts()}
            {activeTab === 'seo' && renderSEO()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleProductSubmit}
        product={editingItem}
      />
      
      <NewsModal
        isOpen={showNewsModal}
        onClose={() => {
          setShowNewsModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleNewsSubmit}
        news={editingItem}
      />
      
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleUserSubmit}
        user={editingItem}
      />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleCategorySubmit}
        category={editingItem}
      />
    </div>
  );
};

export default Admin;
