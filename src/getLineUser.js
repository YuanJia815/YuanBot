import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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
    console.log('LINE profile pic URL:', res.data.pictureUrl);
    return res.data.pictureUrl || null;
  } catch (error) {
    console.error('Error fetching LINE profile picture:', error);
    return null;
  }
}