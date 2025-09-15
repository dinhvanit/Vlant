import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { UserPlus, Search } from 'lucide-react';
import api from '../api/axios';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Fetch gợi ý kết bạn khi component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await api.get('/users/suggestions/all');
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, []);

  // Fetch kết quả tìm kiếm khi searchQuery thay đổi
  useEffect(() => {
    // Dùng debounce để không gọi API liên tục khi người dùng gõ
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        const fetchSearchResults = async () => {
          setIsSearching(true);
          try {
            const { data } = await api.get(`/users/search/users?q=${searchQuery}`);
            setSearchResults(data);
          } catch (error) {
            console.error("Failed to search users:", error);
          } finally {
            setIsSearching(false);
          }
        };
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300); // Đợi 300ms sau khi người dùng ngừng gõ

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border"
    >
      <Link to={`/profile/${user.username}`} className="flex items-center gap-4 min-w-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.username}</p>
          <p className="text-sm text-muted-foreground truncate">{user.bio || "A mysterious wanderer..."}</p>
        </div>
      </Link>
      <Button size="sm" className="rounded-full">
        <UserPlus className="w-4 h-4 mr-2" /> Add
      </Button>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Explore & Connect</h1>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Find wanderers by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg rounded-full"
        />
      </div>

      {/* Results / Suggestions */}
      <div className="space-y-6">
        {searchResults.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-3">
              {searchResults.map(user => <UserCard key={user._id} user={user} />)}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">People you may know</h2>
            {loadingSuggestions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map(user => <UserCard key={user._id} user={user} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;