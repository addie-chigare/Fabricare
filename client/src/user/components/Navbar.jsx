import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaHeart,
  FaShoppingBag,
  FaUser,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaTshirt,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import API from "../../services/api";

/* ---------------------------------------------------
   Design tokens — everything below is inline `style`,
   no external CSS file, no extra dependency beyond what
   this project already uses (react-icons, framer-motion).
--------------------------------------------------- */
const COLOR = {
  bg: "#ffffff",
  text: "#0a0a0a",
  textSoft: "#767268",
  border: "#e9e5dd",
  surface: "#f6f4ef",
  surfaceStrong: "#efece4",
  accent: "#9c7a4a",
  accentDark: "#7c5f38",
  danger: "#c0392b",
  dangerSoft: "#fbeceb",
};

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Laundry", href: "/#laundry-section" },
];

const AppNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [hoverId, setHoverId] = useState(null);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [settings, setSettings] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const token = localStorage.getItem("token");

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isDesktop = width >= 992;
  const isSmall = width <= 480;

  const isHover = (id) => hoverId === id;

  /* ---------------------- effects ---------------------- */

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onResize = () => setWidth(window.innerWidth);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await API.get("/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings in Navbar:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    window.addEventListener("settings-updated", fetchSettings);
    return () => window.removeEventListener("settings-updated", fetchSettings);
  }, [fetchSettings]);



  const applyTheme = (t) => {
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.remove("bg-light", "text-dark");
      document.body.classList.add("bg-dark", "text-light");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.remove("bg-dark", "text-light");
      document.body.classList.add("bg-light", "text-dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const loadWishlistCount = useCallback(async () => {
    if (!token) {
      setWishlistCount(0);
      return;
    }
    try {
      const { data } = await API.get("/auth/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("Failed to load wishlist count", err);
    }
  }, [token]);

  useEffect(() => {
    loadWishlistCount();
  }, [loadWishlistCount]);

  // Any page can do: window.dispatchEvent(new Event("wishlist-updated"))
  // right after adding/removing a wishlist item, and this badge refreshes.
  useEffect(() => {
    window.addEventListener("wishlist-updated", loadWishlistCount);
    return () => window.removeEventListener("wishlist-updated", loadWishlistCount);
  }, [loadWishlistCount]);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (search.length > 0) {
        try {
          const res = await API.get(`/products/search?q=${search}`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (err) {
          console.log(err);
        }
      } else {
        setShowSuggestions(false);
      }
    }, 450);
    return () => clearTimeout(delaySearch);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* ---------------------- handlers ---------------------- */

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim() !== "") {
      navigate(`/products?search=${search}`);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCart();
    navigate("/");
    window.location.reload();
  };

  // Profile.jsx renders Details / Password / Addresses / Orders / Wishlist
  // as tabs of ONE page, so every account link routes to /profile with
  // the tab it needs via router state — see Profile.jsx's activeTab state.
  const goToProfileTab = (tab) => {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/profile", { state: { tab } });
  };

  /* ---------------------- styles ---------------------- */

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1050,
    background: COLOR.bg,
    borderBottom: `1px solid ${COLOR.border}`,
    boxShadow: scrolled ? "0 8px 24px -12px rgba(10,10,10,0.14)" : "none",
    transition: `box-shadow 0.3s ${EASE}`,
    fontFamily: FONT_SANS,
  };

  const innerStyle = {
    height: isSmall ? 64 : 76,
    maxWidth: 1360,
    margin: "0 auto",
    padding: isSmall ? "0 14px" : isDesktop ? "0 32px" : "0 20px",
    display: "flex",
    alignItems: "center",
    gap: isDesktop ? 28 : 12,
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: COLOR.text,
    flexShrink: 0,
  };

  const brandWordStyle = {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: isSmall ? "1.35rem" : "1.55rem",
    background: `linear-gradient(90deg, ${COLOR.text}, ${COLOR.accentDark})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const navLinkStyle = (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: COLOR.text,
    fontFamily: FONT_SANS,
    fontSize: "0.8rem",
    fontWeight: 500,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: "10px 2px",
    position: "relative",
  });

  const underlineStyle = (show) => ({
    position: "absolute",
    left: "50%",
    bottom: 4,
    height: 1,
    width: show ? "100%" : 0,
    transform: "translateX(-50%)",
    background: COLOR.accent,
    transition: `width 0.25s ${EASE}`,
  });

  const searchWrapStyle = (focused) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: focused ? COLOR.surfaceStrong : COLOR.surface,
    borderRadius: 999,
    padding: "10px 16px",
    flex: "1 1 auto",
    maxWidth: focused ? 360 : 300,
    marginLeft: "auto",
    position: "relative",
    transition: `max-width 0.25s ${EASE}, background 0.2s ${EASE}`,
  });

  const searchInputStyle = {
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: FONT_SANS,
    fontSize: "0.86rem",
    color: COLOR.text,
    width: "100%",
  };

  const iconBtnStyle = (hovered) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: hovered ? COLOR.surface : "transparent",
    color: COLOR.text,
    cursor: "pointer",
    textDecoration: "none",
    transform: hovered ? "translateY(-1px)" : "none",
    transition: `background 0.18s ${EASE}, transform 0.18s ${EASE}`,
  });

  const badgeStyle = {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    borderRadius: 999,
    background: COLOR.danger,
    color: "#fff",
    fontSize: "0.62rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };

  const dropdownStyle = (open) => ({
    position: "absolute",
    top: "calc(100% + 14px)",
    right: 0,
    minWidth: 210,
    background: COLOR.bg,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 14,
    boxShadow: "0 20px 40px -16px rgba(10,10,10,0.2)",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    opacity: open ? 1 : 0,
    visibility: open ? "visible" : "hidden",
    transform: open ? "translateY(0)" : "translateY(6px)",
    transition: `opacity 0.18s ${EASE}, transform 0.18s ${EASE}`,
    zIndex: 5,
  });

  const dropdownItemStyle = (hovered, danger) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 10px",
    borderRadius: 8,
    fontSize: "0.85rem",
    textDecoration: "none",
    color: danger ? COLOR.danger : COLOR.text,
    border: "none",
    background: hovered ? (danger ? COLOR.dangerSoft : COLOR.surface) : "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: FONT_SANS,
    width: "100%",
  });

  const suggestionListStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: 0,
    right: 0,
    background: COLOR.bg,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 14,
    boxShadow: "0 20px 40px -16px rgba(10,10,10,0.2)",
    overflow: "hidden",
    zIndex: 10,
  };

  const suggestionItemStyle = (hovered) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    cursor: "pointer",
    background: hovered ? COLOR.surface : "transparent",
    borderBottom: `1px solid ${COLOR.border}`,
  });

  const drawerStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(86vw, 340px)",
    background: COLOR.bg,
    zIndex: 1060,
    display: "flex",
    flexDirection: "column",
    transform: menuOpen ? "translateX(0)" : "translateX(100%)",
    transition: `transform 0.32s ${EASE}`,
    boxShadow: "-20px 0 40px -20px rgba(10,10,10,0.25)",
    fontFamily: FONT_SANS,
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(10,10,10,0.4)",
    opacity: menuOpen ? 1 : 0,
    visibility: menuOpen ? "visible" : "hidden",
    transition: `opacity 0.25s ${EASE}`,
    zIndex: 1055,
  };

  const drawerLinkStyle = {
    padding: "14px 16px",
    color: COLOR.text,
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${COLOR.border}`,
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: FONT_SANS,
  };

  const drawerBtnStyle = (solid) => ({
    flex: 1,
    textAlign: "center",
    padding: 12,
    borderRadius: 999,
    fontSize: "0.82rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    textDecoration: "none",
    background: solid ? COLOR.text : "transparent",
    color: solid ? "#fff" : COLOR.text,
    border: `1px solid ${COLOR.text}`,
  });

  /* ---------------------- render ---------------------- */

  return (
    <>
      <header style={headerStyle}>
        <div style={innerStyle}>
          {/* Brand */}
          <Link to="/" style={brandStyle}>
            <img
              src={settings?.logo ? (settings.logo.startsWith("http") || settings.logo.startsWith("/") ? settings.logo : `/${settings.logo}`) : "/logo.png"}
              alt="Fabricare Logo"
              height={isSmall ? 30 : 36}
              style={{ objectFit: "contain" }}
              onError={(e) => { e.target.src = "https://placehold.co/100x100?text=F"; }}
            />
            <span style={brandWordStyle}>{settings?.brandName || "Fabricare"}</span>
          </Link>

          {/* Desktop nav links */}
          {isDesktop && (
            <nav style={{ display: "flex", alignItems: "center", gap: 26, marginLeft: 8 }}>
              {NAV_LINKS.map((item) =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    style={navLinkStyle()}
                    onMouseEnter={() => setHoverId(item.label)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <FaTshirt size={12} /> {item.label}
                    <span style={underlineStyle(isHover(item.label))} />
                  </a>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onMouseEnter={() => setHoverId(item.label)}
                    onMouseLeave={() => setHoverId(null)}
                    style={navLinkStyle()}
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span style={underlineStyle(isHover(item.label) || isActive)} />
                      </>
                    )}
                  </NavLink>
                )
              )}
              {token && (
                <NavLink
                  to="/orders"
                  onMouseEnter={() => setHoverId("orders")}
                  onMouseLeave={() => setHoverId(null)}
                  style={navLinkStyle()}
                >
                  {({ isActive }) => (
                    <>
                      Orders
                      <span style={underlineStyle(isHover("orders") || isActive)} />
                    </>
                  )}
                </NavLink>
              )}
            </nav>
          )}

          {/* Desktop search */}
          {isDesktop && (
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              style={searchWrapStyle(isHover("search"))}
              ref={searchRef}
            >
              <FaSearch size={14} color={COLOR.textSoft} />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  setHoverId("search");
                  if (search.length > 0) setShowSuggestions(true);
                }}
                style={searchInputStyle}
              />

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    style={suggestionListStyle}
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <div
                          key={item._id}
                          style={suggestionItemStyle(isHover(`sug-${item._id}`))}
                          onMouseEnter={() => setHoverId(`sug-${item._id}`)}
                          onMouseLeave={() => setHoverId(null)}
                          onClick={() => {
                            setSearch(item.name);
                            setShowSuggestions(false);
                            navigate(`/product/${item._id}`);
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            width={34}
                            height={34}
                            style={{ objectFit: "cover", borderRadius: 6 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: COLOR.textSoft }}>{item.category}</div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: COLOR.accentDark }}>
                            ₹{item.price}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 14, fontSize: "0.82rem", color: COLOR.textSoft }}>
                        No products found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}

          {/* Icon actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: isDesktop ? 4 : "auto" }}>
            {/* Mobile search toggle */}
            {!isDesktop && (
              <button
                type="button"
                aria-label="Search"
                style={iconBtnStyle(isHover("mobile-search"))}
                onMouseEnter={() => setHoverId("mobile-search")}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                <FaSearch size={16} color={mobileSearchOpen ? COLOR.accent : COLOR.text} />
              </button>
            )}

            {/* Wishlist */}
            {isDesktop && token && (
              <button
                type="button"
                aria-label={`Wishlist, ${wishlistCount} items`}
                style={iconBtnStyle(isHover("wishlist"))}
                onMouseEnter={() => setHoverId("wishlist")}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => navigate("/wishlist")}
              >
                <FaHeart size={17} color={COLOR.danger} />
                {wishlistCount > 0 && <span style={badgeStyle}>{wishlistCount}</span>}
              </button>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Cart, ${cartCount} items`}
              style={iconBtnStyle(isHover("cart"))}
              onMouseEnter={() => setHoverId("cart")}
              onMouseLeave={() => setHoverId(null)}
            >
              <FaShoppingBag size={18} />
              {cartCount > 0 && <span style={{ ...badgeStyle, background: COLOR.accent }}>{cartCount}</span>}
            </Link>

            {/* Theme toggle */}
            {isDesktop && (
              <button
                type="button"
                aria-label="Toggle theme"
                style={iconBtnStyle(isHover("theme"))}
                onMouseEnter={() => setHoverId("theme")}
                onMouseLeave={() => setHoverId(null)}
                onClick={toggleTheme}
              >
                {theme === "dark" ? <FaSun color="#e0a530" size={17} /> : <FaMoon color={COLOR.accentDark} size={16} />}
              </button>
            )}

            {/* Profile / Account */}
            {isDesktop && (
              <div style={{ position: "relative" }} ref={profileRef}>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  style={iconBtnStyle(isHover("profile"))}
                  onMouseEnter={() => setHoverId("profile")}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <FaUser size={17} />
                </button>

                <div style={dropdownStyle(profileOpen)}>
                  {!token ? (
                    <>
                      <Link
                        to="/login"
                        style={dropdownItemStyle(isHover("d-login"))}
                        onMouseEnter={() => setHoverId("d-login")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => setProfileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        style={dropdownItemStyle(isHover("d-register"))}
                        onMouseEnter={() => setHoverId("d-register")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => setProfileOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={dropdownItemStyle(isHover("d-profile"))}
                        onMouseEnter={() => setHoverId("d-profile")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => goToProfileTab("details")}
                      >
                        <FaUser size={13} /> My Profile
                      </button>
                      <button
                        type="button"
                        style={dropdownItemStyle(isHover("d-orders"))}
                        onMouseEnter={() => setHoverId("d-orders")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => goToProfileTab("orders")}
                      >
                        <FaBoxOpen size={13} /> My Orders
                      </button>
                      <button
                        type="button"
                        style={dropdownItemStyle(isHover("d-address"))}
                        onMouseEnter={() => setHoverId("d-address")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => goToProfileTab("addresses")}
                      >
                        <FaMapMarkerAlt size={13} /> My Address
                      </button>
                      <button
                        type="button"
                        style={dropdownItemStyle(isHover("d-wishlist"))}
                        onMouseEnter={() => setHoverId("d-wishlist")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => { setProfileOpen(false); navigate("/wishlist"); }}
                      >
                        <FaHeart size={13} /> Wishlist
                        {wishlistCount > 0 && (
                          <span style={{ marginLeft: "auto", background: COLOR.danger, color: "#fff", borderRadius: 999, fontSize: "0.68rem", padding: "1px 6px" }}>
                            {wishlistCount}
                          </span>
                        )}
                      </button>
                      <div style={{ borderTop: `1px solid ${COLOR.border}`, margin: "6px 0" }} />
                      <button
                        type="button"
                        style={dropdownItemStyle(isHover("d-logout"), true)}
                        onMouseEnter={() => setHoverId("d-logout")}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt size={13} /> Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            {!isDesktop && (
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                style={iconBtnStyle(isHover("burger"))}
                onMouseEnter={() => setHoverId("burger")}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <FaTimes size={20} color={COLOR.danger} /> : <FaBars size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile search overlay */}
        <AnimatePresence>
          {mobileSearchOpen && !isDesktop && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: "hidden",
                borderTop: `1px solid ${COLOR.border}`,
                background: COLOR.bg,
                padding: "14px 16px",
              }}
            >
              <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
                <div style={searchWrapStyle(true)}>
                  <FaSearch size={14} color={COLOR.textSoft} />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    style={searchInputStyle}
                  />
                </div>
              </form>
              {search.length > 0 && showSuggestions && (
                <div style={{ marginTop: 10, borderRadius: 14, overflow: "hidden", border: `1px solid ${COLOR.border}` }}>
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <div
                        key={item._id}
                        style={suggestionItemStyle(isHover(`m-sug-${item._id}`))}
                        onMouseEnter={() => setHoverId(`m-sug-${item._id}`)}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => {
                          setSearch(item.name);
                          setShowSuggestions(false);
                          setMobileSearchOpen(false);
                          navigate(`/product/${item._id}`);
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          width={34}
                          height={34}
                          style={{ objectFit: "cover", borderRadius: 6 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{item.name}</div>
                          <div style={{ fontSize: "0.72rem", color: COLOR.textSoft }}>{item.category}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: COLOR.accentDark }}>₹{item.price}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 14, fontSize: "0.82rem", color: COLOR.textSoft }}>No products found</div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile overlay + drawer */}
      <div style={overlayStyle} onClick={() => setMenuOpen(false)} />

      <aside style={drawerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px",
            borderBottom: `1px solid ${COLOR.border}`,
          }}
        >
          <Link to="/" style={brandStyle} onClick={() => setMenuOpen(false)}>
            <img
              src={settings?.logo ? (settings.logo.startsWith("http") || settings.logo.startsWith("/") ? settings.logo : `/${settings.logo}`) : "/logo.png"}
              alt="Fabricare Logo"
              height={30}
              onError={(e) => { e.target.src = "https://placehold.co/100x100?text=F"; }}
            />
            <span style={{ ...brandWordStyle, fontSize: "1.3rem" }}>{settings?.brandName || "Fabricare"}</span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            style={iconBtnStyle(isHover("drawer-close"))}
            onMouseEnter={() => setHoverId("drawer-close")}
            onMouseLeave={() => setHoverId(null)}
            onClick={() => setMenuOpen(false)}
          >
            <FaTimes size={18} color={COLOR.danger} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", overflowY: "auto", flex: 1, padding: !token ? "24px 0" : "0" }}>
          {!token ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 18px" }}>
              <Link to="/login" style={{
                textAlign: "center",
                padding: 12,
                borderRadius: 999,
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: "transparent",
                color: COLOR.text,
                border: `1px solid ${COLOR.text}`,
                fontFamily: FONT_SANS,
              }} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" style={{
                textAlign: "center",
                padding: 12,
                borderRadius: 999,
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: COLOR.text,
                color: "#fff",
                border: `1px solid ${COLOR.text}`,
                fontFamily: FONT_SANS,
              }} onClick={() => setMenuOpen(false)}>
                Register
              </Link>
              <div style={{ borderTop: `1px solid ${COLOR.border}`, margin: "12px 0" }} />
              <button
                type="button"
                style={{ ...drawerLinkStyle, borderBottom: "none" }}
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <>
                    <FaSun color="#e0a530" size={13} /> Light Mode
                  </>
                ) : (
                  <>
                    <FaMoon color={COLOR.accentDark} size={13} /> Dark Mode
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <Link to="/" style={drawerLinkStyle} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <a href="/#laundry-section" style={drawerLinkStyle} onClick={() => setMenuOpen(false)}>
                <FaTshirt size={13} /> Laundry Service
              </a>

              <button type="button" style={drawerLinkStyle} onClick={() => goToProfileTab("details")}>
                <FaUser size={13} /> My Profile
              </button>
              <Link to="/orders" style={drawerLinkStyle} onClick={() => setMenuOpen(false)}>
                <FaBoxOpen size={13} /> My Orders
              </Link>
              <button type="button" style={drawerLinkStyle} onClick={() => goToProfileTab("addresses")}>
                <FaMapMarkerAlt size={13} /> My Address
              </button>
              <button type="button" style={drawerLinkStyle} onClick={() => { setMenuOpen(false); navigate("/wishlist"); }}>
                <FaHeart size={13} color={COLOR.danger} /> Wishlist
                {wishlistCount > 0 && (
                  <span style={{ marginLeft: "auto", background: COLOR.danger, color: "#fff", borderRadius: 999, fontSize: "0.68rem", padding: "1px 6px" }}>
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                style={drawerLinkStyle}
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <>
                    <FaSun color="#e0a530" size={13} /> Light Mode
                  </>
                ) : (
                  <>
                    <FaMoon color={COLOR.accentDark} size={13} /> Dark Mode
                  </>
                )}
              </button>
            </>
          )}
        </nav>

        {token && (
          <div style={{ padding: "16px 18px 22px", borderTop: `1px solid ${COLOR.border}` }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 12,
                borderRadius: 999,
                border: `1px solid ${COLOR.danger}`,
                background: "transparent",
                color: COLOR.danger,
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default AppNavbar;
