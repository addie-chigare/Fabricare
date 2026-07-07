import { Button, Row, Col, Card } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

 const increaseQty = (item) => {

  if (item.quantity >= item.product?.stock) {
    toast.error("Product is out of stock");
    return;
  }

  updateQuantity(item._id, item.quantity + 1);
};

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">My Cart</h3>

      {cart.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <h5 className="text-muted">Your cart is empty</h5>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="px-5 shadow-sm"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </Button>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <Card className="mb-3 p-3 shadow-sm" key={item._id}>
              <Row className="align-items-center">
                {/* Image */}
                <Col md={2}>
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    style={{ width: "80px" }}
                  />
                </Col>

                {/* Name */}
                <Col md={4}>
                  {item.product ? (
                    <>
                      <h6 className="mb-1">{item.product.name}</h6>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {item.size && (
                          <span className="badge bg-light text-dark border px-2 py-1 fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="badge bg-light text-dark border px-2 py-1 fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                      <p className="text-muted mb-0">₹{item.product.price}</p>
                    </>
                  ) : (
                    <p className="text-danger">Product not available</p>
                  )}
                </Col>

                {/* Quantity */}
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={item.quantity <= 1}
                    onClick={() => decreaseQty(item)}
                  >
                    -
                  </Button>

                  <span className="mx-2 fw-bold">{item.quantity}</span>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={item.quantity >= item.product?.stock}
                    onClick={() => increaseQty(item)}
                  >
                    +
                  </Button>
                </Col>

                {/* Total */}
                <Col md={2}>
                  <strong>₹{(item.product?.price || 0) * item.quantity}</strong>
                </Col>

                {/* Remove */}
                <Col md={2}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}

          {/* Cart Summary */}

          <div className="text-end mt-4">
            <h5>Items: {itemCount}</h5>

            <h4>Total: ₹{total}</h4>

            <Button
              variant="success"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Proceed To Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
