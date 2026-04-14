import axios from 'axios';

export const getUserProfilePicture = async(userId) => {
  try {
    const res = await axios.get(
      `https://api.line.me/v2/bot/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    return res.data.pictureUrl || null;
  } catch {
    return null;
  }
}