import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './auth.css';
import './profile.css';

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showReset, setShowReset] = useState(false);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    api.get('/api/profiles/')
      .then(res => {
        const data = res.data;
        let prof = null;

        if (Array.isArray(data)) {
          prof = data.length > 0 ? data[0] : null;
        } else if (data && typeof data === 'object') {
          prof = data;
        }

        if (!prof) {
          setError('No profile found.');
        } else {
          setProfile(prof);
          setFirstName(prof.first_name || '');
          setLastName(prof.last_name || '');
          setBio(prof.bio || '');
        }
      })
      .catch(() => setError('Failed to load profile. Please log in again.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── handlers ────────────────────────────────────────────
  const startReset = () => {
    setPwd1('');
    setPwd2('');
    setResetMsg('');
    setShowReset(true);
  };

  const handleReset = async e => {
    e.preventDefault();
    if (pwd1 !== pwd2) {
      setResetMsg('Passwords do not match.');
      return;
    }
    try {
      await api.post('/api/auth/password/change/', { new_password: pwd1 });
      setResetMsg('Password updated successfully.');
      setShowReset(false);
    } catch {
      setResetMsg('Something went wrong. Please try again.');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditMsg('');
  };

  const handleEditSave = async e => {
    e.preventDefault();
    setEditMsg('');

    if (!profile?.id) {
      console.error('Missing profile ID', profile);
      setEditMsg('Cannot update profile: missing ID.');
      return;
    }

    try {
      await api.patch(`/api/profiles/${profile.id}/`, {
        user: {
          first_name: firstName,
          last_name: lastName,
        },
        bio,
      });
      setProfile({
        ...profile,
        first_name: firstName,
        last_name: lastName,
        bio,
      });
      setEditMode(false);
      setEditMsg('Profile updated!');
    } catch (err) {
      console.error(err.response?.data);
      setEditMsg(err.response?.data.detail || 'Failed to update profile.');
    }
  };

  // ── derived values & placeholders ───────────────────────
  const username = profile?.username || localStorage.getItem('username') || 'Not set';
  const email    = profile?.email    || localStorage.getItem('email')    || 'Not set';
  const pic      = profile?.profile_picture || '';
  const fullName = (profile?.first_name || firstName || '') || (profile?.last_name || lastName || '')
    ? `${profile?.first_name || firstName || ''} ${profile?.last_name || lastName || ''}`.trim()
    : 'Not set';

  if (loading) return <div className="auth-container"><p>Loading profile…</p></div>;
  if (error)   return <div className="auth-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="auth-container">
      <div className="profile-card">
        <h2>My Profile</h2>

        {pic
          ? <img className="profile-img" src={pic} alt="avatar" />
          : <div className="avatar-fallback">
              {username.charAt(0).toUpperCase()}
            </div>
        }

        <dl className="profile-fields">
          <dt>Username</dt><dd>{username}</dd>
          <dt>Name</dt>    <dd>{fullName}</dd>
          <dt>Email</dt>   <dd>{email}</dd>
          <dt>Bio</dt>     <dd>{profile.bio || 'Not set'}</dd>
        </dl>

        {!editMode ? (
          <button className="btn-primary" onClick={handleEdit}>
            Edit Profile
          </button>
        ) : (
          <form onSubmit={handleEditSave} className="reset-form">
            <label>
              First Name
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </label>
            <label>
              Bio
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself"
              />
            </label>
            {editMsg && <p className="reset-msg">{editMsg}</p>}
            <div className="reset-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showReset
          ? <button className="btn-primary" onClick={startReset} style={{ marginTop: '0.5rem' }}>
              Reset Password
            </button>
          : (
            <form onSubmit={handleReset} className="reset-form">
              <label>
                New password
                <input
                  type="password"
                  value={pwd1}
                  onChange={e => setPwd1(e.target.value)}
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={pwd2}
                  onChange={e => setPwd2(e.target.value)}
                  required
                />
              </label>
              {resetMsg && <p className="reset-msg">{resetMsg}</p>}
              <div className="reset-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowReset(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )
        }
      </div>
    </div>
  );
}
