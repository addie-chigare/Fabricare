import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge, Carousel, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaShippingFast, 
  FaRedo, 
  FaShieldAlt, 
  FaTshirt, 
  FaStar, 
  FaWater, 
  FaRegClock, 
  FaCalendarCheck,
  FaChevronRight
} from "react-icons/fa";
import API from "../../services/api";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const MENS_PILLS = [
  { name: "Shirts", slug: "men-shirts" },
  { name: "T-Shirts", slug: "men-t-shirts" },
  { name: "Jeans", slug: "men-jeans" },
  { name: "Trousers", slug: "men-trousers" },
  { name: "Jackets", slug: "men-jackets" },
  { name: "Hoodies", slug: "men-hoodies" },
  { name: "Shorts", slug: "men-shorts" },
  { name: "Ethnic Wear", slug: "men-ethnic-wear" },
  { name: "Footwear", slug: "men-footwear" },
  { name: "Accessories", slug: "men-accessories" }
];

const KIDS_PILLS = [
  { name: "Shirts", slug: "kids-shirts" },
  { name: "T-Shirts", slug: "kids-t-shirts" },
  { name: "Jeans", slug: "kids-jeans" },
  { name: "Shorts", slug: "kids-shorts" },
  { name: "Dresses", slug: "kids-dresses" },
  { name: "School Wear", slug: "kids-school-wear" },
  { name: "Jackets", slug: "kids-jackets" },
  { name: "Night Wear", slug: "kids-night-wear" },
  { name: "Footwear", slug: "kids-footwear" },
  { name: "Accessories", slug: "kids-accessories" }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products/public");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/banners/public");
        setBanners(res.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/settings");
        setSettings(res.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchProducts();
    fetchBanners();
    fetchSettings();
  }, []);

  // Filter collections
  let featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  if (featuredProducts.length === 0) {
    featuredProducts = products.slice(0, 4);
  }

  const mensCollection = products.filter(p => {
    const cat = p.category?.toLowerCase() || "";
    return cat.startsWith("men") || cat.includes("men") && !cat.includes("women");
  }).slice(0, 4);

  const kidsCollection = products.filter(p => {
    const cat = p.category?.toLowerCase() || "";
    return cat.startsWith("kids") || cat.includes("kid");
  }).slice(0, 4);

  const handlePillClick = (slug) => {
    navigate(`/products?category=${slug}`);
  };

  return (
    <div className="pb-5">
      {/* 🚀 HERO SECTION & CAROUSEL */}
      <section className="mb-5 shadow-sm rounded-4 overflow-hidden">
        <Carousel fade interval={4000} controls={true} indicators={true}>
          {banners.length > 0 ? (
            banners.map((banner) => (
              <Carousel.Item key={banner._id} style={{ height: "450px" }} className="bg-dark text-white">
                <div className="h-100 d-flex align-items-center bg-gradient-dark position-relative">
                  <div 
                    className="position-absolute w-100 h-100" 
                    style={{ 
                      backgroundImage: `url(${banner.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.45,
                      zIndex: 0
                    }}
                  />
                  <Container className="position-relative" style={{ zIndex: 1 }}>
                    <Row>
                      <Col md={8} lg={6} className="text-start ps-4 ps-md-5">
                        <Badge bg="warning" className="text-dark mb-3 px-3 py-2 fw-bold text-uppercase">Exclusive Deal</Badge>
                        <h1 className="display-4 fw-bold mb-3 text-white leading-tight">
                          {banner.title}
                        </h1>
                        {banner.subtitle && (
                          <p className="lead mb-4 text-white-50">
                            {banner.subtitle}
                          </p>
                        )}
                        <Button as={Link} to={banner.link || "/products"} variant="primary" size="lg" className="px-4 py-2.5 fw-semibold rounded-3 shadow d-none d-md-inline-block">
                          Shop Now
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </Carousel.Item>
            ))
          ) : (
            <>
              {/* Fallback Slide 1 */}
              <Carousel.Item style={{ height: "450px" }} className="bg-dark text-white">
                <div className="h-100 d-flex align-items-center bg-gradient-dark position-relative">
                  <div 
                    className="position-absolute w-100 h-100" 
                    style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.35,
                      zIndex: 0
                    }}
                  />
                  <Container className="position-relative" style={{ zIndex: 1 }}>
                    <Row>
                      <Col md={8} lg={6} className="text-start ps-4 ps-md-5">
                        <Badge bg="warning" className="text-dark mb-3 px-3 py-2 fw-bold text-uppercase">New Season</Badge>
                        <h1 className="display-4 fw-bold mb-3 text-white leading-tight">
                          Fabricare Fashion
                        </h1>
                        <p className="lead mb-4 text-white-50">
                          Discover our premium organic cotton clothing collections designed for ultimate daily comfort and luxurious style.
                        </p>
                        <Button as={Link} to="/products" variant="primary" size="lg" className="px-4 py-2.5 fw-semibold rounded-3 shadow d-none d-md-inline-block">
                          Explore Catalog
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </Carousel.Item>

              {/* Fallback Slide 2 */}
              <Carousel.Item style={{ height: "450px" }} className="bg-dark text-white">
                <div className="h-100 d-flex align-items-center bg-gradient-dark position-relative">
                  <div 
                    className="position-absolute w-100 h-100" 
                    style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.4,
                      zIndex: 0
                    }}
                  />
                  <Container className="position-relative" style={{ zIndex: 1 }}>
                    <Row>
                      <Col md={8} lg={6} className="text-start ps-4 ps-md-5">
                        <Badge bg="primary" className="mb-3 px-3 py-2 fw-bold text-uppercase">Men's Apparel</Badge>
                        <h1 className="display-4 fw-bold mb-3 text-white leading-tight">
                          Redefine Your Style
                        </h1>
                        <p className="lead mb-4 text-white-50">
                          Make a bold statement with our curated streetwear, jackets, denim, and premium cotton accessories.
                        </p>
                        <Button as={Link} to="/products" variant="primary" size="lg" className="px-4 py-2.5 fw-semibold rounded-3 shadow d-none d-md-inline-block">
                          Shop Men's
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </Carousel.Item>
            </>
          )}
        </Carousel>
      </section>

      {/* 🌟 PREMIUM VALUES BANNER */}
      <Container className="mb-5">
        <Row className="gy-4 text-center">
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover">
              <div className="text-primary mb-3"><FaShippingFast size={36} /></div>
              <h5 className="fw-bold mb-2">Free Express Shipping</h5>
              <p className="text-muted small mb-0">Complimentary delivery straight to your doorstep on orders above ₹999.</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover">
              <div className="text-primary mb-3"><FaRedo size={36} /></div>
              <h5 className="fw-bold mb-2">Hassle-Free Returns</h5>
              <p className="text-muted small mb-0">Worry-free shopping with our customer-first 14-day easy return policy.</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover">
              <div className="text-primary mb-3"><FaShieldAlt size={36} /></div>
              <h5 className="fw-bold mb-2">100% Secure Checkout</h5>
              <p className="text-muted small mb-0">Safe transaction logs through PayPal, credit card, and Cash on Delivery.</p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 🛍️ EXPLORE BY CATEGORIES SECTION */}
      <Container className="mb-5 py-3">
        <div className="text-center mb-4">
          <Badge bg="primary-light" className="text-primary px-3 py-2 text-uppercase fw-bold mb-2">Collections</Badge>
          <h2 className="fw-bold mb-1 text-dark">Explore By Categories</h2>
          <p className="text-muted small">Choose a category to find precisely what you need</p>
        </div>
        <Row className="gy-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3 pb-2 border-bottom text-dark">🙋‍♂️ Men's Wear</h5>
              <div className="d-flex flex-wrap gap-2 category-grid-mobile">
                {MENS_PILLS.map((pill) => (
                  <Button
                    key={pill.slug}
                    variant="light"
                    className="rounded-pill px-3 py-1.5 small fw-semibold border btn-category-pill"
                    onClick={() => handlePillClick(pill.slug)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {pill.name}
                  </Button>
                ))}
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3 pb-2 border-bottom text-dark">👧 Kids' Wear</h5>
              <div className="d-flex flex-wrap gap-2 category-grid-mobile">
                {KIDS_PILLS.map((pill) => (
                  <Button
                    key={pill.slug}
                    variant="light"
                    className="rounded-pill px-3 py-1.5 small fw-semibold border btn-category-pill"
                    onClick={() => handlePillClick(pill.slug)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {pill.name}
                  </Button>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 📦 FEATURED PRODUCTS SECTION */}
      <Container className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1 text-dark fs-4 fs-md-3">Featured Products</h3>
            <p className="text-muted small">Handpicked premium designs, tailored just for you</p>
          </div>
          <Button as={Link} to="/products" variant="link" className="text-decoration-none fw-bold small text-primary d-flex align-items-center gap-1 flex-shrink-0">
            <span>View All</span> <FaChevronRight size={10} />
          </Button>
        </div>
        <Row className="px-1">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)
          ) : (
            <div className="text-center py-4 text-muted small bg-white rounded-4 border w-100">
              No featured products found.
            </div>
          )}
        </Row>
      </Container>

      {/* 👔 MEN'S COLLECTION SECTION */}
      <Container className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1 text-dark fs-4 fs-md-3">Men's Collection</h3>
            <p className="text-muted small">Elevate your daily wardrobe with high comfort wear</p>
          </div>
          <Button as={Link} to="/products?category=men-shirts" variant="link" className="text-decoration-none fw-bold small text-primary d-flex align-items-center gap-1 flex-shrink-0">
            <span>Shop Men's</span> <FaChevronRight size={10} />
          </Button>
        </div>
        <Row className="px-1">
          {mensCollection.length > 0 ? (
            mensCollection.map((p) => <ProductCard key={p._id} product={p} />)
          ) : (
            <div className="text-center py-5 text-muted bg-white rounded-4 border w-100 shadow-sm d-flex flex-column align-items-center justify-content-center">
              <span style={{ fontSize: "1.5rem" }}>👔</span>
              <h6 className="fw-bold mt-2">No Men's Products Loaded</h6>
              <p className="small text-muted mb-0">Use the admin panel to add products with a Men's category.</p>
            </div>
          )}
        </Row>
      </Container>

      {/* 👧 KIDS' COLLECTION SECTION */}
      <Container className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="fw-bold mb-1 text-dark fs-4 fs-md-3">Kids' Collection</h3>
            <p className="text-muted small">Fun, comfortable, and durable styles for children</p>
          </div>
          <Button as={Link} to="/products?category=kids-shirts" variant="link" className="text-decoration-none fw-bold small text-primary d-flex align-items-center gap-1 flex-shrink-0">
            <span>Shop Kids'</span> <FaChevronRight size={10} />
          </Button>
        </div>
        <Row className="px-1">
          {kidsCollection.length > 0 ? (
            kidsCollection.map((p) => <ProductCard key={p._id} product={p} />)
          ) : (
            <div className="text-center py-5 text-muted bg-white rounded-4 border w-100 shadow-sm d-flex flex-column align-items-center justify-content-center">
              <span style={{ fontSize: "1.5rem" }}>👧</span>
              <h6 className="fw-bold mt-2">No Kids' Products Loaded</h6>
              <p className="small text-muted mb-0">Use the admin panel to add products with a Kids' category.</p>
            </div>
          )}
        </Row>
      </Container>

      {/* 🧺 LAUNDRY SERVICE SECTION */}
      <section id="laundry-section" className="py-5 bg-white border-top border-bottom mb-5">
        <Container>
          <div className="text-center max-width-600 mx-auto mb-5">
            <Badge bg="success" className="mb-2 px-3 py-2 text-uppercase fw-bold">Integrated Laundry Service</Badge>
            <h2 className="fw-bold mb-3 text-dark">Premium Care For Your Clothes</h2>
            <p className="text-muted small">
              Keep your outfits fresh, crisp, and hygienic. Book professional washing, dry cleaning, or ironing with a single click right from your doorstep.
            </p>
          </div>

          <Row className="gy-4 mb-5">
            {/* Service 1 */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-light text-center h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
                <div className="text-success mb-3"><FaWater size={40} /></div>
                <h5 className="fw-bold mb-2">Wash & Fold</h5>
                <h3 className="fw-bold text-success mb-3">₹{settings?.laundryWashFoldPrice || 49} <span className="text-muted small fs-6">/ kg</span></h3>
                <p className="text-muted small mb-0">Everyday cotton wear, bedsheets, and towels, gently washed and perfectly folded.</p>
              </Card>
            </Col>

            {/* Service 2 */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-light text-center h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
                <div className="text-success mb-3"><FaTshirt size={40} /></div>
                <h5 className="fw-bold mb-2">Dry Cleaning</h5>
                <h3 className="fw-bold text-success mb-3">₹{settings?.laundryDryCleanPrice || 99} <span className="text-muted small fs-6">/ item</span></h3>
                <p className="text-muted small mb-0">Suits, jackets, silk sarees, and delicate designer dresses treated with solvent care.</p>
              </Card>
            </Col>

            {/* Service 3 */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-light text-center h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
                <div className="text-success mb-3"><FaStar size={40} /></div>
                <h5 className="fw-bold mb-2">Premium Steam Ironing</h5>
                <h3 className="fw-bold text-success mb-3">₹{settings?.laundrySteamIronPrice || 19} <span className="text-muted small fs-6">/ item</span></h3>
                <p className="text-muted small mb-0">Crease-free premium steam press to give your clothes a sharp, professional look.</p>
              </Card>
            </Col>
          </Row>

          {/* Booking CTA / Info Row */}
          <div className="bg-light p-4 rounded-4 shadow-sm">
            <Row className="align-items-center gy-4 text-center text-md-start">
              <Col md={8}>
                <h5 className="fw-bold mb-2 text-dark">How it works:</h5>
                <div className="d-flex flex-wrap gap-4 text-muted small">
                  <div><FaCalendarCheck size={14} className="text-success me-1" /> 1. Select service & schedule pickup</div>
                  <div><FaTshirt size={14} className="text-success me-1" /> 2. We clean with eco-solvents</div>
                  <div><FaRegClock size={14} className="text-success me-1" /> 3. Delivered fresh in 24 hours</div>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <Button onClick={() => alert("Laundry booking page/module under development. Contact Support: hello@fabricare.com")} variant="success" size="lg" className="px-4 py-3 fw-bold rounded-3 shadow">
                  Book Laundry Service
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
