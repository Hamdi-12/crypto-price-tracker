import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth, googleProvider } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function App() {
  const [user, loading, error] = useAuthState(auth);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Crypto data states
  const [coins, setCoins] = useState([]);
  const [allCoinsChartData, setAllCoinsChartData] = useState(null);
  const [loadingCoins, setLoadingCoins] = useState(false);

  // ===== Auth Handlers =====
  const handleSignUp = async () => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  // ===== Fetch top 50 coins =====
  const fetchCoinsData = useCallback(async () => {
    try {
      setLoadingCoins(true);
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      );
      const data = await res.json();
      setCoins(data);
      setLoadingCoins(false);
    } catch (err) {
      console.error(err);
      setLoadingCoins(false);
    }
  }, []);

  // ===== Fetch all coins price data for last 1 day =====
  const fetchAllCoinsChartData = useCallback(async () => {
    try {
      if (coins.length === 0) return;

      const promises = coins.map(async (coin) => {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=1&interval=hourly`
        );
        const data = await res.json();
        return {
          id: coin.id,
          name: coin.name,
          prices: data.prices, // [timestamp, price]
        };
      });
      const coinsPrices = await Promise.all(promises);

      if (coinsPrices.length === 0) return;

      // Use timestamps of first coin as labels
      const labels = coinsPrices[0].prices.map((p) =>
        new Date(p[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      // Create datasets for each coin
      const datasets = coinsPrices.map(({ id, name, prices }) => ({
        label: name,
        data: prices.map((p) => p[1]),
        fill: false,
        borderColor: getRandomColor(id),
        tension: 0.3,
        pointRadius: 0,
      }));

      setAllCoinsChartData({ labels, datasets });
    } catch (err) {
      console.error('Error fetching all coins chart data:', err);
    }
  }, [coins]);

  // Fetch coins when user signs in
  useEffect(() => {
    if (user) {
      fetchCoinsData();
    } else {
      setCoins([]);
      setAllCoinsChartData(null);
    }
  }, [user, fetchCoinsData]);

  // Fetch combined chart data when coins load
  useEffect(() => {
    fetchAllCoinsChartData();
  }, [coins, fetchAllCoinsChartData]);

  // Generate consistent color by coin id
  function getRandomColor(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  // Suggest Buy/Sell/Hold based on 24h % change (threshold ±3%)
  const coinSuggestions = useMemo(() => {
    return coins.map((coin) => {
      if (coin.price_change_percentage_24h == null) return { id: coin.id, suggestion: 'Hold' };
      if (coin.price_change_percentage_24h <= -3) return { id: coin.id, suggestion: 'Buy' };
      if (coin.price_change_percentage_24h >= 3) return { id: coin.id, suggestion: 'Sell' };
      return { id: coin.id, suggestion: 'Hold' };
    });
  }, [coins]);

  if (loading) return <div>Loading auth...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!user) {
    // Sign in/up form
    return (
      <div
        style={{
          maxWidth: 400,
          margin: 'auto',
          padding: 20,
          fontFamily: 'Segoe UI',
          backgroundColor: darkMode ? '#222' : '#fff',
          color: darkMode ? '#eee' : '#222',
          borderRadius: 8,
          boxShadow: darkMode
            ? '0 0 15px rgba(255,255,255,0.1)'
            : '0 0 15px rgba(0,0,0,0.1)',
        }}
      >
        <h2>Sign In to Crypto Price Tracker</h2>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            marginBottom: 10,
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#eee' : '#222',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            marginBottom: 10,
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#eee' : '#222',
          }}
        />
        <button
          onClick={isSigningUp ? handleSignUp : handleSignIn}
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginBottom: 10,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#388e3c')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
        >
          {isSigningUp ? 'Sign Up' : 'Sign In'}
        </button>
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#db4437',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginBottom: 10,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#388e3c')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#db4437')}
        >
          Sign In with Google
        </button>
        <p
          onClick={() => {
            setIsSigningUp(!isSigningUp);
            setAuthError(null);
          }}
          style={{ cursor: 'pointer', color: '#1976d2', textAlign: 'center' }}
        >
          {isSigningUp ? 'Have an account? Sign In' : 'No account? Sign Up'}
        </p>
        <button
          onClick={() => setDarkMode((d) => !d)}
          style={{
            marginTop: 10,
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 'bold',
            backgroundColor: darkMode ? '#333' : '#ddd',
            color: darkMode ? '#eee' : '#222',
            cursor: 'pointer',
            userSelect: 'none',
            width: '100%',
          }}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    );
  }

  // Logged in view
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: 'auto',
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        color: darkMode ? '#e0e0e0' : '#121212',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, userSelect: 'none' }}>
          Crypto Price Tracker
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 'bold',
              backgroundColor: darkMode ? '#333' : '#ddd',
              color: darkMode ? '#eee' : '#222',
              transition: 'background-color 0.3s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#388e3c')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = darkMode ? '#333' : '#ddd')}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <span style={{ fontWeight: 'bold', userSelect: 'none' }}>
            Hi {user.email.split('@')[0]}
          </span>

          <button
            onClick={handleSignOut}
            style={{
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#f44336',
              color: '#fff',
              fontWeight: 'bold',
              userSelect: 'none',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#c53030')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#f44336')}
          >
            Sign Out
          </button>
        </div>
      </header>

      <section>
        <h2>Top 50 Coins</h2>
        {loadingCoins ? (
          <p>Loading coins...</p>
        ) : (
          <div
            style={{
              maxHeight: 400,
              overflowY: 'scroll',
              borderRadius: 10,
              backgroundColor: darkMode ? '#222' : '#fff',
              boxShadow: darkMode
                ? '0 0 10px rgba(255,255,255,0.05)'
                : '0 0 10px rgba(0,0,0,0.1)',
              padding: 10,
            }}
          >
            {coins.map((coin) => {
              const suggestion = coinSuggestions.find((c) => c.id === coin.id)?.suggestion || 'Hold';
              return (
                <div
                  key={coin.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderBottom: darkMode ? '1px solid #444' : '1px solid #eee',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      style={{ width: 30, height: 30 }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{coin.name}</div>
                      <div style={{ fontSize: 12, color: darkMode ? '#bbb' : '#555' }}>
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 150, textAlign: 'right' }}>
                    <div>Price: ${coin.current_price.toLocaleString()}</div>
                    <div
                      style={{
                        color:
                          coin.price_change_percentage_24h > 0
                            ? '#4caf50'
                            : coin.price_change_percentage_24h < 0
                            ? '#f44336'
                            : darkMode
                            ? '#bbb'
                            : '#555',
                        fontWeight: 'bold',
                      }}
                    >
                      24h: {coin.price_change_percentage_24h?.toFixed(2)}%
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        padding: '2px 6px',
                        borderRadius: 5,
                        backgroundColor:
                          suggestion === 'Buy'
                            ? '#4caf50'
                            : suggestion === 'Sell'
                            ? '#f44336'
                            : darkMode
                            ? '#555'
                            : '#ddd',
                        color: darkMode ? '#eee' : '#222',
                        fontWeight: 'bold',
                        display: 'inline-block',
                      }}
                    >
                      {suggestion}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Price Chart (Last 24 Hours)</h2>
        {allCoinsChartData ? (
          <Line
            data={allCoinsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              height: 400,
              interaction: {
                mode: 'nearest',
                intersect: false,
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    color: darkMode ? '#eee' : '#222',
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                  },
                },
                tooltip: {
                  enabled: true,
                  mode: 'nearest',
                  intersect: false,
                },
              },
              scales: {
                x: {
                  ticks: { color: darkMode ? '#eee' : '#222' },
                  grid: { color: darkMode ? '#333' : '#ddd' },
                },
                y: {
                  ticks: { color: darkMode ? '#eee' : '#222' },
                  grid: { color: darkMode ? '#333' : '#ddd' },
                },
              },
            }}
            height={400}
          />
        ) : (
          <p>Loading chart data...</p>
        )}
      </section>
    </div>
  );
}
