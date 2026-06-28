import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #020208 100%)' }}>
      <div className="glass rounded-2xl p-8 w-full max-w-sm text-center">
        {status === 'verifying' && <><span className="text-4xl">⏳</span><p className="text-white mt-4">Verifying…</p></>}
        {status === 'success' && (
          <>
            <span className="text-4xl">✅</span>
            <h2 className="text-xl font-bold text-white mt-4">Email verified!</h2>
            <p className="text-sm text-gray-400 mt-2">You can now sign in.</p>
            <Link to="/auth/login" className="block mt-6 px-6 py-2 bg-indigo-600 rounded-xl text-white text-sm font-semibold">Go to login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="text-4xl">❌</span>
            <h2 className="text-xl font-bold text-white mt-4">Verification failed</h2>
            <p className="text-sm text-gray-400 mt-2">The link may have expired.</p>
            <Link to="/auth/login" className="block mt-6 text-indigo-400 hover:text-indigo-300 text-sm">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
