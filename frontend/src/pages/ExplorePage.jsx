import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Search } from "lucide-react";
import api from "../api/axios";
import { fetchFriendRequests } from "../features/users/userSlice";

import UserCard from "../components/user/UserCard";
import FriendRequestCard from "../components/user/FriendRequestCard";

const ExplorePage = () => {
  const dispatch = useDispatch();

  // State của trang
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Lấy danh sách friend requests từ Redux
  const { requests, requestsStatus } = useSelector((state) => state.user);

  // Fetch friend requests và suggestions khi component mount
  useEffect(() => {
    dispatch(fetchFriendRequests());

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await api.get("/users/suggestions/all");
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [dispatch]);

  // useEffect cho chức năng tìm kiếm (debounce)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        const fetchSearchResults = async () => {
          setIsSearching(true);
          try {
            const { data } = await api.get(
              `/users/search/users?q=${searchQuery}`
            );
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
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Explore & Connect</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find wanderers by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg rounded-full"
          />
        </div>
      </div>

      {/* Khu vực Friend Requests */}
      {requestsStatus === "succeeded" && requests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {requests.map((req) => (
                <FriendRequestCard key={req._id} request={req} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Kết quả tìm kiếm hoặc Gợi ý */}
      <div>
        {searchQuery.trim() ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-3">
              {isSearching ? (
                <Skeleton className="h-20 w-full rounded-2xl" />
              ) : (
                searchResults.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))
              )}
              {!isSearching && searchResults.length === 0 && (
                <p className="text-muted-foreground">No users found.</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">People You May Know</h2>
            {loadingSuggestions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
