import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     RESTORE SESSION
  ===================================================== */

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const response = await api.get("/auth/me");

      if (
        response.data?.success === true &&
        response.data?.user
      ) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const login = async ({
    email,
    password,
    remember = true,
  }) => {
    try {
      const cleanEmail = String(email || "")
        .trim()
        .toLowerCase();

      const cleanPassword = String(
        password || ""
      );

      if (!cleanEmail || !cleanPassword) {
        return {
          success: false,
          message:
            "Email and password are required.",
        };
      }

      const response = await api.post(
        "/auth/login",
        {
          email: cleanEmail,
          password: cleanPassword,
          remember,
        }
      );

      if (
        response.data?.success !== true ||
        !response.data?.user
      ) {
        return {
          success: false,
          message:
            response.data?.message ||
            "Invalid email or password.",
        };
      }

      const loggedInUser =
        response.data.user;

      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to login. Please check your email and password.",
      };
    }
  };

  /* =====================================================
     SIGNUP
  ===================================================== */

  const signup = async ({
    name,
    email,
    password,
  }) => {
    try {
      const cleanName = String(
        name || ""
      ).trim();

      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const cleanPassword = String(
        password || ""
      );

      if (
        !cleanName ||
        !cleanEmail ||
        !cleanPassword
      ) {
        return {
          success: false,
          message:
            "Name, email and password are required.",
        };
      }

      const response = await api.post(
        "/auth/signup",
        {
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
        }
      );

      if (
        response.data?.success !== true ||
        !response.data?.user
      ) {
        return {
          success: false,
          message:
            response.data?.message ||
            "Unable to create account.",
        };
      }

      const createdUser =
        response.data.user;

      setUser(createdUser);

      return {
        success: true,
        user: createdUser,
      };
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to create account. Please try again.",
      };
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setUser(null);
    }
  };

  /* =====================================================
     REFRESH USER
  ===================================================== */

  const refreshUser = async () => {
    try {
      const response =
        await api.get("/auth/me");

      if (
        response.data?.success === true &&
        response.data?.user
      ) {
        const latestUser =
          response.data.user;

        setUser(latestUser);

        return latestUser;
      }

      setUser(null);

      return null;
    } catch (error) {
      console.error(
        "Failed to refresh user:",
        error
      );

      setUser(null);

      return null;
    }
  };

  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  const verifyResetEmail = async (
    email
  ) => {
    try {
      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      if (!cleanEmail) {
        return {
          success: false,
          message:
            "Email is required.",
        };
      }

      const response =
        await api.post(
          "/auth/forgot-password",
          {
            email: cleanEmail,
          }
        );

      console.log(
        "Forgot password response:",
        response.data
      );

      if (
        response.data?.success !== true
      ) {
        return {
          success: false,
          message:
            response.data?.message ||
            "Unable to send password reset email.",
        };
      }

      return {
        success: true,
        message:
          response.data?.message ||
          "Password reset instructions have been sent to your email.",
        email: cleanEmail,
      };
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to process password reset request.",
      };
    }
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const resetPassword = async ({
    token,
    newPassword,
    confirmPassword,
  }) => {
    try {
      if (!token) {
        return {
          success: false,
          message:
            "Invalid or missing reset token.",
        };
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        return {
          success: false,
          message:
            "Please enter both password fields.",
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          message:
            "Password must contain at least 8 characters.",
        };
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return {
          success: false,
          message:
            "Passwords do not match.",
        };
      }

      const response =
        await api.post(
          `/auth/reset-password/${encodeURIComponent(
            token
          )}`,
          {
            password: newPassword,
          }
        );

      console.log(
        "Reset password response:",
        response.data
      );

      if (
        response.data?.success !== true
      ) {
        return {
          success: false,
          message:
            response.data?.message ||
            "Unable to reset password.",
        };
      }

      return {
        success: true,
        message:
          response.data?.message ||
          "Password reset successfully.",
      };
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to reset password. Please try again.",
      };
    }
  };

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),

    login,
    signup,
    logout,

    verifyResetEmail,
    resetPassword,

    refreshUser,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}