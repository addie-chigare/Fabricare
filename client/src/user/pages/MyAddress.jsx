import { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

const MyAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Load Addresses
  const loadAddresses = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/v1/address/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAddresses(data);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  // First Load
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Handle Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update Address
  const saveAddress = async () => {
    try {
      if (editId) {
        await axios.put(
          `http://localhost:8000/api/v1/address/update/${editId}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:8000/api/v1/address/add",
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      alert(
        editId ? "Address Updated Successfully" : "Address Added Successfully",
      );
      loadAddresses();

      setForm({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });

      setEditId(null);
    } catch (err) {
      console.log(err);
      alert("Failed to save address");
    }
  };

  // Delete Address
  const deleteAddress = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/address/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Address Deleted Successfully");
      loadAddresses();
    } catch (err) {
      console.log(err);
      alert("Failed to delete address");
    }
  };

  // Edit Address
  const editAddress = (addr) => {
    setForm(addr);
    setEditId(addr._id);
  };

  // Set Default Address
  const setDefault = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/address/default/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Address Set as Default");
      loadAddresses();
    } catch (err) {
      console.log(err);
      alert("Failed to set default address");
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-3">My Addresses</h3>

      <Form>
        <Form.Control
          placeholder="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="mb-2"
        />

        <Form.Control
          placeholder="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="mb-2"
        />

        <Form.Control
          placeholder="Address"
          name="addressLine"
          value={form.addressLine}
          onChange={handleChange}
          className="mb-2"
        />

        <Form.Control
          placeholder="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          className="mb-2"
        />

        <Form.Control
          placeholder="State"
          name="state"
          value={form.state}
          onChange={handleChange}
          className="mb-2"
        />

        <Form.Control
          placeholder="Pincode"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          className="mb-3"
        />

        <Button onClick={saveAddress}>
          {editId ? "Update Address" : "Add Address"}
        </Button>
      </Form>

      <hr />

      {addresses.map((addr) => (
        <Card key={addr._id} className="p-3 mb-3">
          <b>{addr.fullName}</b>

          <div>{addr.phone}</div>

          <div>{addr.addressLine}</div>

          <div>
            {addr.city}, {addr.state} - {addr.pincode}
          </div>

          {addr.isDefault && (
            <span className="badge bg-success mt-1">Default</span>
          )}

          <div className="mt-2">
            <Button
              size="sm"
              variant="warning"
              className="me-2"
              onClick={() => editAddress(addr)}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              className="me-2"
              onClick={() => deleteAddress(addr._id)}
            >
              Delete
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setDefault(addr._id)}
            >
              Set Default
            </Button>
          </div>
        </Card>
      ))}
    </Container>
  );
};

export default MyAddress;
