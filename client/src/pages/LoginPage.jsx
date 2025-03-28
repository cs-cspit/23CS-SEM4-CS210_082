import { Link, Navigate, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(""); // State for storing error message
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
console.log(ev)
    try {
      const { data } = await axios.post("http://localhost:4000/login", { email, password });
      setUser(data);
      console.log("Login successful:", data);
      alert("Login successful");
      setRedirect(true);
    } catch (e) {
      console.error("Login error:", e.response?.data || e.message);
      setError("Login failed. Please check your email and password."); // Set the error message
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="youremail@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password..."
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button className="primary">Login</button>
        </form>

        {error && <div className="text-red-500 text-center mt-2">{error}</div>}

        <div className="text-center py-2 text-gray-500">
          Don't have an account yet?
          <Link className="hover:underline text-black" to={"/register"}>
            {" "}
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}


// import { Link, Navigate , useNavigate} from "react-router-dom";
// import { useContext, useState } from "react";
// import axios from "axios";
// import { UserContext } from "../UserContext";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [redirect, setRedirect] = useState(false);
//    //const { setUser } = UseContext(UserContext);
//   const { setUser } = useContext(UserContext);


//   const navigate = useNavigate();
//   async function handleLoginSubmit(ev) {
//     ev.preventDefault();
//     console.log(ev)
//     try {
//       const { data } = await axios.post("http://localhost:4000/login", { email, password });
//       setUser(data);
//       console.log(data);
//       alert("login successfull");
//       setRedirect(true);
//     } catch (e) {
//       navigate("/login");
//       console.log("Error")
//     }
//   }
//   if (redirect) {
//     return <Navigate to={"/"} />;
//   }

//   return (
//     <div className="mt-4 grow flex items-center justify-around">
//       <div className="mb-64">
//         <h1 className="text-4xl text-center mb-4">Login</h1>
//         <form className="max-w-md mx-auto " onSubmit={handleLoginSubmit}>
//           <input
//             type="email"
//             placeholder="youremail@email.com"
//             value={email}
//             onChange={(ev) => setEmail(ev.target.value)}
//           ></input>
//           <input
//             type="password"
//             placeholder="password..."
//             value={password}
//             onChange={(ev) => setPassword(ev.target.value)}
//           ></input>
//           <button className="primary">Login</button>
//         </form>
//         <div className="text-center py-2 text-gray-500">
//           Don't have account yet?
//           <Link className="hover:underline text-black" to={"/register"}>
//             {" "}
//             Register Now
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
