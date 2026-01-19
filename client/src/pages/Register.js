import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (form.password !== form.confirm) {
        setError('两次输入的密码不一致');
        setLoading(false);
        return;
      }
      const { username, email, password } = form;
      const data = await registerUser({ username, email, password });
      await login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="username" value={form.username} onChange={onChange} required placeholder="用户名" className="w-full px-4 py-3 border rounded-lg" />
          <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="邮箱" className="w-full px-4 py-3 border rounded-lg" />
          <input name="password" type="password" value={form.password} onChange={onChange} required placeholder="密码（至少6位）" className="w-full px-4 py-3 border rounded-lg" />
          <input name="confirm" type="password" value={form.confirm} onChange={onChange} required placeholder="确认密码" className="w-full px-4 py-3 border rounded-lg" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{loading ? '注册中...' : '注册'}</button>
          <button type="button" onClick={() => navigate('/login')} className="w-full py-3 border rounded-lg mt-2">已有账号？去登录</button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;


