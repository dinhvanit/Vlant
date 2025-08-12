import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const LoginForm = ({ onSwitch, onGuestClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        // Đăng nhập thành công, không cần làm gì ở đây vì HomePage sẽ tự cập nhật
      })
      .catch((err) => console.error("Login failed:", err));
  };

  return (
    <div className="p-2">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">Log in to continue to Vlant</p>
        </div>
        {error && <p className="bg-destructive/20 text-destructive p-3 rounded-lg text-center text-sm mb-4">{error}</p>}

        {/* Social Logins */}
      <div className="space-y-3 mb-6">
        <button className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[#4285F4] text-white font-semibold hover:bg-[#357ae8] transition-colors">
          <FcGoogle size={20} /> Continue with Google
        </button>
        <button className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#166fe5] transition-colors">
          <FaFacebook size={20} /> Continue with Facebook
        </button>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-4 my-6">
        <hr className="w-full border-border" />
        <span className="text-muted-foreground text-xs">OR</span>
        <hr className="w-full border-border" />
      </div>

      
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Các input field cho email, password - giống hệt code LoginPage trước đó */}
            <div className="space-y-2">
              <label htmlFor="email_login">Email</label>
              <input id="email_login" name="email" type="email" required className="w-full h-11 px-4 bg-input-background border border-border/50 rounded-xl ..."/>
            </div>
            <div className="space-y-2">
              <label htmlFor="password_login">Password</label>
              <div className="relative">
                <input id="password_login" name="password" type={showPassword ? "text" : "password"} required className="w-full h-11 px-4 pr-12 bg-input-background ..."/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 ...">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary ...">
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
        <div className="text-center text-sm mt-6 space-y-2">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="font-semibold text-primary hover:underline">
            Sign Up
          </button>
        </p>
        <p className="text-muted-foreground">
          Or{' '}
          <button onClick={onGuestClick} className="font-semibold text-primary hover:underline">
            Continue as a Guest
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;