import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Perks from "../Perks";

export default function PlacesPage() {
  const { action } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);

  function inputHeader(text) {
    return (
      <h2 className="text-2xl mt-4">{text}</h2>
    );
  }
  
  function inputDescription(text) {
    return (
      <p className="text-gray-500 text-sm">{text}</p>
    );
  }
  
  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }
 async function addPhotosByLink(ev)
  {
    ev.preventDefault();
    const {data:filename}=await axios.post ('/upload-by-link',{link:photoLink});
    setAddedPhotos(prev=>{
      return[...prev,filename];
    });
    setPhotoLink('');
  }
  
  return (
    <div>
      {action !== "new" && (
        <div className="text-center">
          <Link
            className="inline-flex gap-1 bg-red-500 text-white py-2 px-6 rounded-full"
            to={"/account/places/new"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add new place
          </Link>
        </div>
      )}
      {action === "new" && (
        <div>
          <form>
            {preInput('Title','')}

            <input
              type="text"
              value={title} onChange={ev=>setTitle(ev.target.value)}
              placeholder="Mylovely APT (title should be short and catchy)"
            />
            
            {preInput('Address','')}
            <input type="text" placeholder="address" value={address} onChange={ev=>setAddress(ev.target.value)} />

            {preInput('Photos','')}
            <div>
            <input type="text" placeholder="More=Better" value={photoLink} onChange={ev => setPhotoLink(ev.target.value)} />

              <button onClick={addPhotosByLink} className="bg-red-500 rounded-2xl px-4 text-white ">
                Add Photo
              </button>
            </div>
             
            <div className="mt-4 grid gap-2 grid-cols-3 md-gr lg:grid-cols-6">
              {addedPhotos.length>0 && addedPhotos.map(link=>(
                <div>
                  <img className="rounded-2xl" src={'http://localhost:4000/uploads/'+link} alt=""/>
                  </div>
              ))}
              <label className=" cursor-pointer inline-flex gap-1 border bg-transparent rounded-2xl p-8 text-2xl text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                Upload
              </label>
            </div>

            {preInput('Description','')}
            <textarea value={description} onChange={ev=>setDescription(ev.target.value)} placeholder="Describe your property"></textarea>

           <Perks selected={perks} onChange={setPerks}/>

           {preInput('Extra Info','')}
            <textarea value={extraInfo} onChange={ev=>setExtraInfo(ev.target.value)} placeholder="Rules and Restrictions"></textarea>

            {/* <h2 className="text-xl">Check In & Check Out and max guests </h2>
            <p className="text-gray-500">add check in and check out times</p> */}
            <div className="gap-2 grid sm:grid-cols-3">
              <div>
                <h3>Check in time</h3>
                <input value={checkIn} onChange={ev=>setCheckIn(ev.target.value)} type="text" placeholder="12:00 pm"></input>
              </div>
              <div>
                <h3>Check out time</h3>
                <input value={checkOut} onChange={ev=>setCheckOut(ev.target.value)} type="text" placeholder="10:00 am"></input>
              </div>
              <div>
                <h3>Max Guests</h3>
                <input value={maxGuests} onChange={ev=>setMaxGuests(ev.target.value)} type="number" placeholder="5"></input>
              </div>
            </div>
            <div>
              <button className="bg-red-500 text-white w-full py-1 text-center rounded-full">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
