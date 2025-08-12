import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const RegisterForm = ({ onSwitch }) => {
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
        <p className="text-muted-foreground text-center text-sm mt-4">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="font-semibold text-primary hover:underline">
                Sign Up
            </button>
        </p>
    </div>
  );
};

export default RegisterForm;