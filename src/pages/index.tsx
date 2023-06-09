import { useEffect, useState } from 'react';
import RecentlyPlayedTracks from '@/components/recently-played';
import {
  fetchUserInfo,
  getCurrentlyPlaying,
  getRecentlyPlayed,
} from '@/lib/spotify';

interface User {
  display_name: string;
  images: {
    url: string;
  }[];
}
interface CurrentlyPlaying {
  is_playing: boolean;
  currently_playing_type: string;
  item: {
    artists: {
      name: string;
    }[];
    name: string;
  };
  device: {
    name: string;
  };
}

interface RecentlyPlayed {
  items: {
    played_at: string;
    track: {
      external_urls: {
        spotify: string;
      };
      artists: {
        name: string;
      }[];
      name: string;
      duration_ms: number;
    };
  }[];
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentlyPlaying | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed | null>(
    null,
  );
  const [formattedDuration, setFormattedDuration] = useState<string>('');
  const [activeTab, setActiveTab] = useState('tracks');

  const [selectedOption, setSelectedOption] = useState('Last 4 weeks');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prevIsDropdownOpen) => !prevIsDropdownOpen);
  };

  const handleOptionSelect = (option: any) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/getAccessToken');
        const { accessToken } = await response.json();
        console.log('fetchUser accessToken', accessToken);
        const userInfo = await fetchUserInfo(accessToken);
        console.log(userInfo);
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await fetch('/api/getAccessToken');
        const { accessToken } = await responses.json();
        console.log('fetchData accessToken', accessToken);

        const [currentlyPlayingResponse, recentlyPlayedResponse] =
          await Promise.all([
            getCurrentlyPlaying(accessToken),
            getRecentlyPlayed(accessToken),
          ]);

        console.log(currentlyPlayingResponse, 'currently playing');
        console.log(recentlyPlayedResponse, 'recently played');

        setCurrentlyPlaying(currentlyPlayingResponse);
        setRecentlyPlayed(recentlyPlayedResponse);

        // Calculate and format the duration for currently playing track
        if (currentlyPlayingResponse?.item?.artists[0]?.name) {
          const durationInSeconds = Math.floor(
            currentlyPlayingResponse.item.duration_ms / 1000,
          );
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          setFormattedDuration(
            `${minutes}:${seconds.toString().padStart(2, '0')}`,
          );
        } else if (recentlyPlayedResponse?.items[0]?.track?.name) {
          // Calculate and format the duration for recently played track
          const durationInSeconds = Math.floor(
            recentlyPlayedResponse.items[0].track.duration_ms / 1000,
          );
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          setFormattedDuration(
            `${minutes}:${seconds.toString().padStart(2, '0')}`,
          );
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-5 gap-2 p-2">
      {/* Left column */}
      <div className="col-span-1 flex flex-col">
        <div className="h-32 bg-primary rounded-lg flex items-center overflow-hidden">
          {user && (
            <div className="flex">
              <div className="flex-col p-2 md:max-xl:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.images[0].url}
                  width="60"
                  height="60"
                  alt="User Profile"
                  className="rounded-full max-w-none"
                />
              </div>
              <div className="flex-col p-3">
                <div className="flex flex-row items-center">
                  <p className="text-white font-bold whitespace-nowrap text-xs">
                    Hi,{' '}
                    {user.display_name.length > 10
                      ? `${user.display_name.substring(0, 10)}...`
                      : user.display_name}
                  </p>

                  <p
                    className={`text-white text-[.5rem] font-bold mr-2 ${
                      currentlyPlaying?.is_playing
                        ? 'bg-green-700'
                        : 'bg-gray-700'
                    } rounded-full w-14 h-6 flex items-center justify-center ml-2`}
                  >
                    {currentlyPlaying?.is_playing ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="overflow-hidden">
                  {currentlyPlaying?.currently_playing_type === 'track' && (
                    <div
                      className={`text-white text-left ${
                        currentlyPlaying?.item.name
                          ? 'animation-slide-in-right'
                          : ''
                      }`}
                    >
                      {currentlyPlaying?.item.name} -{' '}
                      {currentlyPlaying?.item.artists[0].name}
                    </div>
                  )}
                  {currentlyPlaying?.currently_playing_type === 'ad' && (
                    <div className="text-white text-left animation-slide-in-right">
                      Advertisement - Advertisement - Advertisement
                    </div>
                  )}
                  {currentlyPlaying?.currently_playing_type === undefined && (
                    <div
                      className={`text-white text-left ${
                        recentlyPlayed?.items[0]?.track.name
                          ? 'animation-slide-in-right'
                          : ''
                      }`}
                    >
                      {recentlyPlayed?.items[0]?.track.artists[0].name} -{' '}
                      {recentlyPlayed?.items[0]?.track.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center ici">
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <progress
                      className="h-full bg-primary"
                      value={50}
                      max={100}
                    />
                  </div>
                  <p className="text-white text-[.6rem] font-thin ml-2">
                    {formattedDuration}
                  </p>
                </div>

                <p className="text-white text-[.6rem] text-left font-bold">
                  {currentlyPlaying?.device
                    ? `On ${currentlyPlaying.device.name}`
                    : 'No device active'}
                </p>
              </div>
            </div>
          )}
        </div>
        <RecentlyPlayedTracks recentlyPlayed={recentlyPlayed} />
      </div>

      {/* Middle column */}
      <div className="col-span-3 flex flex-col">
        <div className="h-32 bg-primary rounded-lg">
          <div className="flex flex-col justify-center h-full">
            <div className="flex justify-between px-5">
              <button
                className={`font-bold px-4 py-2 rounded-full ${
                  activeTab === 'tracks'
                    ? 'active bg-secondary text-white'
                    : 'bg-white'
                }`}
                onClick={() => handleTabClick('tracks')}
              >
                Top Tracks
              </button>
              <button
                className={` font-bold px-4 py-2 rounded-full ${
                  activeTab === 'artists'
                    ? 'active bg-secondary text-white'
                    : 'bg-white'
                }`}
                onClick={() => handleTabClick('artists')}
              >
                Top Artists
              </button>
              <button
                className={` font-bold px-4 py-2 rounded-full ${
                  activeTab === 'playlists'
                    ? 'active bg-secondary text-white'
                    : 'bg-white'
                }`}
                onClick={() => handleTabClick('playlists')}
              >
                Top Playlists
              </button>
            </div>
          </div>
        </div>
        <div className="h-32 bg-primary rounded-lg mt-2 flex-grow">
          <div className={`${activeTab === 'tracks' ? 'active' : 'hidden'}`}>
            <div className="flex justify-center p-3">
              <div>
                <h1 className="pl-2 text-white text-2xl font-bold">
                  Jordan&apos;s Top Tracks
                </h1>
                <div className="flex justify-center p-2">
                  <div className="relative inline-block">
                    <button
                      onClick={handleDropdownToggle}
                      className="text-white hover:bg-gray-200 hover:text-primary focus:ring-4 focus:outline-none font-medium rounded-lg text-xs px-4 py-2.5 text-center inline-flex items-center"
                    >
                      {selectedOption}
                      <svg
                        className="w-4 h-4 ml-2"
                        aria-hidden="true"
                        fill="#443C68"
                        stroke="#443C68"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-10 left-0 w-full bg-white shadow-md rounded-lg text-xs">
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleOptionSelect('Last 4 Weeks')}
                        >
                          Last 4 Weeks
                        </div>
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleOptionSelect('Last 6 Months')}
                        >
                          Last 6 Months
                        </div>
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleOptionSelect('All Time')}
                        >
                          All Time
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${activeTab === 'artists' ? 'active' : 'hidden'}`}>
            2
          </div>
          <div className={`${activeTab === 'playlists' ? 'active' : 'hidden'}`}>
            3
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="col-span-1 flex flex-col">
        <div className="h-64 bg-primary rounded-lg"></div>
        <div className="h-72 bg-primary rounded-lg mt-2 flex-grow"></div>
      </div>

      {/* Bottom column */}
      <div className="col-span-5 rounded-lg bg-primary"></div>
    </div>
  );
}
