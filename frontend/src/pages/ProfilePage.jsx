import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Edit, MessageCircle, UserPlus, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams(); // Lấy username từ URL, vd: /profile/testuser
  const navigate = useNavigate();
  const { userInfo: currentUser } = useSelector((state) => state.auth);

  // State để lưu thông tin profile đang xem
  const [profileData, setProfileData] = useState(null);
  // State để quản lý chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  // State để xác định đây có phải là profile của chính mình không
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Dữ liệu giả cho danh sách bạn bè
  const friends = [
    { id: '1', username: 'Luna', avatar: 'https://i.pravatar.cc/150?u=luna' },
    { id: '2', username: 'Stargazer', avatar: 'https://i.pravatar.cc/150?u=stargazer' },
    { id: '3', username: 'Dreamer', avatar: 'https://i.pravatar.cc/150?u=dreamer' },
  ];

  // Giả lập việc fetch dữ liệu profile khi component được tải
  useEffect(() => {
    // Kiểm tra xem profile đang xem có phải của người dùng hiện tại không
    if (currentUser && currentUser.username === username) {
      setIsOwnProfile(true);
      setProfileData(currentUser);
    } else {
      setIsOwnProfile(false);
      // Trong thực tế, bạn sẽ gọi API để lấy thông tin của user có username này
      // Ví dụ: api.get(`/users/${username}`).then(res => setProfileData(res.data))
      // Tạm thời dùng dữ liệu giả cho người dùng khác
      setProfileData({
        username: username,
        bio: 'A wanderer exploring the digital cosmos. ✨',
        avatar: `https://i.pravatar.cc/150?u=${username}`,
      });
    }
  }, [username, currentUser]);

  const handleSave = () => {
    setIsEditing(false);
    // Trong thực tế, bạn sẽ dispatch action để cập nhật profile
    // Ví dụ: dispatch(updateUserProfile(profileData));
    console.log('Saving profile data:', profileData);
  };

  if (!profileData) {
    // Có thể thêm skeleton loader ở đây
    return <div>Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <Avatar className="w-32 h-32 border-4 border-primary/30">
                <AvatarImage src={profileData.avatar} alt={profileData.username} />
                <AvatarFallback>{profileData.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOwnProfile && isEditing && (
                <Button size="icon" className="absolute bottom-0 right-0 w-10 h-10 rounded-full">
                  <Camera className="w-5 h-5" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <Input
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="text-center text-2xl font-bold mb-4 bg-input-background max-w-sm"
              />
            ) : (
              <h1 className="text-2xl font-bold mb-4">{profileData.username}</h1>
            )}

            {isEditing ? (
              <Textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="text-center mb-6 bg-input-background max-w-md resize-none"
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">{profileData.bio}</p>
            )}

            <div className="flex gap-3">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <Button onClick={handleSave} className="rounded-full px-6">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-6">Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="rounded-full px-6 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </Button>
                )
              ) : (
                <>
                  <Button className="rounded-full px-6 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </Button>
                  <Button variant="secondary" className="rounded-full px-6 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 rounded-2xl">
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="lanterns">Lanterns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="mt-6">
          <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl">
            <CardHeader>
              <CardTitle>Friend List</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl hover:bg-accent cursor-pointer">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{friend.username}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lanterns" className="mt-6">
           <Card className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl">
             <CardContent className="p-8 text-center text-muted-foreground">
               <span className="text-3xl">🏮</span>
               <p className="mt-4">
                 {isOwnProfile ? "Your anonymous lanterns will appear here." : `${profileData.username}'s lanterns are anonymous.`}
               </p>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;