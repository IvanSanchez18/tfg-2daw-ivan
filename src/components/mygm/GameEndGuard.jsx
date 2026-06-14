import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const GameEndGuard = ({ session }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (session && session.week > session.max_weeks) {
      navigate(`/mygm/finale/${session.id}`, { replace: true });
    }
  }, [session, navigate]);

  return null;
};

export default GameEndGuard;