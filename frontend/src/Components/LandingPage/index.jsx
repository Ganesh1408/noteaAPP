import { Link } from "react-router-dom";



function LandingPage(){

        return(
            <>
            <div className="w-full h-full flex flex-col justify-center items-center mt-6 ">
            <img src="/assets/spot_balls.png" alt='spot_balls'/>
           
            </div>
            <div className=" m-auto p-6 text-center ">
             <h1 className="text-2xl  font-mono md:text-3xl font-semibold lg:text-4xl ">Refine Your Life Management</h1>
             <p className=" text-xl font-mono md:text-2xl  font-medium mt-3  ">A minimalist Notes app which helps you manage your time and be productive, the monochrome design avoids it from being destracting</p>
           
            <Link to="/home" ><button  className=' mx-auto text-xl md:text-2xl w-[230px] h-[44px] md:w-[253px] md:h-[58px] mt-4 bg-black text-white rounded-3xl  '  >Let's start</button></Link>
             <img src="/assets/Logo.png" alt="logo" className="  mt-4 m-auto w-[50px] h-[14px]  md:w-[61px] md:h-[17px] "/>
             
             </div>
             </>
        )



}

export default LandingPage;