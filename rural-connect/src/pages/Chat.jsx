import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const Chat = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { contactId } = useParams()

  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    let mounted = true
    api
      .get('/api/workers')
      .then(({ data }) => {
        if (!mounted) return
        const mapped = data.map((w) => ({
          id: w._id,
          userId: w.userId,
          name: w.name,
          lastMessage: '',
          time: '',
          unread: 0,
          avatar: '👤',
        }))
        setConversations(mapped)
      })
      .catch(() => setConversations([]))
    return () => {
      mounted = false
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatMessages = (list) =>
    list.map((m) => ({
      id: m._id,
      text: m.message,
      sender:
        (m.sender?._id || m.sender || m.senderId)?.toString() === user?._id ? 'me' : 'other',
      time: new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

  const fetchConversation = useCallback(
    async (targetId) => {
      if (!targetId) return
      setMessagesLoading(true)
      try {
        const workerResponse = await api.get(`/api/chat/worker/${targetId}`)
        setMessages(formatMessages(workerResponse.data.messages))
        setSelectedChat({
          type: 'worker',
          workerId: targetId,
          partnerUserId: workerResponse.data.partner.userId,
          partnerName: workerResponse.data.partner.name || 'Worker',
          avatar: '👷',
        })
        setMessagesLoading(false)
        return
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Unable to load worker chat', error)
          setMessages([])
          setSelectedChat(null)
          setMessagesLoading(false)
          return
        }
      }

      try {
        const userResponse = await api.get(`/api/chat/user/${targetId}`)
        setMessages(formatMessages(userResponse.data.messages))
        setSelectedChat({
          type: 'user',
          workerId: null,
          partnerUserId: userResponse.data.partner.userId,
          partnerName: userResponse.data.partner.name || 'User',
          avatar: '👤',
        })
      } catch (error) {
        console.error('Unable to load chat', error)
        setMessages([])
        setSelectedChat(null)
      } finally {
        setMessagesLoading(false)
      }
    },
    [user?._id]
  )

  useEffect(() => {
    if (contactId) {
      fetchConversation(contactId)
    } else {
      setSelectedChat(null)
      setMessages([])
    }
  }, [contactId, fetchConversation])

  const openChat = (workerId) => {
    if (!workerId) return
    navigate(`/messages/${workerId}`)
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return
    setSending(true)
    try {
      await api.post('/api/chat/send', {
        workerId: selectedChat.type === 'worker' ? contactId : undefined,
        userId: selectedChat.type === 'user' ? selectedChat.partnerUserId : undefined,
        message,
      })
      setMessage('')
      if (contactId) {
        fetchConversation(contactId)
      }
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl font-bold text-gray-800 mb-6"
        >
          {t('chat.title')}
        </motion.h1>

        <div className="card p-0 overflow-hidden h-[calc(100vh-200px)] flex">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search conversations..."
                className="input-field w-full"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: '#f5f0e8' }}
                  onClick={() => openChat(conversation.id)}
                  className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                    selectedChat?.type === 'worker' && selectedChat.workerId === conversation.id
                      ? 'bg-rural-green-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{conversation.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="bg-rural-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-earthy-beige-50">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">
                      {selectedChat.avatar ||
                        conversations.find((c) => c.id === selectedChat.workerId)?.avatar ||
                        '👤'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {selectedChat.partnerName ||
                          conversations.find((c) => c.id === selectedChat.workerId)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      📞
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      📹
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center text-gray-500">{t('chat.loadingMessages')}</div>
                  ) : (
                    <>
                      <AnimatePresence>
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                msg.sender === 'me'
                                  ? 'bg-rural-green-500 text-white'
                                  : 'bg-white text-gray-800 shadow-md'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                                }`}
                              >
                                {msg.time}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="bg-white p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      📎
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('chat.typeMessage')}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!message.trim() || sending}
                    >
                      {t('chat.send')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-600 text-lg">{t('chat.noChat')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat


