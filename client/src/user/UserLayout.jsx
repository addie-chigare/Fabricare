import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const UserLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="container mt-4 flex-grow-1 mb-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
