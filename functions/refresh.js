// functions/refresh.js
// Refreshes an expired Spotify access token using the stored refresh token
// Lives at: yoursite.com/refresh

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const refreshToken = url.searchParams.get('token');

  if (!refreshToken) {
    return new Response(JSON.stringify({ error: 'No refresh token provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return new Response(JSON.stringify({ error: tokenData.error_description || 'Refresh failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || refreshToken,
    expires_in: tokenData.expires_in,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
