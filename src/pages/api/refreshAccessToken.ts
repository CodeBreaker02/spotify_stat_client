import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Session } from 'next-iron-session';
import withSession from '@/pages/api/session';

interface CustomApiRequest extends NextApiRequest {
  session: Session;
}
export default withSession(async function refreshAccessToken(
  req: CustomApiRequest,
  res: NextApiResponse,
) {
  try {
    const refreshToken = req.session.get('refresh_token');
    console.log('Refreshing access token', refreshToken);
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const authHeader = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
        },
      },
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log('Access token refreshed');

    // Store the tokens in the session
    req.session.set('access_token', access_token);
    req.session.set('refresh_token', refresh_token);
    req.session.set('expires_in', expires_in);
    await req.session.save();

    res.status(200).json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    res.status(500).json({ error: 'Failed to refresh access token' });
  }
});
