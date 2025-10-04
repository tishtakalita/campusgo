import React, { useEffect, useState } from "react";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { authAPI, directoryAPI } from "../services/api";

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
    // New signup fields
    roll_no: "",
    dept: "", // department code (e.g., AIE, CSE...)
    class: "",
    cgpa: "",
  });

  // Directory data for dropdowns
  const [departments, setDepartments] = useState<Array<{ code?: string; name?: string }>>([]);
  const [classOptions, setClassOptions] = useState<Array<{ id: string; class?: string; section?: string; academic_year?: string }>>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    // Load departments on mount
    directoryAPI.listDepartments().then(res => {
      const depts = (res.data?.departments || []) as any[];
      setDepartments(depts);
      // If only one department, preselect it
      if (depts.length === 1 && depts[0].code) {
        setFormData(prev => ({ ...prev, dept: depts[0].code }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Load classes whenever dept changes
    if (!formData.dept) { setClassOptions([]); setFormData(prev => ({...prev, class: ""})); return; }
    // Reset selected class on dept change
    setFormData(prev => ({...prev, class: ""}));
    setLoadingClasses(true);
    directoryAPI.listClasses(formData.dept).then(res => {
      setClassOptions(res.data?.classes || []);
    }).catch(() => {
      setClassOptions([]);
    }).finally(() => setLoadingClasses(false));
  }, [formData.dept]);

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
        // Prepare payload with proper types
        const payload: any = { ...formData };
        if (payload.cgpa !== "") {
          const cg = Number(payload.cgpa);
          if (!isNaN(cg)) payload.cgpa = cg;
          else delete payload.cgpa;
        } else {
          delete payload.cgpa;
        }
        if (!payload.class) delete payload.class;
        response = await authAPI.register(payload);
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

              {/* New signup fields per schema */}
              <div>
                <label htmlFor="roll_no" className="block text-gray-300 text-sm font-medium mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  id="roll_no"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., cb.sc.u4aie23201"
                />
              </div>

              <div>
                <label htmlFor="dept" className="block text-gray-300 text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  id="dept"
                  name="dept"
                  value={formData.dept}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d.code || ''}>{d.code || d.name || 'Department'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="class" className="block text-gray-300 text-sm font-medium mb-2">
                    Class (optional)
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {loadingClasses ? (
                      <option value="" disabled>Loading...</option>
                    ) : (
                      classOptions.map(c => {
                        const label = c.class ? c.class : `${(c.section || '').toUpperCase()}${c.academic_year ? ` • ${c.academic_year}` : ''}`;
                        return (
                          <option key={c.id} value={c.id}>{label}</option>
                        );
                      })
                    )}
                  </select>
                </div>
                <div>
                  <label htmlFor="cgpa" className="block text-gray-300 text-sm font-medium mb-2">
                    CGPA (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    id="cgpa"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 8.75"
                  />
                </div>
              </div>
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
