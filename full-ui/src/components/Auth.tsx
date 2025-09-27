import React, { useState } from "react";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../services/api";

interface AuthProps {
  onLogin: (user: any) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student" as "student" | "faculty" | "admin",
    student_id: "",
    department_id: "11111111-1111-1111-1111-111111111001", // Valid AIE department ID
    year_of_study: "4"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register(formData);
      }

      if (response.error) {
        setError(response.error);
      } else if (response.data?.user) {
        onLogin(response.data.user);
      } else {
        setError("Authentication failed - no user data received");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Network error - please check if backend is running");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CampusGo</h1>
          <p className="text-gray-400">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="role" className="block text-gray-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-gray-300 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-gray-300 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {formData.role === "student" && (
                <>
                  <div>
                    <label htmlFor="student_id" className="block text-gray-300 text-sm font-medium mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      required={formData.role === "student"}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., cb.sc.u4aie23201"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="year_of_study" className="block text-gray-300 text-sm font-medium mb-2">
                      Year of Study
                    </label>
                    <select
                      id="year_of_study"
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleInputChange}
                      required={formData.role === "student"}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? "Sign In" : "Create Account"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-blue-400 font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
