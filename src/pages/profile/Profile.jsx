import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../context/NotesContext";

import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Pencil,
  Save,
  X,
  FileText,
  Pin,
  Archive,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Activity,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  Camera,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "../../services/api";

const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem(
      "noteshub_profile"
    );

    return raw
      ? JSON.parse(raw)
      : {
          name: "Vivek Kumar",
          email: "vivek@example.com",
          role: "Student",
          bio: "Organizing ideas, notes and projects with NotesHub.",
        };
  } catch {
    return {
      name: "Vivek Kumar",
      email: "vivek@example.com",
      role: "Student",
      bio: "Organizing ideas, notes and projects with NotesHub.",
    };
  }
};

export default function Profile() {
  const { light } = useTheme();

  const {
    user,
    refreshUser,
  } = useAuth();

  const { notes } = useNotes();

  const avatarInputRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const SERVER_BASE_URL =
    API_BASE_URL.replace(
      /\/api\/?$/,
      ""
    );

  const [profile, setProfile] = useState(() => {
    const storedProfile =
      getStoredProfile();

    return {
      ...storedProfile,
      name:
        user?.name ||
        storedProfile.name,
      email:
        user?.email ||
        storedProfile.email,
      role:
        user?.role ||
        storedProfile.role,
      avatarUrl:
        user?.avatarUrl ||
        storedProfile.avatarUrl ||
        "",
    };
  });

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState(profile);

  const [showPassword, setShowPassword] =
    useState(false);

  const [passwordData, setPasswordData] =
    useState({
      current: "",
      newPassword: "",
      confirm: "",
    });

  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] = useState(false);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const avatarSrc = useMemo(() => {
    if (!profile.avatarUrl) {
      return "";
    }

    if (
      profile.avatarUrl.startsWith(
        "http://"
      ) ||
      profile.avatarUrl.startsWith(
        "https://"
      )
    ) {
      return profile.avatarUrl;
    }

    return `${SERVER_BASE_URL}${profile.avatarUrl}`;
  }, [
    profile.avatarUrl,
    SERVER_BASE_URL,
  ]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile((prev) => {
      const updatedProfile = {
        ...prev,
        name:
          user.name ||
          prev.name,
        email:
          user.email ||
          prev.email,
        role:
          user.role ||
          prev.role,
        avatarUrl:
          user.avatarUrl ??
          prev.avatarUrl ??
          "",
      };

      localStorage.setItem(
        "noteshub_profile",
        JSON.stringify(
          updatedProfile
        )
      );

      return updatedProfile;
    });

    setForm((prev) => ({
      ...prev,
      name:
        user.name ||
        prev.name,
      email:
        user.email ||
        prev.email,
      role:
        user.role ||
        prev.role,
      avatarUrl:
        user.avatarUrl ??
        prev.avatarUrl ??
        "",
    }));
  }, [user]);

  const stats = useMemo(() => {
    const active = notes.filter(
      (n) => n.status === "active"
    );

    const pinned = notes.filter(
      (n) =>
        n.status === "active" &&
        n.pinned === true
    );

    const archived = notes.filter(
      (n) => n.status === "archived"
    );

    const trash = notes.filter(
      (n) => n.status === "trash"
    );

    return {
      total: notes.length,
      active: active.length,
      pinned: pinned.length,
      archived: archived.length,
      trash: trash.length,
    };
  }, [notes]);

  const joinedDate =
    "September 2026";

  const initials = useMemo(() => {
    return (
      profile.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  }, [profile.name]);

  const handleEdit = () => {
    setForm(profile);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
  };

  const handleAvatarClick = () => {
    if (uploadingAvatar) {
      return;
    }

    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      toast.error(
        "Please select an image file"
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Profile photo must be smaller than 5 MB"
      );
      return;
    }

    try {
      setUploadingAvatar(true);

      const formData =
        new FormData();

      formData.append(
        "avatar",
        file
      );

      const response =
        await api.post(
          "/auth/avatar",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const uploadedAvatarUrl =
        response?.data
          ?.avatarUrl ||
        response?.data?.user
          ?.avatarUrl ||
        "";

      if (!uploadedAvatarUrl) {
        throw new Error(
          "Profile photo URL was not returned by server."
        );
      }

      const refreshResult =
        await refreshUser();

      const latestUser =
        refreshResult?.success
          ? refreshResult.user
          : null;

      const finalAvatarUrl =
        latestUser?.avatarUrl ||
        uploadedAvatarUrl;

      const updatedProfile = {
        ...profile,
        avatarUrl:
          finalAvatarUrl,
      };

      setProfile(
        updatedProfile
      );

      setForm((prev) => ({
        ...prev,
        avatarUrl:
          finalAvatarUrl,
      }));

      localStorage.setItem(
        "noteshub_profile",
        JSON.stringify(
          updatedProfile
        )
      );

      toast.success(
        "Profile photo updated successfully"
      );
    } catch (error) {
      console.error(
        "Failed to upload profile photo:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        error?.message ||
        "Unable to upload profile photo.";

      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(
        "Name is required"
      );
      return;
    }

    if (!form.email.trim()) {
      toast.error(
        "Email is required"
      );
      return;
    }

    const previousProfile =
      profile;

    const previousForm =
      form;

    try {
      setSavingProfile(true);

      const updatedProfile = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        role:
          form.role.trim() ||
          "Student",
        bio:
          form.bio.trim() ||
          "Organizing ideas, notes and projects with NotesHub.",
      };

      setProfile(
        updatedProfile
      );

      setForm(
        updatedProfile
      );

      localStorage.setItem(
        "noteshub_profile",
        JSON.stringify(
          updatedProfile
        )
      );

      setEditing(false);

      const response =
        await api.put(
          "/auth/profile",
          {
            name:
              updatedProfile.name,
            email:
              updatedProfile.email,
          }
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          response.data?.message ||
            "Unable to update profile."
        );
      }

      const refreshResult =
        await refreshUser();

      const latestUser =
        refreshResult?.success
          ? refreshResult.user
          : response?.data?.user ||
            null;

      const finalProfile = {
        ...updatedProfile,

        name:
          latestUser?.name ||
          response?.data?.user
            ?.name ||
          updatedProfile.name,

        email:
          latestUser?.email ||
          response?.data?.user
            ?.email ||
          updatedProfile.email,

        role:
          latestUser?.role ||
          response?.data?.user
            ?.role ||
          updatedProfile.role,

        avatarUrl:
          latestUser?.avatarUrl ??
          response?.data?.user
            ?.avatarUrl ??
          updatedProfile.avatarUrl ??
          "",
      };

      setProfile(
        finalProfile
      );

      setForm(
        finalProfile
      );

      localStorage.setItem(
        "noteshub_profile",
        JSON.stringify(
          finalProfile
        )
      );

      toast.success(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      setProfile(
        previousProfile
      );

      setForm(
        previousForm
      );

      localStorage.setItem(
        "noteshub_profile",
        JSON.stringify(
          previousProfile
        )
      );

      setEditing(true);

      const message =
        error?.response?.data
          ?.message ||
        error?.message ||
        "Unable to update profile.";

      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange =
    async () => {
      if (!passwordData.current) {
        toast.error(
          "Enter your current password"
        );
        return;
      }

      if (!passwordData.newPassword) {
        toast.error(
          "Enter a new password"
        );
        return;
      }

      if (
        passwordData.newPassword
          .length < 6
      ) {
        toast.error(
          "Password must contain at least 6 characters"
        );
        return;
      }

      if (
        passwordData.newPassword !==
        passwordData.confirm
      ) {
        toast.error(
          "Passwords do not match"
        );
        return;
      }

      if (
        passwordData.current ===
        passwordData.newPassword
      ) {
        toast.error(
          "New password must be different from current password"
        );
        return;
      }

      try {
        setChangingPassword(
          true
        );

        await api.put(
          "/auth/password",
          {
            currentPassword:
              passwordData.current,
            newPassword:
              passwordData.newPassword,
          }
        );

        setPasswordData({
          current: "",
          newPassword: "",
          confirm: "",
        });

        setShowPassword(false);

        toast.success(
          "Password updated successfully"
        );
      } catch (error) {
        console.error(
          "Failed to update password:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.message ||
          "Unable to update password.";

        toast.error(message);
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  return (
    <div
      className={`profile-page ${
        light
          ? "profile-light"
          : ""
      }`}
    >
      <div className="profile-glow profile-glow-one" />
      <div className="profile-glow profile-glow-two" />
      <div className="profile-grid-overlay" />

      <div className="profile-shell">
        {/* HEADER */}
        <header className="profile-header profile-reveal">
          <div>
            <div className="profile-kicker">
              <Sparkles size={15} />
              <span>
                ACCOUNT CENTER
              </span>
            </div>

            <h1>Profile</h1>

            <p>
              Manage your personal
              information, account
              details and security
              settings.
            </p>
          </div>

          <div className="profile-header-status">
            <span className="status-dot" />
            Account Active
          </div>
        </header>

        {/* PROFILE HERO */}
        <section className="profile-hero profile-reveal delay-1">
          <div className="hero-left">
            <div
              className={`profile-avatar-wrap ${
                uploadingAvatar
                  ? "avatar-uploading"
                  : ""
              }`}
              onClick={
                handleAvatarClick
              }
              title="Change profile photo"
            >
              <div className="profile-avatar">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={
                      profile.name
                    }
                    className="profile-avatar-image"
                  />
                ) : (
                  initials
                )}
              </div>

              <span className="avatar-online" />

              <div className="avatar-camera">
                <Camera size={14} />
              </div>

              <input
                ref={
                  avatarInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={
                  handleAvatarChange
                }
                style={{
                  display: "none",
                }}
              />
            </div>

            <div className="hero-info">
              <div className="hero-name-row">
                <h2>
                  {profile.name}
                </h2>

                <span className="verified-badge">
                  <CheckCircle2
                    size={14}
                  />
                  Verified
                </span>
              </div>

              <div className="hero-email">
                <Mail size={16} />
                {profile.email}
              </div>

              <div className="hero-meta">
                <span>
                  <User size={14} />
                  {profile.role}
                </span>

                <span>
                  <CalendarDays
                    size={14}
                  />
                  Joined{" "}
                  {joinedDate}
                </span>
              </div>
            </div>
          </div>

          <button
            className="edit-profile-btn"
            onClick={handleEdit}
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        </section>

        {/* STATS */}
        <section className="profile-stats profile-reveal delay-2">
          <StatCard
            icon={
              <FileText
                size={20}
              />
            }
            label="Total Notes"
            value={stats.total}
            light={light}
          />

          <StatCard
            icon={
              <Activity
                size={20}
              />
            }
            label="Active Notes"
            value={stats.active}
            light={light}
          />

          <StatCard
            icon={
              <Pin size={20} />
            }
            label="Pinned"
            value={stats.pinned}
            light={light}
          />

          <StatCard
            icon={
              <Archive
                size={20}
              />
            }
            label="Archived"
            value={stats.archived}
            light={light}
          />

          <StatCard
            icon={
              <Trash2
                size={20}
              />
            }
            label="Trash"
            value={stats.trash}
            light={light}
          />
        </section>

        {/* MAIN GRID */}
        <div className="profile-content-grid">
          {/* PERSONAL INFORMATION */}
          <section className="profile-panel profile-reveal delay-3">
            <div className="panel-heading">
              <div className="panel-heading-left">
                <div className="panel-icon">
                  <User size={19} />
                </div>

                <div>
                  <h3>
                    Personal
                    Information
                  </h3>

                  <p>
                    Your basic account
                    information
                  </p>
                </div>
              </div>

              {!editing && (
                <button
                  className="panel-edit-btn"
                  onClick={
                    handleEdit
                  }
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="edit-form">
                <InputField
                  label="Full Name"
                  icon={
                    <User
                      size={17}
                    />
                  }
                  value={form.name}
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        name: value,
                      })
                    )
                  }
                />

                <InputField
                  label="Email Address"
                  icon={
                    <Mail
                      size={17}
                    />
                  }
                  value={form.email}
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        email: value,
                      })
                    )
                  }
                  type="email"
                />

                <InputField
                  label="Role"
                  icon={
                    <ShieldCheck
                      size={17}
                    />
                  }
                  value={form.role}
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        role: value,
                      })
                    )
                  }
                />

                <div className="form-group">
                  <label>
                    Bio
                  </label>

                  <textarea
                    value={
                      form.bio
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          bio: e.target
                            .value,
                        })
                      )
                    }
                    rows={4}
                    placeholder="Tell something about yourself..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      savingProfile
                    }
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={
                      handleSave
                    }
                    disabled={
                      savingProfile
                    }
                  >
                    <Save size={16} />

                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-list">
                <InfoRow
                  icon={
                    <User
                      size={17}
                    />
                  }
                  label="Full Name"
                  value={
                    profile.name
                  }
                />

                <InfoRow
                  icon={
                    <Mail
                      size={17}
                    />
                  }
                  label="Email Address"
                  value={
                    profile.email
                  }
                />

                <InfoRow
                  icon={
                    <ShieldCheck
                      size={17}
                    />
                  }
                  label="Account Role"
                  value={
                    profile.role
                  }
                />

                <div className="bio-box">
                  <span>
                    Bio
                  </span>

                  <p>
                    {profile.bio}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ACCOUNT OVERVIEW */}
          <section className="profile-panel profile-reveal delay-4">
            <div className="panel-heading">
              <div className="panel-heading-left">
                <div className="panel-icon">
                  <Activity
                    size={19}
                  />
                </div>

                <div>
                  <h3>
                    Account
                    Overview
                  </h3>

                  <p>
                    Your NotesHub
                    activity
                  </p>
                </div>
              </div>
            </div>

            <div className="overview-content">
              <div className="overview-ring">
                <div className="ring-inner">
                  <strong>
                    {stats.total}
                  </strong>

                  <span>
                    Notes
                  </span>
                </div>
              </div>

              <div className="overview-details">
                <OverviewRow
                  label="Active Notes"
                  value={
                    stats.active
                  }
                  total={Math.max(
                    stats.total,
                    1
                  )}
                />

                <OverviewRow
                  label="Pinned Notes"
                  value={
                    stats.pinned
                  }
                  total={Math.max(
                    stats.total,
                    1
                  )}
                />

                <OverviewRow
                  label="Archived Notes"
                  value={
                    stats.archived
                  }
                  total={Math.max(
                    stats.total,
                    1
                  )}
                />

                <OverviewRow
                  label="Trash"
                  value={
                    stats.trash
                  }
                  total={Math.max(
                    stats.total,
                    1
                  )}
                />
              </div>
            </div>

            <div className="account-status-card">
              <div className="status-icon">
                <ShieldCheck
                  size={19}
                />
              </div>

              <div>
                <strong>
                  Account is secure
                </strong>

                <p>
                  Your profile is
                  currently active
                  and protected.
                </p>
              </div>

              <CheckCircle2
                size={20}
                className="status-check"
              />
            </div>
          </section>

          {/* SECURITY */}
          <section className="profile-panel security-panel profile-reveal delay-5">
            <div className="panel-heading">
              <div className="panel-heading-left">
                <div className="panel-icon">
                  <Lock size={19} />
                </div>

                <div>
                  <h3>
                    Security
                  </h3>

                  <p>
                    Keep your account
                    protected
                  </p>
                </div>
              </div>
            </div>

            <div className="security-card">
              <div className="security-title">
                <div className="security-symbol">
                  <KeyRound
                    size={19}
                  />
                </div>

                <div>
                  <strong>
                    Change Password
                  </strong>

                  <span>
                    Update your account
                    password
                  </span>
                </div>
              </div>

              <div className="password-field">
                <label>
                  Current Password
                </label>

                <div className="password-input">
                  <Lock size={16} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordData.current
                    }
                    onChange={(e) =>
                      setPasswordData(
                        (prev) => ({
                          ...prev,
                          current:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>
                  New Password
                </label>

                <div className="password-input">
                  <KeyRound
                    size={16}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordData.newPassword
                    }
                    onChange={(e) =>
                      setPasswordData(
                        (prev) => ({
                          ...prev,
                          newPassword:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="password-field">
                <label>
                  Confirm Password
                </label>

                <div className="password-input">
                  <KeyRound
                    size={16}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordData.confirm
                    }
                    onChange={(e) =>
                      setPasswordData(
                        (prev) => ({
                          ...prev,
                          confirm:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                className="update-password-btn"
                onClick={
                  handlePasswordChange
                }
                disabled={
                  changingPassword
                }
              >
                <Lock size={16} />

                {changingPassword
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </div>
          </section>

          {/* ABOUT */}
          <section className="profile-panel about-panel profile-reveal delay-6">
            <div className="about-decoration">
              <Sparkles size={30} />
            </div>

            <div className="about-content">
              <span className="about-label">
                NOTESHUB
              </span>

              <h3>
                Your personal
                workspace.
              </h3>

              <p>
                Keep your ideas,
                projects and important
                information organized
                in one clean workspace.
              </p>

              <div className="about-features">
                <span>
                  <CheckCircle2
                    size={15}
                  />
                  Organized
                </span>

                <span>
                  <CheckCircle2
                    size={15}
                  />
                  Secure
                </span>

                <span>
                  <CheckCircle2
                    size={15}
                  />
                  Productive
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .profile-page {
          --bg: #080b0d;
          --panel: rgba(15, 21, 25, .86);
          --panel2: #11191d;
          --border: rgba(255,255,255,.08);
          --border-hover: rgba(110,231,183,.24);
          --text: #f2f6f5;
          --muted: #8e9b98;
          --dim: #64716e;
          --accent: #6ee7b7;
          --accent2: #34d399;
          --danger: #fb7185;

          position: relative;
          min-height: calc(100vh - 68px);
          width: 100%;
          max-width: none;
          padding: clamp(18px, 2vw, 30px);
          overflow: hidden;
          color: var(--text);

          background:
            radial-gradient(
              circle at 12% 8%,
              rgba(16,185,129,.11),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(124,92,240,.11),
              transparent 30%
            ),
            var(--bg);

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          transition:
            background .25s ease,
            color .25s ease;
        }

        .profile-light {
          --bg: #eef4f1;
          --panel: rgba(255,255,255,.88);
          --panel2: #ffffff;
          --border: rgba(16,33,27,.09);
          --border-hover: rgba(5,150,105,.24);
          --text: #10211b;
          --muted: #64756f;
          --dim: #82918c;
          --accent: #059669;
          --accent2: #10b981;
        }

        .profile-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(70px);
          opacity: .15;
          animation: profileGlow 8s ease-in-out infinite;
        }

        .profile-glow-one {
          top: -180px;
          left: 8%;
          background: #10b981;
        }

        .profile-glow-two {
          right: -170px;
          bottom: -180px;
          background: #7c3aed;
          animation-delay: -4s;
        }

        .profile-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .035;

          background-image:
            linear-gradient(
              rgba(255,255,255,.5) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.5) 1px,
              transparent 1px
            );

          background-size: 42px 42px;

          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .profile-shell {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }

        .profile-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          width: 100%;
        }

        .profile-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .13em;
        }

        .profile-header h1 {
          margin: 0;
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.05;
          letter-spacing: -.04em;
        }

        .profile-header p {
          margin: 9px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .profile-header-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: rgba(255,255,255,.035);
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-dot,
        .avatar-online {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 12px rgba(52,211,153,.75);
        }

        .profile-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 22px;
          width: 100%;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.055),
              rgba(255,255,255,.018)
            ),
            var(--panel);

          backdrop-filter: blur(18px);
          box-shadow: 0 18px 55px rgba(0,0,0,.16);
          overflow: hidden;
          position: relative;
        }

        .profile-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              transparent 20%,
              rgba(110,231,183,.055),
              transparent 65%
            );

          transform: translateX(-100%);
          transition: transform .8s ease;
        }

        .profile-hero:hover::after {
          transform: translateX(100%);
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
        }

        .profile-avatar-wrap {
          position: relative;
          flex: 0 0 auto;
          cursor: pointer;
        }

        .profile-avatar-wrap.avatar-uploading {
          opacity: .65;
          pointer-events: none;
        }

        .profile-avatar {
          display: grid;
          place-items: center;
          width: 82px;
          height: 82px;
          border: 1px solid rgba(110,231,183,.32);
          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              rgba(52,211,153,.28),
              rgba(16,185,129,.08)
            );

          color: var(--accent);
          font-size: 25px;
          font-weight: 900;

          box-shadow:
            inset 0 0 30px rgba(52,211,153,.08),
            0 0 30px rgba(52,211,153,.07);

          transition: transform .3s ease;
          overflow: hidden;
        }

        .profile-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .profile-avatar-wrap:hover .profile-avatar {
          transform: translateY(-4px) rotate(-2deg);
        }

        .avatar-online {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 17px;
          height: 17px;
          border: 4px solid var(--panel2);
        }

        .avatar-camera {
          position: absolute;
          right: 5px;
          top: 5px;
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          background: rgba(5,10,8,.68);
          color: var(--accent);
          opacity: 0;
          transform: translateY(-3px);

          transition:
            opacity .2s ease,
            transform .2s ease;

          pointer-events: none;
        }

        .profile-avatar-wrap:hover .avatar-camera {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-info {
          min-width: 0;
        }

        .hero-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hero-name-row h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -.025em;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(52,211,153,.09);
          border: 1px solid rgba(52,211,153,.17);
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
        }

        .hero-email {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 7px;
          color: var(--muted);
          font-size: 13px;
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          color: var(--dim);
          font-size: 12px;
        }

        .hero-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .edit-profile-btn,
        .save-btn,
        .update-password-btn {
          border: 0;
          border-radius: 11px;

          background: linear-gradient(
            135deg,
            var(--accent2),
            var(--accent)
          );

          color: #05281c;
          font-weight: 800;
          cursor: pointer;

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .edit-profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          white-space: nowrap;
        }

        .edit-profile-btn:hover,
        .save-btn:hover,
        .update-password-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(52,211,153,.18);
        }

        .edit-profile-btn:disabled,
        .save-btn:disabled,
        .update-password-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin: 16px 0;
          width: 100%;
        }

        .stat-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--border);
          border-radius: 17px;
          background: var(--panel);
          backdrop-filter: blur(14px);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: 0 15px 35px rgba(0,0,0,.12);
        }

        .stat-icon {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          margin-bottom: 12px;
          border-radius: 11px;
          background: rgba(52,211,153,.09);
          color: var(--accent);
          transition: transform .25s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .stat-value {
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -.04em;
        }

        .stat-label {
          margin-top: 3px;
          color: var(--muted);
          font-size: 12px;
        }

        .profile-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
          gap: 16px;
          width: 100%;
        }

        .profile-panel {
          position: relative;
          min-width: 0;
          padding: 21px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--panel);
          backdrop-filter: blur(16px);
          overflow: hidden;
          width: 100%;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .profile-panel::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 1px;

          background: linear-gradient(
            90deg,
            transparent,
            rgba(110,231,183,.35),
            transparent
          );

          transform: translateX(-100%);
          transition: transform .7s ease;
        }

        .profile-panel:hover {
          border-color: var(--border-hover);
          box-shadow: 0 18px 45px rgba(0,0,0,.10);
        }

        .profile-panel:hover::before {
          transform: translateX(100%);
        }

        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding-bottom: 17px;
          border-bottom: 1px solid var(--border);
          width: 100%;
        }

        .panel-heading-left {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .panel-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex: 0 0 auto;
          border-radius: 11px;
          background: rgba(52,211,153,.09);
          color: var(--accent);
        }

        .panel-heading h3 {
          margin: 0;
          font-size: 15px;
        }

        .panel-heading p {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 11px;
        }

        .panel-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: transparent;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .panel-edit-btn:hover {
          color: var(--accent);
          border-color: var(--border-hover);
          background: rgba(52,211,153,.06);
        }

        .info-list {
          padding-top: 5px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 0;
          border-bottom: 1px solid var(--border);
        }

        .info-row-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          border-radius: 10px;
          background: rgba(255,255,255,.035);
          color: var(--accent);
        }

        .info-row-label {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 700;
        }

        .info-row-value {
          margin-top: 3px;
          color: var(--text);
          font-size: 13px;
          font-weight: 650;
          word-break: break-word;
        }

        .bio-box {
          padding: 15px 0 3px;
        }

        .bio-box > span {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 700;
        }

        .bio-box p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .overview-content {
          display: grid;
          grid-template-columns: 145px 1fr;
          align-items: center;
          gap: 22px;
          padding: 22px 0;
        }

        .overview-ring {
          display: grid;
          place-items: center;
          width: 135px;
          height: 135px;
          margin: 0 auto;
          border-radius: 50%;

          background:
            conic-gradient(
              var(--accent) 0deg,
              var(--accent2) 230deg,
              rgba(255,255,255,.07) 230deg,
              rgba(255,255,255,.07) 360deg
            );

          position: relative;
          animation: ringPulse 4s ease-in-out infinite;
        }

        .overview-ring::before {
          content: "";
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          background: var(--panel2);
        }

        .ring-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        .ring-inner strong {
          font-size: 29px;
          letter-spacing: -.05em;
        }

        .ring-inner span {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .overview-details {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .overview-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .overview-row-top span {
          color: var(--muted);
          font-size: 11px;
        }

        .overview-row-top strong {
          font-size: 11px;
        }

        .progress-track {
          width: 100%;
          height: 6px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,.055);
        }

        .progress-fill {
          height: 100%;
          min-width: 3px;
          border-radius: inherit;

          background: linear-gradient(
            90deg,
            var(--accent2),
            var(--accent)
          );

          transition: width .7s ease;
        }

        .account-status-card {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          border: 1px solid rgba(52,211,153,.14);
          border-radius: 13px;
          background: rgba(52,211,153,.045);
        }

        .status-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          flex: 0 0 auto;
          border-radius: 10px;
          background: rgba(52,211,153,.1);
          color: var(--accent);
        }

        .account-status-card strong {
          display: block;
          font-size: 12px;
        }

        .account-status-card p {
          margin: 3px 0 0;
          color: var(--muted);
          font-size: 10px;
        }

        .status-check {
          margin-left: auto;
          color: var(--accent);
        }

        .security-panel {
          min-height: 100%;
        }

        .security-card {
          padding-top: 18px;
        }

        .security-title {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
        }

        .security-symbol {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: rgba(124,92,240,.1);
          color: #a78bfa;
        }

        .security-title strong {
          display: block;
          font-size: 13px;
        }

        .security-title span {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
        }

        .password-field {
          margin-bottom: 12px;
        }

        .password-field label,
        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .07em;
        }

        .password-input {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          min-height: 43px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: rgba(255,255,255,.025);
          color: var(--dim);
          transition: .2s ease;
        }

        .password-input:focus-within {
          border-color: rgba(52,211,153,.35);
          box-shadow: 0 0 0 3px rgba(52,211,153,.055);
        }

        .password-input input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font-size: 12px;
        }

        .password-input input::placeholder {
          color: var(--dim);
        }

        .password-input button {
          display: grid;
          place-items: center;
          padding: 3px;
          border: 0;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
        }

        .password-input button:hover {
          color: var(--accent);
        }

        .update-password-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-height: 42px;
          margin-top: 5px;
          font-size: 12px;
        }

        .about-panel {
          display: flex;
          align-items: center;
          min-height: 240px;

          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(52,211,153,.12),
              transparent 35%
            ),
            var(--panel);
        }

        .about-decoration {
          position: absolute;
          right: 25px;
          top: 25px;
          color: rgba(110,231,183,.18);
          animation: decorationFloat 4s ease-in-out infinite;
        }

        .about-content {
          max-width: 440px;
        }

        .about-label {
          color: var(--accent);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .14em;
        }

        .about-content h3 {
          margin: 8px 0;
          font-size: 23px;
          letter-spacing: -.035em;
        }

        .about-content p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .about-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .about-features span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 9px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: rgba(255,255,255,.025);
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
        }

        .about-features svg {
          color: var(--accent);
        }

        .edit-form {
          padding-top: 17px;
        }

        .form-group {
          margin-bottom: 13px;
        }

        .form-group textarea,
        .form-input {
          width: 100%;
          border: 1px solid var(--border);
          outline: 0;
          border-radius: 11px;
          background: rgba(255,255,255,.025);
          color: var(--text);
          font-family: inherit;
          font-size: 12px;
          transition: .2s ease;
        }

        .form-input {
          height: 43px;
          padding: 0 12px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
          padding: 12px;
        }

        .form-input:focus,
        .form-group textarea:focus {
          border-color: rgba(52,211,153,.35);
          box-shadow: 0 0 0 3px rgba(52,211,153,.055);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 17px;
        }

        .cancel-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 13px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-btn:hover {
          color: var(--text);
          border-color: var(--border-hover);
        }

        .cancel-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 14px;
          font-size: 11px;
        }

        .profile-reveal {
          animation: profileReveal .6s cubic-bezier(.2,.8,.2,1) both;
        }

        .delay-1 {
          animation-delay: .06s;
        }

        .delay-2 {
          animation-delay: .12s;
        }

        .delay-3 {
          animation-delay: .18s;
        }

        .delay-4 {
          animation-delay: .24s;
        }

        .delay-5 {
          animation-delay: .30s;
        }

        .delay-6 {
          animation-delay: .36s;
        }

        @keyframes profileReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes profileGlow {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(18px,12px,0) scale(1.06);
          }
        }

        @keyframes ringPulse {
          0%,100% {
            filter: drop-shadow(0 0 0 rgba(52,211,153,0));
          }

          50% {
            filter: drop-shadow(0 0 16px rgba(52,211,153,.12));
          }
        }

        @keyframes decorationFloat {
          0%,100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-7px) rotate(5deg);
          }
        }

        @media (max-width: 1200px) {
          .profile-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .profile-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 850px) {
          .profile-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .edit-profile-btn {
            width: 100%;
            justify-content: center;
          }

          .profile-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .profile-page {
            padding: 16px 12px 24px;
          }

          .profile-header h1 {
            font-size: 28px;
          }

          .profile-hero {
            padding: 18px;
          }

          .hero-left {
            align-items: flex-start;
          }

          .profile-avatar {
            width: 65px;
            height: 65px;
            border-radius: 18px;
            font-size: 20px;
          }

          .hero-name-row h2 {
            font-size: 20px;
          }

          .hero-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .profile-stats {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-value {
            font-size: 22px;
          }

          .profile-panel {
            padding: 17px;
            border-radius: 17px;
          }

          .overview-content {
            grid-template-columns: 1fr;
          }

          .overview-ring {
            width: 120px;
            height: 120px;
          }

          .about-panel {
            min-height: 210px;
          }
        }

        @media (max-width: 420px) {
          .profile-stats {
            grid-template-columns: 1fr;
          }

          .hero-left {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-page *,
          .profile-page *::before,
          .profile-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="info-row">
      <div className="info-row-icon">
        {icon}
      </div>

      <div>
        <div className="info-row-label">
          {label}
        </div>

        <div className="info-row-value">
          {value}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  icon,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="form-group">
      <label>
        {label}
      </label>

      <div className="password-input">
        {icon}

        <input
          className="form-input"
          type={type}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function OverviewRow({
  label,
  value,
  total,
}) {
  const percentage =
    Math.min(
      100,
      Math.round(
        (value / total) * 100
      )
    );

  return (
    <div>
      <div className="overview-row-top">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}