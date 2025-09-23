import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchUserProfile,
  sendFriendRequest,
  handleFriendRequest,
  unfriend,
  clearProfile,
  fetchFriends,
} from "../features/users/userSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import {
  Edit,
  MessageCircle,
  UserPlus,
  Check,
  X,
  Clock,
  UserMinus,
} from "lucide-react";

import FriendCard from "../components/user/FriendCard";

const ProfilePage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, status, error, friends, friendsStatus } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (username) {
      dispatch(fetchUserProfile(username));
    }
    return () => {
      dispatch(clearProfile());
    };
  }, [username, dispatch]);

  // --- Các hàm xử lý hành động ---

  const handleSendRequest = () => {
    if (!profile) return;
    dispatch(
      sendFriendRequest({ userId: profile._id, username: profile.username })
    );
  };

  const handleAcceptRequest = () => {
    if (!profile) return;
    dispatch(handleFriendRequest({ senderId: profile._id, action: "accept" }));
  };

  const handleDeclineRequest = () => {
    if (!profile) return;
    dispatch(handleFriendRequest({ senderId: profile._id, action: "decline" }));
  };

  const handleUnfriend = () => {
    if (!profile) return;
    if (
      window.confirm(
        `Are you sure you want to unfriend ${profile.username}? This action cannot be undone.`
      )
    ) {
      dispatch(unfriend(profile._id));
    }
  };

  const handleTabChange = (value) => {
    if (value === "friends" && friendsStatus === "idle" && profile) {
      dispatch(fetchFriends(profile._id));
    }
  };

  // TRẠNG THÁI LOADING
  if (status === "loading" || status === "idle") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  // TRẠNG THÁI LỖI
  if (status === "failed") {
    return <div className="text-center p-8 text-destructive">{error}</div>;
  }

  // TRẠNG THÁI KHÔNG TÌM THẤY USER (nhưng đã fetch xong)
  if (status === "succeeded" && !profile) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        User not found.
      </div>
    );
  }

  // --- Component con để render các nút bấm dựa trên trạng thái ---
  const ActionButtons = () => {
    if (!profile?.friendStatus) return null;

    switch (profile.friendStatus) {
      case "self":
        return (
          <Button className="rounded-full px-6 flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        );
      case "friends":
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="rounded-full px-6">
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnfriend}
              className="rounded-full px-6"
            >
              <UserMinus className="w-4 h-4 mr-2" /> Unfriend
            </Button>
          </div>
        );
      case "request_sent":
        return (
          <Button
            variant="outline"
            disabled
            className="rounded-full px-6 cursor-not-allowed"
          >
            <Clock className="w-4 h-4 mr-2" /> Request Sent
          </Button>
        );
      case "request_received":
        return (
          <div className="flex gap-3">
            <Button
              onClick={handleAcceptRequest}
              className="rounded-full px-6 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" /> Accept
            </Button>
            <Button
              onClick={handleDeclineRequest}
              variant="destructive"
              className="rounded-full px-6"
            >
              <X className="w-4 h-4 mr-2" /> Decline
            </Button>
          </div>
        );
      default: // 'not_friends'
        return (
          <Button onClick={handleSendRequest} className="rounded-full px-6">
            <UserPlus className="w-4 h-4 mr-2" /> Add Friend
          </Button>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 border-4 border-primary/30 mb-6">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback>
                {profile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              {profile.bio || "This wanderer has not shared their story yet."}
            </p>
            <div className="h-10">
              {" "}
              {/* Container để nút không bị nhảy layout */}
              <ActionButtons />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="friends"
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-card/50 rounded-2xl">
          <TabsTrigger value="friends">
            Friends ({profile.friends?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="lanterns">Lanterns</TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="mt-6">
          <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl">
            <CardHeader>
              <CardTitle>Friend List</CardTitle>
            </CardHeader>
            <CardContent>
              {friendsStatus === "loading" && <p>Loading friends...</p>}
              {friendsStatus === "succeeded" &&
                (profile.friends?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* SỬ DỤNG COMPONENT ĐÃ IMPORT */}
                    {friends.map((friend, index) => (
                      <FriendCard
                        key={friend._id}
                        friend={friend}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    No friends to display.
                  </p>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lanterns" className="mt-6">
          <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl">
            <CardContent className="p-8 text-center text-muted-foreground">
              <span className="text-3xl">🏮</span>
              <p className="mt-4">
                This user's lanterns are anonymous and float freely in the night
                sky.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ProfilePage;
