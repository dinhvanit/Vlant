import { useSelector, useDispatch } from 'react-redux';
import { openAuthModal } from '../features/ui/uiSlice';
// ...

const PostCard = ({ post }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLikeClick = () => {
    if (!userInfo) {
      dispatch(openAuthModal({ type: 'like', postId: post._id }));
    } else {
      console.log('User is logged in, performing like action...');
    }
  };

  return <button onClick={handleLikeClick}>Like</button>;
};