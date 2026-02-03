import { useState } from 'react';
import { useAuth } from '../state/AuthContext.jsx';

export default function Register() {
  const { registerLover, registerRescuer } = useAuth();
  const [type, setType] = useState('animal_lover');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState({ name: '', serviceType: 'blue_cross', city: '', district: '', contactPhone: '', contactEmail: '' });
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    try {
      if (type === 'animal_lover') {
        await registerLover({ email, password });
        setMsg('Registered. You can now login.');
      } else {
        await registerRescuer({ email, password, organization: org });
        setMsg('Rescuer registered. Verification pending.');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input type="radio" checked={type === 'animal_lover'} onChange={() => setType('animal_lover')} /> <span className="ml-1">Animal Lover</span>
        </label>
        <label>
          <input type="radio" checked={type === 'rescuer'} onChange={() => setType('rescuer')} /> <span className="ml-1">Rescuer</span>
        </label>
      </div>
      {msg && <div className="text-green-700 mb-3">{msg}</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {type === 'rescuer' && (
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Organization Name" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
            <select className="border rounded px-3 py-2" value={org.serviceType} onChange={(e) => setOrg({ ...org, serviceType: e.target.value })}>
              <option value="veterinary">Veterinary</option>
              <option value="wildlife_center">Wildlife Center</option>
              <option value="blue_cross">Blue Cross</option>
              <option value="firefighter">Firefighter</option>
            </select>
            <input className="border rounded px-3 py-2" placeholder="City" value={org.city} onChange={(e) => setOrg({ ...org, city: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="District" value={org.district} onChange={(e) => setOrg({ ...org, district: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Contact Phone" value={org.contactPhone} onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Contact Email" value={org.contactEmail} onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })} />
          </div>
        )}
        <button className="w-full bg-blue-600 text-white rounded px-3 py-2">Register</button>
      </form>
    </div>
  );
}
