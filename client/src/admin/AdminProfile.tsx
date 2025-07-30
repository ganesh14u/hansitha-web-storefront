import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext"; // ✅ Import Auth
import { toastWithVoice } from "@/utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

interface Admin {
  name: string;
  email: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAdmins, setShowAdmins] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem("voice-enabled");
    return saved === "false" ? false : true;
  });

  useEffect(() => {
    localStorage.setItem("voice-enabled", String(voiceEnabled));
  }, [voiceEnabled]);

  const handleSwitchToUserView = () => navigate("/account");

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.patch(
        `${API_URL}/api/users/update-role`,
        { email, role: newRole },
        { withCredentials: true }
      );
      setMessage(`✅ ${res.data.message}`);
    } catch (error: any) {
      setMessage(
        `❌ ${error.response?.data?.message || "Error updating role"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/admins`, {
        withCredentials: true,
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-4">
      <h2 className="text-xl font-semibold mb-4">Admin Profile</h2>

      {user ? (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleSwitchToUserView}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to User View
            </button>
          </div>

          {user.role === "superadmin" && (
            <>
              {/* Change Role Form */}
              <form onSubmit={handleRoleChange} className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Change User Role</h3>
                <input
                  type="email"
                  required
                  placeholder="User Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {loading ? "Updating..." : "Update Role"}
                </button>
                {message && <p className="text-sm mt-2">{message}</p>}
              </form>

              {/* Voice Toggle and Toast Test */}
              
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold">Voice Toggle and Toast Test</h3>
                <button
                  onClick={() => setVoiceEnabled((prev) => !prev)}
                  className="p-2 px-4 bg-blue-500 text-white rounded"
                >
                  {voiceEnabled ? "Voice: ON 🔊" : "Voice: OFF 🔇"}
                </button>

                <button
                  onClick={() =>
                    toastWithVoice.success("Testing Notification Sound.", voiceEnabled)
                  }
                  className="p-2 px-4 bg-green-500 text-white rounded"
                >
                  Trigger Notification
                </button>
              </div>

              {/* Admin List */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Admins List</h3>
                <button
                  onClick={() => {
                    if (!admins.length) fetchAdmins();
                    setShowAdmins((prev) => !prev);
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {showAdmins ? <FiMinus /> : <FiPlus />}
                  <span>
                    {showAdmins ? "Hide Admin List" : "Show Admin List"}
                  </span>
                </button>

                {showAdmins && (
                  <ul className="mt-3 space-y-2">
                    {admins.map((admin) => (
                      <li key={admin.email} className="border p-2 rounded">
                        <span className="font-medium">{admin.name}</span> <br />
                        <span className="text-sm text-gray-600">
                          {admin.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default AdminProfile;
