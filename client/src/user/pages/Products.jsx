import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Offcanvas, Badge, Breadcrumb, Spinner } from "react-bootstrap";
import { useSearchParams, Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes, FaUndo, FaSlidersH, FaSortAmountDown } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import API from "../../services/api";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParamVal = searchParams.get("category") || "";
  const searchParamVal = searchParams.get("search") || "";

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(10000);
  const [sortOrder, setSortOrder] = useState("");

  // Pagination & Layout States
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const productsPerPage = 12;

  // 🔥 Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get("/products/public"),
        API.get("/categories"),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync SearchParams with local states
  useEffect(() => {
    setSearch(searchParamVal);
    setCategoryFilter(categoryParamVal);
    setCurrentPage(1);
  }, [searchParamVal, categoryParamVal]);

  // Set initial price range slider max once products are loaded
  useEffect(() => {
    const activeProducts = categoryParamVal
      ? products.filter((p) => p.category === categoryParamVal)
      : products;

    if (activeProducts.length > 0) {
      const prices = activeProducts.map((p) => {
        const discountVal = p.discount || 0;
        return discountVal > 0 ? p.price - (p.price * discountVal) / 100 : p.price;
      });
      setSelectedMaxPrice(Math.ceil(Math.max(...prices)));
    }
  }, [products, categoryParamVal]);

  // Sync Category Filter to URL
  const handleCategoryChange = (slug) => {
    setCategoryFilter(slug);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set("category", slug);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  // Sync Search to URL
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("search", val);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  // Filter option extraction logic:
  // We extract possible filter values dynamically based on the current category
  const categoryProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  const availableBrands = [...new Set(categoryProducts.map((p) => p.brand || "Fabricare Signature"))].filter(Boolean);
  const availableSizes = [...new Set(categoryProducts.flatMap((p) => p.sizes || []))].filter(Boolean);
  const availableColors = [...new Set(categoryProducts.flatMap((p) => p.colors || []))].filter(Boolean);

  const calculatedPrices = categoryProducts.map((p) => {
    const discountVal = p.discount || 0;
    return discountVal > 0 ? p.price - (p.price * discountVal) / 100 : p.price;
  });

  const minPrice = calculatedPrices.length > 0 ? Math.floor(Math.min(...calculatedPrices)) : 0;
  const maxPrice = calculatedPrices.length > 0 ? Math.ceil(Math.max(...calculatedPrices)) : 10000;

  // Toggle filter lists
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  // Reset Sub-filters
  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedDiscount("");
    setSelectedMaxPrice(maxPrice);
    setSortOrder("");
    setCurrentPage(1);
  };

  // Reset everything including search and category
  const clearAllFilters = () => {
    resetFilters();
    setSearch("");
    setCategoryFilter("");
    setSearchParams({});
  };

  // Color Swatch Hex Helper
  const getColorHex = (colorName) => {
    const colorsMap = {
      "navy blue": "#1e3a8a",
      "navy": "#1e3a8a",
      "charcoal gray": "#4b5563",
      "charcoal": "#4b5563",
      "pure white": "#ffffff",
      "white": "#ffffff",
      "black": "#0f172a",
      "pure black": "#000000",
      "gray": "#94a3b8",
      "grey": "#94a3b8",
      "red": "#ef4444",
      "blue": "#3b82f6",
      "green": "#10b981",
      "yellow": "#f59e0b",
      "pink": "#ec4899",
      "orange": "#f97316",
      "purple": "#8b5cf6",
      "brown": "#78350f",
      "beige": "#f5f5dc",
      "olive": "#808000"
    };
    return colorsMap[colorName.toLowerCase().trim()] || null;
  };

  // Apply filters
  let filteredProducts = [...categoryProducts];

  // 1. Search (matches Name, Brand, Category Slug, or Category Name)
  if (search) {
    const q = search.toLowerCase();
    filteredProducts = filteredProducts.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(q);
      const brandMatch = p.brand?.toLowerCase().includes(q);
      const categoryMatch = p.category?.toLowerCase().includes(q);
      const categoryObj = categories.find((cat) => cat.slug === p.category);
      const categoryNameMatch = categoryObj ? categoryObj.name?.toLowerCase().includes(q) : false;
      return nameMatch || brandMatch || categoryMatch || categoryNameMatch;
    });
  }

  // 2. Brands filter
  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedBrands.includes(p.brand || "Fabricare Signature")
    );
  }

  // 3. Price Filter (matches Selling Price)
  if (selectedMaxPrice !== undefined) {
    filteredProducts = filteredProducts.filter((p) => {
      const sellingPrice = p.discount > 0 ? p.price - (p.price * p.discount) / 100 : p.price;
      return sellingPrice <= selectedMaxPrice;
    });
  }

  // 4. Sizes filter
  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.sizes && p.sizes.some((size) => selectedSizes.includes(size))
    );
  }

  // 5. Colors filter
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.colors && p.colors.some((color) => selectedColors.includes(color))
    );
  }

  // 6. Discount filter
  if (selectedDiscount) {
    const minPct = parseInt(selectedDiscount);
    filteredProducts = filteredProducts.filter((p) => (p.discount || 0) >= minPct);
  }

  // Apply sorting
  if (sortOrder === "low") {
    filteredProducts.sort((a, b) => {
      const aPrice = a.discount > 0 ? a.price - (a.price * a.discount) / 100 : a.price;
      const bPrice = b.discount > 0 ? b.price - (b.price * b.discount) / 100 : b.price;
      return aPrice - bPrice;
    });
  } else if (sortOrder === "high") {
    filteredProducts.sort((a, b) => {
      const aPrice = a.discount > 0 ? a.price - (a.price * a.discount) / 100 : a.price;
      const bPrice = b.discount > 0 ? b.price - (b.price * b.discount) / 100 : b.price;
      return bPrice - aPrice;
    });
  } else if (sortOrder === "newest") {
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Banner Content Lookups
  const categoryObj = categories.find((c) => c.slug === categoryFilter);
  const titleText = categoryObj ? categoryObj.name : "All Products";
  const subtitleText = categoryObj
    ? categoryObj.type === "men"
      ? "Men's Premium Collection"
      : "Kids' Comfortable Collection"
    : "Fabricare Signature Collection";

  // Check if any sub-filter is active
  const isSubFilterActive =
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedDiscount !== "" ||
    (maxPrice > minPrice && selectedMaxPrice < maxPrice);

  // Render Filters inside a component for reusability (desktop & mobile offcanvas)
  const renderFilterWidgets = () => (
    <div className="filter-widgets-container pe-lg-3">
      {/* Categories Widget */}
      <div className="mb-4 pb-4 border-bottom">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Categories</h6>
        <div className="d-flex flex-column gap-1">
          <button
            onClick={() => handleCategoryChange("")}
            className={`btn btn-sm text-start py-2 px-2.5 rounded-3 border-0 transition mb-2 ${
              !categoryFilter ? "fw-bold text-primary bg-light-blue" : "text-muted bg-transparent"
            }`}
            style={{
              fontSize: "0.85rem",
              backgroundColor: !categoryFilter ? "rgba(99, 102, 241, 0.08)" : "transparent"
            }}
          >
            All Collection
          </button>

          {/* Men's Wear Section */}
          <div className="small fw-bold text-dark text-uppercase tracking-wider mb-2 mt-1" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
            🙋‍♂️ Men&apos;s Wear
          </div>
          <div className="d-flex flex-column gap-1 ps-2 mb-3 border-start">
            {categories.filter(cat => cat && cat.type === "men").map((cat) => {
              const isSelected = categoryFilter === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`btn btn-sm text-start py-1.5 px-2.5 rounded-3 border-0 transition ${
                    isSelected ? "fw-bold text-primary bg-light-blue" : "text-muted bg-transparent"
                  }`}
                  style={{
                    fontSize: "0.82rem",
                    backgroundColor: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent"
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Kids' Wear Section */}
          <div className="small fw-bold text-dark text-uppercase tracking-wider mb-2 mt-1" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
            👧 Kids&apos; Wear
          </div>
          <div className="d-flex flex-column gap-1 ps-2 border-start">
            {categories.filter(cat => cat && cat.type === "kids").map((cat) => {
              const isSelected = categoryFilter === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`btn btn-sm text-start py-1.5 px-2.5 rounded-3 border-0 transition ${
                    isSelected ? "fw-bold text-primary bg-light-blue" : "text-muted bg-transparent"
                  }`}
                  style={{
                    fontSize: "0.82rem",
                    backgroundColor: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent"
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brands Widget */}
      <div className="mb-4 pb-4 border-bottom">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Brand</h6>
        {availableBrands.length > 0 ? (
          <div className="d-flex flex-column gap-2" style={{ maxHeight: "160px", overflowY: "auto" }}>
            {availableBrands.map((brand) => (
              <Form.Check
                key={brand}
                type="checkbox"
                id={`brand-${brand.replace(/\s+/g, "-")}`}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="small fw-medium text-muted cursor-pointer"
              />
            ))}
          </div>
        ) : (
          <p className="text-muted smaller mb-0">No brands found</p>
        )}
      </div>

      {/* Price Slider Widget */}
      <div className="mb-4 pb-4 border-bottom">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Price Range</h6>
        {maxPrice > minPrice ? (
          <div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted font-monospace">₹{minPrice}</span>
              <span className="text-primary fw-bold font-monospace">Up to ₹{selectedMaxPrice}</span>
            </div>
            <Form.Range
              min={minPrice}
              max={maxPrice}
              value={selectedMaxPrice}
              onChange={(e) => {
                setSelectedMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ accentColor: "var(--primary)" }}
            />
            <div className="row g-2 mt-2">
              <div className="col-6">
                <span className="text-muted smaller d-block mb-1">MIN</span>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">₹</span>
                  <input type="text" className="form-control border-start-0 font-monospace bg-light" value={minPrice} disabled />
                </div>
              </div>
              <div className="col-6">
                <span className="text-muted smaller d-block mb-1">MAX</span>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0 font-monospace"
                    min={minPrice}
                    max={maxPrice}
                    value={selectedMaxPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSelectedMaxPrice(val > maxPrice ? maxPrice : val < minPrice ? minPrice : val);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted smaller mb-0">Single price point: ₹{minPrice}</p>
        )}
      </div>

      {/* Size Widget */}
      <div className="mb-4 pb-4 border-bottom">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Size</h6>
        {availableSizes.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`btn btn-sm d-flex align-items-center justify-content-center rounded-3 border transition ${
                    isSelected ? "border-primary bg-primary text-white" : "border-light bg-white text-dark"
                  }`}
                  style={{
                    minWidth: "40px",
                    height: "40px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-muted smaller mb-0">No sizes found</p>
        )}
      </div>

      {/* Color Widget */}
      <div className="mb-4 pb-4 border-bottom">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Color</h6>
        {availableColors.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const hex = getColorHex(color);
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-1.5 border transition ${
                    isSelected ? "border-primary text-primary" : "border-light bg-white text-dark"
                  }`}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent"
                  }}
                >
                  {hex && (
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: hex,
                        border: hex === "#ffffff" ? "1px solid #cbd5e1" : "none",
                        display: "inline-block"
                      }}
                    />
                  )}
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-muted smaller mb-0">No colors found</p>
        )}
      </div>

      {/* Discount Widget */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 text-uppercase text-muted small" style={{ letterSpacing: "0.05em" }}>Discount</h6>
        <div className="d-flex flex-column gap-2">
          {[
            { label: "All Discounts", value: "" },
            { label: "10% Off & More", value: "10" },
            { label: "20% Off & More", value: "20" },
            { label: "30% Off & More", value: "30" },
            { label: "50% Off & More", value: "50" }
          ].map((opt) => (
            <Form.Check
              key={opt.value}
              type="radio"
              id={`discount-${opt.value || 'all'}`}
              label={opt.label}
              name="discountFilter"
              checked={selectedDiscount === opt.value}
              onChange={() => {
                setSelectedDiscount(opt.value);
                setCurrentPage(1);
              }}
              className="small fw-medium text-muted cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* Reset Filter Button */}
      {isSubFilterActive && (
        <Button
          variant="outline-secondary"
          size="sm"
          className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3"
          onClick={resetFilters}
        >
          <FaUndo size={11} />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );

  return (
    <Container className="py-4 py-md-5">
      {/* BREADCRUMB */}
      <Breadcrumb className="mb-4 small">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        {categoryFilter ? (
          <>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>Products</Breadcrumb.Item>
            <Breadcrumb.Item active className="text-capitalize">{titleText}</Breadcrumb.Item>
          </>
        ) : (
          <Breadcrumb.Item active>Products</Breadcrumb.Item>
        )}
      </Breadcrumb>

      {/* CATEGORY BANNER HERO */}
      <div className="p-4 p-md-5 rounded-4 mb-5 position-relative overflow-hidden border shadow-sm bg-white" style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(236, 72, 153, 0.04) 100%)",
      }}>
        <div className="position-relative z-1">
          <span className="text-primary text-uppercase tracking-wider fw-bold smaller mb-2 d-inline-block" style={{ letterSpacing: "0.1em" }}>
            {subtitleText}
          </span>
          <h1 className="fw-bold text-dark display-5 mb-2 text-capitalize">{titleText}</h1>
          <p className="text-muted mb-0">{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found</p>
        </div>
        <div className="position-absolute rounded-circle bg-primary opacity-25" style={{ width: "300px", height: "300px", right: "-100px", top: "-100px", filter: "blur(70px)", zIndex: 0 }}></div>
        <div className="position-absolute rounded-circle bg-secondary opacity-25" style={{ width: "200px", height: "200px", left: "-50px", bottom: "-50px", filter: "blur(60px)", zIndex: 0 }}></div>
      </div>

      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted small">Loading catalog, please wait...</p>
        </div>
      ) : (
        <Row className="gy-4">
          {/* DESKTOP FILTER SIDEBAR */}
          <Col lg={3} className="d-none d-lg-block">
            <div style={{ position: "sticky", top: "100px", maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
              {/* Local Search Input */}
              <div className="position-relative mb-4">
                <Form.Control
                  type="text"
                  placeholder="Search in page..."
                  className="py-2.5 ps-4 pe-5 rounded-4 border-light bg-light"
                  style={{ fontSize: "0.85rem" }}
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">
                  <FaSearch size={13} />
                </span>
              </div>

              {renderFilterWidgets()}
            </div>
          </Col>

          {/* MAIN PRODUCTS PANEL */}
          <Col lg={9}>
            {/* TOOLBAR (Mobile Filters Trigger, Sorting, View Info) */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white p-3 rounded-4 shadow-sm border mb-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline-dark"
                className="d-lg-none d-flex align-items-center gap-2 py-2 px-3 rounded-3"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <FaSlidersH size={13} />
                <span className="small fw-semibold">Filters</span>
                {isSubFilterActive && <Badge bg="primary" pill className="ms-1 smaller">✓</Badge>}
              </Button>

              <div className="d-none d-sm-block">
                <span className="text-muted small">
                  Showing <strong className="text-dark">{filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}</strong>–
                  <strong className="text-dark">{Math.min(indexOfLastProduct, filteredProducts.length)}</strong> of{" "}
                  <strong className="text-dark">{filteredProducts.length}</strong> items
                </span>
              </div>

              {/* Sorting Select */}
              <div className="d-flex align-items-center gap-2 ms-auto ms-lg-0">
                <span className="d-none d-md-inline text-muted small"><FaSortAmountDown className="me-1" size={12} /> Sort By:</span>
                <Form.Select
                  className="py-2 border bg-white rounded-3 shadow-none fw-semibold text-muted text-capitalize"
                  style={{ minWidth: "160px", fontSize: "0.8rem", cursor: "pointer" }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Default Sorting</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="newest">Newest Arrival</option>
                </Form.Select>
              </div>
            </div>

            {/* ACTIVE FILTERS CHIPS LIST */}
            {(isSubFilterActive || search) && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span className="text-muted smaller fw-bold uppercase">Active Filters:</span>
                
                {search && (
                  <Badge bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Search: &quot;{search}&quot;
                    <FaTimes className="cursor-pointer text-danger" onClick={() => handleSearchChange("")} />
                  </Badge>
                )}

                {selectedBrands.map((b) => (
                  <Badge key={b} bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Brand: {b}
                    <FaTimes className="cursor-pointer text-danger" onClick={() => toggleBrand(b)} />
                  </Badge>
                ))}

                {(maxPrice > minPrice && selectedMaxPrice < maxPrice) && (
                  <Badge bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Under ₹{selectedMaxPrice.toLocaleString()}
                    <FaTimes className="cursor-pointer text-danger" onClick={() => setSelectedMaxPrice(maxPrice)} />
                  </Badge>
                )}

                {selectedSizes.map((s) => (
                  <Badge key={s} bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Size: {s}
                    <FaTimes className="cursor-pointer text-danger" onClick={() => toggleSize(s)} />
                  </Badge>
                ))}

                {selectedColors.map((c) => (
                  <Badge key={c} bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Color: {c}
                    <FaTimes className="cursor-pointer text-danger" onClick={() => toggleColor(c)} />
                  </Badge>
                ))}

                {selectedDiscount && (
                  <Badge bg="light" text="dark" className="border d-flex align-items-center gap-2 py-1.5 px-2.5 rounded-pill font-monospace smaller fw-medium">
                    Discount: {selectedDiscount}%+
                    <FaTimes className="cursor-pointer text-danger" onClick={() => setSelectedDiscount("")} />
                  </Badge>
                )}

                <button
                  onClick={clearAllFilters}
                  className="btn btn-link text-danger p-0 ms-auto text-decoration-none smaller fw-bold d-flex align-items-center gap-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {currentProducts.length > 0 ? (
              <Row className="gx-3 gy-4">
                {currentProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </Row>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 border my-4 shadow-sm">
                <p className="text-muted fs-5 mb-2">No products match your filters.</p>
                <p className="text-muted small mb-4">Try removing some criteria or checking another category.</p>
                <Button variant="primary" className="px-4 py-2" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Row className="mt-5">
                <Col className="d-flex justify-content-center align-items-center gap-2">
                  <Button
                    variant="outline-primary"
                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: "36px", height: "36px" }}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    ←
                  </Button>

                  {[...Array(totalPages)].map((_, idx) => (
                    <Button
                      key={idx}
                      variant={currentPage === idx + 1 ? "primary" : "outline-primary"}
                      className="rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{ width: "36px", height: "36px", fontWeight: "600", fontSize: "0.85rem" }}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline-primary"
                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: "36px", height: "36px" }}
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    →
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      )}

      {/* MOBILE FILTERS OFFCANVAS DRAWER */}
      <Offcanvas
        show={mobileFiltersOpen}
        onHide={() => setMobileFiltersOpen(false)}
        placement="start"
        className="offcanvas-mobile-filters"
        style={{ width: "85vw", maxWidth: "400px" }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
            <FaFilter size={14} className="text-primary" /> Filter Options
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="py-4">
          {/* Mobile Local Search */}
          <div className="position-relative mb-4">
            <Form.Control
              type="text"
              placeholder="Search products..."
              className="py-2.5 ps-4 pe-5 rounded-4 border-light bg-light"
              style={{ fontSize: "0.85rem" }}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">
              <FaSearch size={13} />
            </span>
          </div>

          {renderFilterWidgets()}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Products;
