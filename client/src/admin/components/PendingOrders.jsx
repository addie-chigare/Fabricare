import { useEffect,useState } from "react"
import axios from "axios"

const PendingOrders = ()=>{

const [orders,setOrders] = useState([])

const token = localStorage.getItem("token")

useEffect(()=>{

axios.get(
"http://localhost:8000/api/v1/orders/dashboard/pending",
{headers:{Authorization:`Bearer ${token}`}}
)
.then(res=>setOrders(res.data))

},[])

return(

<div className="card shadow-sm p-3 mt-4">

<h5>Pending Orders</h5>

<table className="table">

<thead>
<tr>
<th>User</th>
<th>Total</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{orders.map(order=>(
<tr key={order._id}>
<td>{order.user?.username}</td>
<td>₹{order.totalAmount}</td>
<td>
<span className="badge bg-warning">
Pending
</span>
</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

export default PendingOrders
