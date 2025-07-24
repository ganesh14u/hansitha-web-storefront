import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Addresses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Addresses</h1>

      {/* Placeholder if no addresses */}
      <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
        You haven't saved any addresses.
      </div>

      {/* Future: Replace with real address data */}
      {/* <div className="space-y-4">
        {addresses.map(address => (
          <div key={address.id} className="bg-white p-4 rounded-lg shadow">
            <p>{address.name}</p>
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zip}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Addresses;
