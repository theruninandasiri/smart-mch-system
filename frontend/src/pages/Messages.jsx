import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function BroadcastHistory() {
  const { t } = useTranslation();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/broadcasts')
      .then(res => setBroadcasts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || broadcasts.length === 0) return null;

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden', marginTop: '1.25rem',
    }}>
      <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
          {t('broadcastHistory')}
        </h3>
      </div>
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {broadcasts.map(b => (
          <div key={b._id} style={{
            border: '1px solid #e8f0f5', borderRadius: '10px',
            padding: '0.875rem 1.25rem', backgroundColor: '#f7fbfd',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a3a4a', flex: 1 }}>{b.message}</p>
            <span style={{ fontSize: '0.75rem', color: '#9ab0bc', marginLeft: '1rem', whiteSpace: 'nowrap' }}>
              {new Date(b.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [users, setUsers] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    loadAllowedUsers();
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedUser._id, true);
      }, 10000);
    }
    return () => clearInterval(pollingRef.current);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load users based on role
  const loadAllowedUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      const allUsers = res.data.filter(u => u._id !== user?._id);

      if (user?.role === 'moh_officer') {
        // MOH Officers can message everyone
        setAllowedUsers(allUsers);
      } else if (user?.role === 'midwife') {
        // Midwives can only message mothers and MOH officers
        setAllowedUsers(allUsers.filter(u => u.role === 'mother' || u.role === 'moh_officer'));
      } else if (user?.role === 'mother') {
        // Mothers can only message midwives and MOH officers
        setAllowedUsers(allUsers.filter(u => u.role === 'midwife' || u.role === 'moh_officer'));
      }
    } catch {
      toast.error('Could not load users');
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (userId, silent = false) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      const unread = res.data.filter(m => m.sender?._id !== user?._id && !m.read).length;
      setUnreadCounts(prev => ({ ...prev, [userId]: unread }));
    } catch (err) {
      if (!silent) toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await api.post('/messages', { receiverId: selectedUser._id, message: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      await api.post('/messages/broadcast', { message: broadcastMsg });
      toast.success('Broadcast sent to all mothers');
      setBroadcastMsg('');
    } catch (err) {
      toast.error('Broadcast failed');
    }
  };

  const loadUserPicker = () => {
    setUsers(allowedUsers);
    setShowUserPicker(true);
  };

  const getRoleLabel = (role) => {
    if (role === 'moh_officer') return 'MOH Officer';
    if (role === 'midwife') return 'Midwife';
    if (role === 'mother') return 'Mother';
    return role;
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'moh_officer') return { bg: '#e8f6f9', color: '#1a6b8a' };
    if (role === 'midwife') return { bg: '#eafaf1', color: '#27ae60' };
    if (role === 'mother') return { bg: '#f0eeff', color: '#6c5ce7' };
    return { bg: '#f0f4f7', color: '#7f9caa' };
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      height: '100vh', backgroundColor: '#f4f9fc',
      fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexShrink: 0,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('threewayPortal')}
          </p>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
            {t('messages')}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Privacy notice */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '0.35rem 0.875rem', fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.7)',
          }}>
            ⓘ {user?.role === 'mother' ? 'You can message midwives & MOH officers only' :
                 user?.role === 'midwife' ? 'You can message mothers & MOH officers only' :
                 'You can message all users'}
          </div>
          {totalUnread > 0 && (
            <div style={{
              backgroundColor: '#c0392b', color: 'white',
              borderRadius: '20px', padding: '0.35rem 0.875rem',
              fontSize: '0.78rem', fontWeight: '700',
            }}>
              {totalUnread} {t('unread')}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '1.25rem 2rem', gap: '1.25rem' }}>

        {/* Conversation List */}
        <div style={{
          width: '280px', flexShrink: 0,
          backgroundColor: 'white', borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
            padding: '0.875rem 1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>
              {t('conversations')}
            </h3>
            <button onClick={loadUserPicker} style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: '6px', padding: '0.25rem 0.625rem',
              fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
            }}>
              {t('newConversation')}
            </button>
          </div>

          {/* User Picker */}
          {showUserPicker && users.length > 0 && (
            <div style={{
              position: 'absolute', top: '50px', left: '10px', right: '10px',
              backgroundColor: 'white', borderRadius: '10px', zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #eef4f7', overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.5rem 1rem', backgroundColor: '#f4f9fc',
                borderBottom: '1px solid #eef4f7',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600' }}>
                  SELECT USER
                </p>
                <button onClick={() => setShowUserPicker(false)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ab0bc', fontSize: '0.875rem',
                }}>✕</button>
              </div>
              {users.map(u => {
                const badge = getRoleBadgeColor(u.role);
                return (
                  <div key={u._id} onClick={() => {
                    setSelectedUser(u);
                    setShowUserPicker(false);
                    if (!conversations.find(c => c._id === u._id)) {
                      setConversations(prev => [...prev, u]);
                    }
                  }} style={{
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    borderBottom: '1px solid #eef4f7', transition: 'background 0.15s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#1a3a4a' }}>{u.name}</p>
                    </div>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '20px',
                      fontSize: '0.65rem', fontWeight: '600',
                      backgroundColor: badge.bg, color: badge.color,
                    }}>
                      {getRoleLabel(u.role)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: '#9ab0bc', margin: '0 0 0.5rem' }}>
                  {t('noConversations')}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#c8d8e0', margin: 0 }}>
                  Click "+ New" to start a conversation
                </p>
              </div>
            ) : (
              conversations.map(conv => {
                const unread = unreadCounts[conv._id] || 0;
                const isSelected = selectedUser?._id === conv._id;
                const badge = getRoleBadgeColor(conv.role);
                return (
                  <div key={conv._id} onClick={() => {
                    setSelectedUser(conv);
                    setUnreadCounts(prev => ({ ...prev, [conv._id]: 0 }));
                  }} style={{
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid #eef4f7',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e8f6f9' : 'transparent',
                    borderLeft: isSelected ? '3px solid #1a6b8a' : '3px solid transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f7fbfd'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#1a3a4a' }}>{conv.name}</p>
                      <span style={{
                        padding: '0.1rem 0.5rem', borderRadius: '20px',
                        fontSize: '0.65rem', fontWeight: '600',
                        backgroundColor: badge.bg, color: badge.color,
                        display: 'inline-block', marginTop: '0.2rem',
                      }}>
                        {getRoleLabel(conv.role)}
                      </span>
                    </div>
                    {unread > 0 && (
                      <span style={{
                        backgroundColor: '#c0392b', color: 'white',
                        borderRadius: '50%', width: '20px', height: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: '700', flexShrink: 0,
                      }}>
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
          flex: 1, backgroundColor: 'white', borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {selectedUser ? (
            <>
              <div style={{
                padding: '0.875rem 1.5rem', borderBottom: '1px solid #eef4f7',
                backgroundColor: '#f7fbfd',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '0.875rem',
                  }}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a3a4a', fontSize: '0.95rem' }}>{selectedUser.name}</p>
                    <span style={{
                      padding: '0.1rem 0.5rem', borderRadius: '20px',
                      fontSize: '0.65rem', fontWeight: '600',
                      backgroundColor: getRoleBadgeColor(selectedUser.role).bg,
                      color: getRoleBadgeColor(selectedUser.role).color,
                    }}>
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#c8d8e0' }}>{t('autoRefresh')}</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#c8d8e0', fontSize: '0.875rem', marginTop: '3rem' }}>
                    No messages yet. Start the conversation.
                  </p>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender?._id === user?._id;
                  return (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%', padding: '0.75rem 1rem',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        backgroundColor: isMine ? '#1a6b8a' : '#f0f4f7',
                        color: isMine ? 'white' : '#1a3a4a',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{msg.message}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', opacity: 0.65, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #eef4f7', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text" value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t('typeMessage')}
                  style={{
                    flex: 1, padding: '0.65rem 1rem',
                    border: '2px solid #e8f0f5', borderRadius: '25px',
                    fontSize: '0.875rem', outline: 'none', color: '#1a3a4a',
                    backgroundColor: '#f7fbfd', transition: 'border-color 0.2s',
                    fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a6b8a'}
                  onBlur={e => e.target.style.borderColor = '#e8f0f5'}
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()} style={{
                  padding: '0.65rem 1.25rem',
                  background: newMessage.trim() ? 'linear-gradient(135deg, #1a6b8a, #2d9cad)' : '#e8f0f5',
                  color: newMessage.trim() ? 'white' : '#9ab0bc',
                  border: 'none', borderRadius: '25px',
                  fontSize: '0.875rem', fontWeight: '600',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}>
                  {t('send')}
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c8d8e0' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: '#f0f4f7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '1rem',
              }}>✉</div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>{t('selectConversation')}</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#d8e8f0' }}>
                {user?.role === 'mother' ? 'You can message midwives and MOH officers' :
                 user?.role === 'midwife' ? 'You can message mothers and MOH officers' :
                 'You can message all users'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Section — MOH Officers only */}
      {user?.role === 'moh_officer' && (
        <div style={{ padding: '0 2rem 1.25rem', flexShrink: 0 }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
              padding: '0.875rem 1.25rem',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>
                {t('broadcastAll')}
              </h3>
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text" value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendBroadcast()}
                placeholder={t('typeMessage')}
                style={{
                  flex: 1, padding: '0.65rem 1rem',
                  border: '2px solid #e8f0f5', borderRadius: '8px',
                  fontSize: '0.875rem', outline: 'none', color: '#1a3a4a',
                  backgroundColor: '#f7fbfd', transition: 'border-color 0.2s',
                  fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = '#1a6b8a'}
                onBlur={e => e.target.style.borderColor = '#e8f0f5'}
              />
              <button onClick={sendBroadcast} disabled={!broadcastMsg.trim()} style={{
                padding: '0.65rem 1.25rem',
                background: broadcastMsg.trim() ? 'linear-gradient(135deg, #1a3a4a, #1a6b8a)' : '#e8f0f5',
                color: broadcastMsg.trim() ? 'white' : '#9ab0bc',
                border: 'none', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: '600',
                cursor: broadcastMsg.trim() ? 'pointer' : 'not-allowed',
              }}>
                {t('sendBroadcast')}
              </button>
            </div>
          </div>
          <BroadcastHistory />
        </div>
      )}
    </div>
  );
}