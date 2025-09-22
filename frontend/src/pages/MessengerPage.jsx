import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { fetchConversations, fetchMessages, addMessage, clearMessages } from '../features/chat/chatSlice';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Send, Search } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../api/axios';

const MessengerPage = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);
  const { conversations, messages, messagesStatus } = useSelector((state) => state.chat);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch danh sách cuộc trò chuyện
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Lắng nghe tin nhắn mới từ socket
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        // Chỉ thêm tin nhắn nếu đang xem đúng cuộc trò chuyện
        if (selectedConversation && message.senderId === selectedConversation.participants[0]._id) {
          dispatch(addMessage(message));
        }
      });
      return () => socket.off('newMessage');
    }
  }, [socket, dispatch, selectedConversation]);
  
  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    dispatch(fetchMessages(conv.participants[0]._id));
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants[0]._id;
    const messageData = {
      senderId: userInfo._id,
      receiverId,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    
    // Thêm tin nhắn của mình vào UI ngay lập tức
    dispatch(addMessage(messageData));
    setNewMessage('');
    
    // Gửi tin nhắn lên server
    await api.post(`/messages/send/${receiverId}`, { content: newMessage });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex border border-border rounded-2xl bg-card">
      {/* Cột trái: Danh sách cuộc trò chuyện */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv._id}
              onClick={() => handleSelectConversation(conv)}
              className={cn(
                "p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary",
                selectedConversation?._id === conv._id && "bg-secondary"
              )}
            >
              <Avatar><AvatarImage src={conv.participants[0].avatar} /><AvatarFallback>{conv.participants[0].username[0]}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{conv.participants[0].username}</p>
                <p className="text-sm text-muted-foreground truncate">{conv.messages[0]?.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Cửa sổ chat */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar><AvatarImage src={selectedConversation.participants[0].avatar} /><AvatarFallback>{selectedConversation.participants[0].username[0]}</AvatarFallback></Avatar>
              <h3 className="font-semibold">{selectedConversation.participants[0].username}</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex", msg.senderId === userInfo._id ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-xs lg:max-w-md px-4 py-2 rounded-2xl", msg.senderId === userInfo._id ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <Button type="submit"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;