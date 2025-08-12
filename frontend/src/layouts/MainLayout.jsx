import { useSelector, useDispatch } from "react-redux";
import { closeAuthModal } from "../features/ui/uiSlice";
import AuthModal from "../components/auth/AuthModal";

const MainLayout = () => {
  const { isAuthModalOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  return (
    <div>
      {/* Sidebar, Header, etc. */}
      <Outlet />

      {/* Modal xác thực sẽ nằm ở đây */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => dispatch(closeAuthModal())}
      />
    </div>
  );
};

export default MainLayout;