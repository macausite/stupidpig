import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';


function MyApp({ Component, pageProps }) {
  const [coins, setCoins] = useState(0);
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState('Employee #9527');

  useEffect(() => {
    // Initialize user metrics from localstorage
    const localCoins = localStorage.getItem('stupidpig_user_coins') || '100';
    const localPoints = localStorage.getItem('stupidpig_user_points') || '0';
    
    setCoins(parseInt(localCoins));
    setPoints(parseInt(localPoints));
  }, []);

  const handleUpdateCoins = (amount) => {
    const nextCoins = coins + amount;
    setCoins(nextCoins);
    localStorage.setItem('stupidpig_user_coins', nextCoins.toString());
  };

  const handleUpdatePoints = (amount) => {
    const nextPoints = points + amount;
    setPoints(nextPoints);
    localStorage.setItem('stupidpig_user_points', nextPoints.toString());
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Component
        {...pageProps}
        userCoins={coins}
        userPoints={points}
        username={username}
        onUpdateCoins={handleUpdateCoins}
        onUpdatePoints={handleUpdatePoints}
      />
    </>
  );
}

export default MyApp;
