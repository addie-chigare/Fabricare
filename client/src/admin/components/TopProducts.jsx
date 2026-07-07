import { useEffect,useState } from "react"
import axios from "axios"

const TopProducts = ()=>{

const [products,setProducts] = useState([])

const token = localStorage.getItem("token")

useEffect(()=>{

axios.get(
"http://localhost:8000/api/v1/orders/dashboard/top-products",
{headers:{Authorization:`Bearer ${token}`}}
)
.then(res=>setProducts(res.data))

},[])

return(

<div className="card shadow-sm p-3 mt-4">

<h5>Top Selling Products</h5>

<ul className="list-group">

{products.map(p=>(
<li key={p._id} className="list-group-item d-flex justify-content-between">

<span>{p._id}</span>

<span className="badge bg-primary">
{p.totalSold}
</span>

</li>
))}

</ul>

</div>

)

}

export default TopProducts
