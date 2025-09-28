import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Send, DoorOpen, User, Users } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../utils/cn';
import api from '../api/axios';

const AnonymousChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasOpponentLeft, setHasOpponentLeft] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('join_chat_room', conversationId);
      
      socket.on('new_message', (message) => {
        if (message.senderId !== userInfo._id) {
          setMessages((prev) => [...prev, message]);
        }
      });
      
      socket.on('user_left', () => {
        setHasOpponentLeft(true);
      });
      
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/messages/conversation/${conversationId}`);
          setMessages(data.messages);
        } catch (err) { navigate('/'); }
        finally { setLoading(false); }
      };
      fetchHistory();
      
      return () => {
        socket.off('new_message');
        socket.off('user_left');
      };
    }
  }, [socket, conversationId, userInfo, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userInfo || hasOpponentLeft) return;
    
    const messageData = { senderId: userInfo._id, content: newMessage, createdAt: new Date() };
    setMessages((prev) => [...prev, messageData]);
    
    socket.emit('send_message', { conversationId, senderId: userInfo._id, content: newMessage });
    setNewMessage('');
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave_chat_room', conversationId);
    }
    navigate('/');
  };
  
  const findNewMatch = () => {
    if (socket) {
      socket.emit('leave_chat_room', conversationId);
    }
    navigate('/matching', { replace: true });
  };
  
  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="font-semibold">Chatting with a Stranger</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleLeave}>
            <DoorOpen className="w-4 h-4 mr-2"/> End Chat
        </Button>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto space-y-4">
        {loading && <Skeleton className="w-full h-full" />}
        
        {messages.map((msg, index) => (
          <div key={index} className={cn("flex", msg.senderId === userInfo._id ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-md px-4 py-2 rounded-2xl", msg.senderId === userInfo._id ? "bg-primary text-primary-foreground" : "bg-card border")}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {hasOpponentLeft && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center p-4 bg-secondary rounded-lg text-muted-foreground">
            <p className="font-semibold">The other wanderer has left the conversation.</p>
            <Button onClick={findNewMatch} className="mt-4">
              <Users className="w-4 h-4 mr-2" /> Find a New Match
            </Button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>
      
      <footer className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage}>
          <fieldset disabled={hasOpponentLeft} className="flex gap-3">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={hasOpponentLeft ? "Your match has left." : "Say something..."} />
            <Button type="submit"><Send className="w-5 h-5" /></Button>
          </fieldset>
        </form>
      </footer>
    </div>
  );
};

export default AnonymousChatPage;