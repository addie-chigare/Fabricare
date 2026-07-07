import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import API from "../../services/api";

const Products = () => {
  const [searchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";
  const categoryParamVal = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // 🔥 Fetch all products and categories
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/public");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchParamVal) {
      setSearch(searchParamVal);
    }
    if (categoryParamVal) {
      setCategoryFilter(categoryParamVal);
    }
  }, [searchParamVal, categoryParamVal]);

  // 🔥 Filter and sort
  let filteredProducts = [...products];

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === categoryFilter,
    );
  }

  if (sortOrder === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortOrder === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // 🔥 Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <Container className="py-5">
      <div className="mb-5">
        <h2 className="fw-bold mb-1">Our Collection</h2>
        <p className="text-muted small">Quality products delivered to your doorstep</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-5 border">
        <Row className="gy-3 align-items-center">
          <Col lg={4} className="d-none d-lg-block">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: "0.05em" }}>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Find something special..."
                className="py-2 border-0 bg-light rounded-3"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </Form.Group>
          </Col>

          <Col lg={4}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: "0.05em" }}>Category</Form.Label>
              <Form.Select
                className="py-2 border-0 bg-light rounded-3"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.slug || cat}>
                    {cat.name || cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col lg={4}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: "0.05em" }}>Sort By</Form.Label>
              <Form.Select
                className="py-2 border-0 bg-light rounded-3"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Default Sorting</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* PRODUCTS */}
      <Row>
        {currentProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </Row>

      {/* PAGINATION */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-center gap-2">
          <Button
            variant="outline-primary"
            className="rounded-circle"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ←
          </Button>

          {[...Array(totalPages)].map((_, idx) => (
            <Button
              key={idx}
              variant={currentPage === idx + 1 ? "primary" : "outline-primary"}
              className="rounded-circle"
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </Button>
          ))}

          <Button
            variant="outline-primary"
            className="rounded-circle"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            →
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Products;
