import {
  Breadcrumbs,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import bg from "../../assets/images/bg.svg";
import { useCart } from "react-use-cart";
import { FaTrash } from "react-icons/fa";
import { CheckOut } from "../../components/buttons/Button";
import { toast, Zoom } from "react-toastify";

const CartPage = () => {
  const { isEmpty, items, removeItem, emptyCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 70,
    },
    {
      field: "product",
      headerName: "Product",
      width: 70,
    },
    {
      field: "price",
      headerName: "Price",
      width: 70,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 70,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      width: 70,
    },
  ];
  const handleDelete = (id) => {
    // console.log(id);
    removeItem(id);
  };
  const rows = items.map((item, index) => ({
    id: item.id,
    image: item.image,
    product: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: (item.price * item.quantity).toFixed(2),
  }));

  const handleCheckout = () => {
    if (!isEmpty) {
      navigate("/checkout");
    }
    toast.error("Đừng cố nữa không vào được đâu", {
      position: "top-center",
      transition: Zoom,
    });
  };

  return (
    <>
      <div className="CartHeader">
        <div className="headerPage relative text-center">
          <img
            className="w-screen h-64 object-cover"
            src={bg}
            alt="Background"
          />
          <div className="headerName w-full absolute top-0 left-0 flex flex-col items-center justify-center h-full">
            <h1 className="font-poppins font-semibold text-2xl text-black">
              Cart
            </h1>
            {/* Updated Breadcrumbs */}
            <div className="breadcrumbs mt-4">
              <Breadcrumbs aria-label="breadcrumb" className="text-black">
                <Link
                  to="/"
                  className="font-semibold font-poppins text-black hover:text-blue-600"
                >
                  Home
                </Link>
                <Typography color="textPrimary" className="font-poppins">
                  Cart
                </Typography>
              </Breadcrumbs>
            </div>
          </div>
        </div>
      </div>
      <div className="CartContext">
        <div className="grid grid-cols-10 p-10">
          <div className="col-span-6">
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650, fontFamily: "Poppins", border: "none" }}
              >
                <TableHead
                  sx={{
                    backgroundColor: "#297FFD",
                  }}
                >
                  <TableRow>
                    {columns.map((header, index) => (
                      <TableCell key={index}>{header.headerName}</TableCell>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isEmpty ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="h6" color="text.secondary">
                          "Your cart is empty."
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>
                          <img
                            src={data.image}
                            className="h-14"
                            alt="Product"
                          />
                        </TableCell>
                        <TableCell sx={{ color: "gray" }}>
                          {data.product}
                        </TableCell>
                        <TableCell sx={{ color: "gray" }}>
                          {data.price}
                        </TableCell>
                        <TableCell>{data.quantity}</TableCell>
                        <TableCell>{data.subtotal}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDelete(data.id)} // Correctly pass the item ID here
                            size="medium"
                            color="secondary"
                            sx={{ marginLeft: "auto" }}
                          >
                            <FaTrash className="text-2xl" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className="col-span-4">
            <div className="checkout border-black border-2 m-5 text-center font-poppins">
              <h1 className="text-5xl font-bold pt-10">Cart total</h1>
              <div className="money px-56 space-y-5 my-10 font-semibold">
                <div className="subtotal flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-blueOcean">{cartTotal.toFixed(2)}$</p>
                </div>
                <div className="total flex justify-between">
                  <p>Total</p>
                  <p className="text-blueOcean">{cartTotal.toFixed(2)}$</p>
                </div>
                <div className="btnCheckout">
                  <CheckOut
                    context={"Checkout"}
                    handleClick={handleCheckout}
                    isEmpty={isEmpty}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
