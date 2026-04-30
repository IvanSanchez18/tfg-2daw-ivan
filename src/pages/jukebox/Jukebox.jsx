import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SongCard from "../../components/jukebox/SongCard";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { getEnabledTracksForUser, updateTrackEnabledForUser } from "../../services/apiService";
import "./jukebox.scss";
import { supabase } from "../../services/supabaseClient";

const Jukebox = () => {
  const { t, i18n } = useTranslation("jukebox");
  const navigate = useNavigate();
  const { playSongExternally, updateGlobalPlaylist } = useOutletContext();
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const tracks = await getEnabledTracksForUser(user.id);
        tracks.sort((a, b) => a.title.localeCompare(b.title));

        setSongs(tracks);
        setPlaylist(tracks.filter((t) => t.enabled).map((t) => t.id));
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const toggleSong = async (id) => {
    const isSelected = playlist.includes(id);

    if (isSelected && playlist.length === 1) {
      return;
    }

    const newPlaylist = isSelected
      ? playlist.filter((songId) => songId !== id)
      : [...playlist, id];

    setPlaylist(newPlaylist);

    await updateTrackEnabledForUser(id, !isSelected);

    if (updateGlobalPlaylist) {
      const fullPlaylistData = songs.filter(song => newPlaylist.includes(song.id));
      updateGlobalPlaylist(fullPlaylistData);
    }
  };

  return (
    <>
      <LoadingScreen active={loading} />

      {!loading && (
        <div className="jukebox-container">
          <div className="jukebox-header">
            <button className="back-button" onClick={() => navigate(-1)}>
              {t("back")}
            </button>
          </div>

          <div className="jukebox">
            {songs.map((song) => {
              const isSelected = playlist.includes(song.id);
              const isLastSelected = isSelected && playlist.length === 1;

              return (
                <SongCard
                  key={song.id}
                  song={song}
                  selected={isSelected}
                  disabled={isLastSelected}
                  onToggle={toggleSong}
                  onPlay={() => playSongExternally(song)}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Jukebox;