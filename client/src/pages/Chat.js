import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { recallMessage } from '../services/api';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [threads, setThreads] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/chat' + location.search } } });
      return;
    }
    const params = new URLSearchParams(location.search);
    const subject = params.get('product') ? `咨询产品：${params.get('product')}` : '聊天';
    const start = async () => {
      try {
        const threadId = params.get('thread');
        if (threadId) {
          const res = await api.get(`/contact/threads/${threadId}`);
          setThread(res.data);
        } else {
          const res = await api.post('/contact/threads', { subject });
          setThread(res.data);
        }
        // load sidebar threads for admin/editor
        try {
          const list = await api.get('/contact/threads');
          setThreads(list.data || []);
        } catch {}
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    start();
  }, [user, location.search]);

  useEffect(() => {
    if (!thread) return;
    // 管理员/编辑打开会话时标记为已读，并刷新侧边栏未读数
    const markReadIfStaff = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'editor') {
          await api.put(`/contact/${thread.id}/read`);
          try {
            const list = await api.get('/contact/threads');
            setThreads(list.data || []);
          } catch {}
        }
      } catch {}
    };
    markReadIfStaff();
    const poll = async () => {
      try {
        const res = await api.get(`/contact/threads/${thread.id}`);
        setThread(res.data);
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [thread?.id]);

  const sendText = async () => {
    const text = input.trim();
    if (!text || !thread) return;
    try {
      await api.post(`/contact/${thread.id}/messages`, { type: 'text', text });
      setInput('');
    } catch {}
  };

  const sendMedia = async (e, mediaType) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !thread) return;
    
    // 不再限制前端文件大小，改由服务器存储策略控制
    
    const fileId = Date.now().toString();
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', mediaType === 'image' ? 'image' : 'file'); // Tell server how to handle
      
      console.log('Uploading file:', { name: file.name, size: file.size, type: file.type, mediaType });
      
      const res = await api.post('/upload', form, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [fileId]: percentCompleted }));
        }
      });
      
      console.log('Upload response:', res.data);
      const url = res.data?.url;
      if (url) {
        await api.post(`/contact/${thread.id}/messages`, { type: mediaType, url });
        console.log('Message sent successfully');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || error.message || '上传失败';
      alert(`上传失败: ${errorMessage}`);
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        
        // Create a fake event object for sendMedia
        const fakeEvent = { target: { files: [file] } };
        await sendMedia(fakeEvent, 'audio');
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleRecall = async (messageId) => {
    if (!thread) return;
    try {
      await recallMessage(thread.id, messageId);
      // Refresh thread to show recalled message
      const res = await api.get(`/contact/threads/${thread.id}`);
      setThread(res.data);
    } catch (error) {
      console.error('Recall failed:', error);
      alert('撤回失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  if (!thread) return <div className="min-h-screen flex items-center justify-center">无法创建会话</div>;

  const msgs = Array.isArray(thread.messages) ? thread.messages : [];

  const renderBubble = (m, i) => {
    const isMine = (m.from === 'admin' || m.from === 'editor') ? (user?.role === 'admin' || user?.role === 'editor') : (user?.role === 'user');
    const align = isMine ? 'justify-end' : 'justify-start';
    const clazz = isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900';
    const canRecall = isMine && m.fromUserId === user?.id && !m.recalled && 
      (new Date() - new Date(m.at)) < 2 * 60 * 1000; // 2 minutes
    
    if (m.recalled) {
      return (
        <div key={i} className={`flex ${align}`}>
          <div className="px-3 py-2 rounded-lg max-w-[70%] bg-gray-200 text-gray-500 italic">
            <div>此消息已被撤回</div>
            <div className="text-xs opacity-70 mt-1">{new Date(m.at || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      );
    }

    return (
      <div key={i} className={`flex ${align} group`}>
        <div className={`px-3 py-2 rounded-lg max-w-[70%] ${clazz} relative`}>
          {m.type === 'image' && m.url ? (
            <img src={m.url} alt="图片" className="max-h-64 rounded" />
          ) : m.type === 'video' && m.url ? (
            <video src={m.url} controls className="max-h-64 rounded" />
          ) : m.type === 'audio' && m.url ? (
            <audio src={m.url} controls />
          ) : (
            <div className="whitespace-pre-line">{m.text}</div>
          )}
          <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
            <span>{new Date(m.at || Date.now()).toLocaleString()}</span>
            {canRecall && (
              <button
                onClick={() => handleRecall(m.id)}
                className="ml-2 text-xs opacity-0 group-hover:opacity-100 hover:underline"
              >
                撤回
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow flex h-[80vh]">
          {(
            // 所有登录用户（含管理员/编辑/普通用户）都显示侧边栏会话列表
            !!user
          ) && (
            <div className="w-64 border-r overflow-y-auto">
              <div className="p-3 font-medium border-b">会话列表</div>
              {threads.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/chat?thread=${t.id}`)}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-50 relative ${t.id === thread.id ? 'bg-gray-100' : ''}`}
                >
                  <div className="text-sm font-semibold truncate flex items-center">
                    {t.name || t.user?.username || '用户'} ({t.email || t.user?.email || '无邮箱'})
                    {t.unreadCount > 0 && (
                      <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    {t.unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{t.subject}</div>
                  {t.lastMessage && (
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {t.lastMessage.text || `[${t.lastMessage.type === 'image' ? '图片' : t.lastMessage.type === 'video' ? '视频' : t.lastMessage.type === 'audio' ? '语音' : '消息'}]`}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b font-semibold flex items-center justify-between">
              <span>与管理员聊天 - {thread.subject}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isConnected ? '在线' : '离线'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map(renderBubble)}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t flex items-center space-x-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => (e.key === 'Enter' ? sendText() : null)}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="输入消息..."
              />
              <label className="px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">图片
                <input type="file" accept="image/*" className="hidden" onChange={e => sendMedia(e, 'image')} />
              </label>
              <label className="px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">视频
                <input type="file" accept="video/*" className="hidden" onChange={e => sendMedia(e, 'video')} />
              </label>
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`px-3 py-2 border rounded cursor-pointer ${
                  recording ? 'bg-red-500 text-white' : 'hover:bg-gray-50'
                }`}
              >
                {recording ? '停止录音' : '语音'}
              </button>
              <button onClick={sendText} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">发送</button>
            </div>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="px-3 pb-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="text-xs text-gray-500">
                    上传中: {progress}%
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;


