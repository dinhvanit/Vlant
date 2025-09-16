import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Bell,
  User,
  Plus,
  LogOut,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { logout } from "../features/auth/authSlice"; // Bạn sẽ cần action này
import { useDispatch } from "react-redux";
import Notifications from './Notifications';

const Sidebar = ({ userInfo, onOpenCreateModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Gọi action logout
    navigate("/"); // Điều hướng về trang landing
    window.location.reload(); // Tải lại trang để reset hoàn toàn state
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      path: "/messages",
    },
    { id: "explore", 
      label: "Explore", 
      icon: Search, 
      path: "/explore" 
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: `/profile/${userInfo?.username}`,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-card/95 backdrop-blur-md border-r border-border/50 fixed left-0 top-0 flex flex-col p-4">
      {/* App Logo */}
      <div className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center glow-effect">
            <span className="text-xl">🏮</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Vlant</h1>
        </div>
      </div>

      {/* Nút Tạo Lồng Đèn */}
      <div className="px-2 mb-4">
        <Button
          onClick={onOpenCreateModal}
          className="w-full h-12 rounded-2xl glow-effect flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Lantern
        </Button>
      </div>

      {/* Các liên kết điều hướng */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full justify-start gap-3 h-12 rounded-2xl flex items-center px-4 transition-all duration-200 text-lg
                ${
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-foreground hover:text-primary hover:bg-primary/10"
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Thông tin người dùng & Đăng xuất */}
      <div className="mt-auto p-2 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userInfo?.avatar} />
            <AvatarFallback>{userInfo?.username?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{userInfo?.username}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
