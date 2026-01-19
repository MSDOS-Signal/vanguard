import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductBySlug } from '../services/api';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (e) {
        setError('无法加载产品');
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">{error || '未找到产品'}</div>
    );
  }

  const specs = Array.isArray(product.specifications) ? product.specifications : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow p-6">
            <img src={product.mainImage} alt={product.name} className="w-full h-96 object-cover rounded" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.category}</p>
            <p className="text-gray-700 leading-7 whitespace-pre-line">{product.description}</p>
            <div className="mt-6 flex space-x-3">
              <button onClick={() => navigate(`/contact?product=${encodeURIComponent(product.name)}`)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">联系客服</button>
              <button onClick={() => navigate('/products')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">返回列表</button>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">技术规格</h2>
          {specs.length === 0 ? (
            <p className="text-gray-500">暂无规格</p>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specs.map((item, idx) => (
                <div key={idx} className="border rounded p-3">
                  <dt className="text-gray-500 text-sm">{item.label || item.key}</dt>
                  <dd className="text-gray-900 font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
