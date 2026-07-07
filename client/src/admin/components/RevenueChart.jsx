import { LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid } from "recharts"
import { useEffect,useState } from "react"
import axios from "axios"

const RevenueChart = ()=>{

const [data,setData] = useState([])

const token = localStorage.getItem("token")

useEffect(()=>{

axios.get(
"http://localhost:8000/api/v1/orders/dashboard/revenue",
{headers:{Authorization:`Bearer ${token}`}}
)
.then(res=>setData(res.data))

},[])

return(

<div className="card shadow-sm p-3">

<h5>Monthly Revenue</h5>

<LineChart width={600} height={300} data={data}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="_id"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="revenue" stroke="#8884d8"/>
</LineChart>

</div>

)

}

export default RevenueChart
