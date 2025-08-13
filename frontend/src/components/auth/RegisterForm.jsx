import React, { useState } from 'react';
import { Eye, EyeOff, User } from 'lucide-react'; // Thêm icon User
import api from '../../api/axios'; // Import axios instance để gọi API

const RegisterForm = ({ onSwitch }) => {
  // Sử dụng state riêng cho form đăng ký
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    // Kiểm tra mật khẩu có đủ dài không (có thể thêm các validation khác)
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
      // Gọi trực tiếp API đăng ký
      await api.post('/auth/register', formData);
      
      // Thông báo thành công và chuyển sang form đăng nhập
      alert('Account created successfully! Please log in to continue.');
      onSwitch(); // Gọi hàm onSwitch để chuyển tab

    } catch (err) {
      // Hiển thị lỗi từ server
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
        <p className="text-muted-foreground mt-1">Join Vlant to share your story</p>
      </div>
      {error && (
        <p className="bg-destructive/20 text-destructive p-3 rounded-lg text-center text-sm mb-4">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* THÊM TRƯỜNG USERNAME */}
        <div className="space-y-2">
          <label htmlFor="username_register">Username</label>
          <div className="relative">
             <input
                id="username_register"
                name="username"
                type="text"
                required
                className="w-full h-11 px-4 pl-10 bg-input-background border border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Choose a username"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email_register">Email</label>
          <input
            id="email_register"
            name="email"
            type="email"
            required
            className="w-full h-11 px-4 bg-input-background border border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password_register">Password</label>
          <div className="relative">
            <input
              id="password_register"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full h-11 px-4 pr-12 bg-input-background border border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-muted-foreground text-center text-sm mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="font-semibold text-primary hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;